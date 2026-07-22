const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const db = require("../db");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

// Initialize Gemini AI
// Note: User needs to provide GEMINI_API_KEY in .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy_key");

// Helper to fetch user financial context
async function getFinancialContext(userId) {
  try {
    const wallets = await db.query("SELECT name, balance, type FROM wallets WHERE user_id = $1", [userId]);
    const transactions = await db.query(
      "SELECT type, category, amount, date, note FROM transactions WHERE user_id = $1 ORDER BY date DESC LIMIT 20",
      [userId]
    );
    const budgets = await db.query("SELECT category, limit_amount, spent, period FROM budgets WHERE user_id = $1", [userId]);

    return {
      wallets: wallets.rows,
      recentTransactions: transactions.rows,
      budgets: budgets.rows,
    };
  } catch (err) {
    console.error("Failed to fetch financial context:", err);
    return null;
  }
}

// Tools definition for Gemini
const tools = [
  {
    functionDeclarations: [
      {
        name: "record_transaction",
        description: "Records a new financial transaction (expense or income) from the user's message.",
        parameters: {
          type: "OBJECT",
          properties: {
            type: { 
              type: "STRING", 
              enum: ["expense", "income"], 
              description: "The type of transaction: 'expense' (spending money) or 'income' (getting money)." 
            },
            amount: { 
              type: "NUMBER", 
              description: "The numerical amount of the transaction." 
            },
            category: { 
              type: "STRING", 
              description: "The category for this transaction (e.g., Food, Transport, Salary, etc.)." 
            },
            wallet_name: { 
              type: "STRING", 
              description: "The name of the wallet or account used (e.g., GoPay, Bank, Cash)." 
            },
            note: { 
              type: "STRING", 
              description: "A brief description or note about the transaction." 
            },
          },
          required: ["type", "amount", "category", "wallet_name"]
        }
      }
    ]
  }
];

// Implementation of the tools
const toolHandlers = {
  record_transaction: async (args, userId) => {
    const { type, amount, category, wallet_name, note } = args;

    try {
      // 1. Find the wallet by name (case-insensitive)
      const walletRes = await db.query(
        "SELECT id, balance, name FROM wallets WHERE user_id = $1 AND name ILIKE $2 LIMIT 1",
        [userId, `%${wallet_name}%`]
      );

      if (walletRes.rowCount === 0) {
        return { error: `Wallet "${wallet_name}" not found.` };
      }

      const wallet = walletRes.rows[0];

      // 2. Start a DB transaction
      await db.query("BEGIN");

      // 3. Create the transaction
      await db.query(
        "INSERT INTO transactions (user_id, wallet_id, type, category, amount, note, date) VALUES ($1, $2, $3, $4, $5, $6, $7)",
        [userId, wallet.id, type, category, amount, note || null, new Date().toISOString().split('T')[0]]
      );

      // 4. Update the wallet balance
      const newBalance = type === "expense" ? wallet.balance - amount : wallet.balance + amount;
      await db.query("UPDATE wallets SET balance = $1 WHERE id = $2", [newBalance, wallet.id]);

      // 5. Update matching budgets if expense (case-insensitive)
      if (type === "expense") {
        await db.query(
          "UPDATE budgets SET spent = spent + $1 WHERE user_id = $2 AND LOWER(category) = LOWER($3)",
          [amount, userId, category]
        );
      }

      await db.query("COMMIT");

      return { 
        success: true, 
        message: `Successfully recorded ${type} of ${amount} in ${wallet.name}. New balance: ${newBalance}` 
      };
    } catch (err) {
      await db.query("ROLLBACK");
      console.error("Tool execution error:", err);
      return { error: "Failed to record transaction due to a database error." };
    }
  }
};

// POST /api/ai/chat
router.post("/chat", authMiddleware, async (req, res) => {
  const { message } = req.body;
  
  if (!process.env.GEMINI_API_KEY) {
    return res.json({ 
      reply: "I'm ready to help, but I need a Gemini API Key to function! \n\n1. Get a free key at [Google AI Studio](https://aistudio.google.com/app/apikey)\n2. Add it to your `server/.env` file as `GEMINI_API_KEY=your_key`." 
    });
  }

  const context = await getFinancialContext(req.user.id);
  // Re-initialize model with tools
  const model = genAI.getGenerativeModel({ 
    model: "gemini-flash-latest",
    tools: tools
  });

  const chat = model.startChat({
    history: [
      {
        role: "user",
        parts: [{ text: `You are FinAI, a personal financial advisor. System context: ${JSON.stringify(context)}` }]
      },
      {
        role: "model",
        parts: [{ text: "Understood. I am FinAI, your financial assistant. I have access to your data and can record transactions for you." }]
      }
    ],
  });

  try {
    let result = await chat.sendMessage(message);
    let response = result.response;
    let call = response.functionCalls();

    // If AI wants to call a tool
    if (call && call.length > 0) {
      const toolCall = call[0];
      if (toolHandlers[toolCall.name]) {
        const toolResult = await toolHandlers[toolCall.name](toolCall.args, req.user.id);
        
        // Send tool results back to AI
        result = await chat.sendMessage([
          {
            functionResponse: {
              name: toolCall.name,
              response: { content: toolResult },
            },
          },
        ]);
        response = result.response;
      }
    }

    res.json({ reply: response.text() });
  } catch (err) {
    console.error("AI Chat error details:", {
      message: err.message,
      status: err.status,
      stack: err.stack
    });
    if (err.status === 503 || err.status === 429 || err.message.includes("503") || err.message.includes("429")) {
      return res.json({ 
        reply: "Maaf, asisten AI sedang sangat sibuk atau mencapai limit (Rate Limit). Silakan coba lagi sebentar lagi 🙏" 
      });
    }
    res.status(500).json({ error: "Gagal mendapatkan respon AI. Silakan coba lagi nanti." });
  }
});

// POST /api/ai/scan-receipt
router.post("/scan-receipt", authMiddleware, async (req, res) => {
  try {
    const { imageBase64 } = req.body; // Base64 string

    if (!process.env.GEMINI_API_KEY) {
      return res.status(400).json({ error: "Gemini API Key is missing. Please add it to .env" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const prompt = "Extract data from this receipt. Return ONLY a valid JSON object with these keys: merchant (string), amount (number), category (string, pick the best from: Food, Transport, Shopping, Bills, Health, Entertainment, Education, Other), date (string YYYY-MM-DD), note (string, brief summary). If you can't find a value, use null.";

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: imageBase64,
          mimeType: "image/jpeg",
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();
    
    // Clean up markdown if AI returns it
    const jsonStr = text.replace(/```json|```/g, "").trim();
    const data = JSON.parse(jsonStr);

    res.json({ data });
  } catch (err) {
    console.error("AI Scan error details:", {
      message: err.message,
      status: err.status,
      stack: err.stack
    });
    if (err.status === 503 || err.status === 429 || err.message.includes("503") || err.message.includes("429")) {
      return res.status(503).json({ error: "AI sedang sibuk atau mencapai limit. Silakan coba lagi nanti." });
    }
    res.status(500).json({ error: "Gagal memindai struk. Pastikan gambar jelas." });
  }
});

// POST /api/ai/forecast
router.post("/forecast", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    if (!process.env.GEMINI_API_KEY) {
      return res.status(400).json({ error: "Gemini API Key is missing." });
    }

    // 1. Fetch data for analysis
    const budgets = await db.query(
      "SELECT category, limit_amount, spent FROM budgets WHERE user_id = $1 AND limit_amount > 0",
      [userId]
    );

    // Get last 60 days of transactions
    const transactions = await db.query(
      "SELECT category, amount, date FROM transactions WHERE user_id = $1 AND created_at > NOW() - INTERVAL '60 days'",
      [userId]
    );

    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const prompt = `
      You are a Financial Analyst. Today is ${new Date().toISOString().split('T')[0]}.
      Analyze the following data for this user:
      
      Current Monthly Budgets:
      ${JSON.stringify(budgets.rows)}
      
      Recent Transaction History (Last 60 days):
      ${JSON.stringify(transactions.rows)}
      
      Task:
      1. Predict the total spending for each budget category at the end of this month.
      2. Identify categories that are at risk of exceeding the limit (or have already exceeded).
      3. Provide a clear financial health status and 2-3 brief, actionable savings tips.
      
      Return ONLY a valid JSON object in this format:
      {
        "status": "healthy" | "warning" | "critical",
        "summary": "Short 1-sentence overall health summary",
        "atRiskCategories": [
          {
            "name": "Category Name",
            "predictedSpent": number,
            "daysUntilOverflow": number (or null if already over),
            "riskLevel": "high" | "medium"
          }
        ],
        "tips": ["Tip 1", "Tip 2"]
      }
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonStr = text.replace(/```json|```/g, "").trim();
    const forecast = JSON.parse(jsonStr);

    res.json({ forecast });
  } catch (err) {
    console.error("AI Forecast error details:", {
      message: err.message,
      status: err.status,
      stack: err.stack
    });
    if (err.status === 503 || err.status === 429 || err.message.includes("503") || err.message.includes("429")) {
      return res.status(503).json({ error: "AI sedang sibuk atau mencapai limit (Rate Limit). Silakan coba lagi sebentar lagi 🙏" });
    }
    res.status(500).json({ error: "Gagal mendapatkan analisis AI. Silakan coba lagi nanti." });
  }
});

module.exports = router;
