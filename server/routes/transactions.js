const express = require("express");
const db = require("../db");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();
router.use(authMiddleware);

async function query(sql, params = []) {
  const res = await db.query(sql, params);
  return res.rows;
}

async function queryOne(sql, params = []) {
  const rows = await query(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

// GET /api/transactions
router.get("/", async (req, res) => {
  try {
    const { limit = 50, offset = 0, type, category, wallet_id } = req.query;

    let sql = "SELECT t.*, w.name as wallet_name FROM transactions t LEFT JOIN wallets w ON t.wallet_id = w.id WHERE t.user_id = $1";
    const params = [req.user.id];

    if (type) { params.push(type); sql += ` AND t.type = $${params.length}`; }
    if (category) { params.push(category); sql += ` AND t.category = $${params.length}`; }
    if (wallet_id) { params.push(Number(wallet_id)); sql += ` AND t.wallet_id = $${params.length}`; }

    sql += ` ORDER BY t.created_at DESC, t.date DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(Number(limit), Number(offset));

    const transactions = await query(sql, params);

    const incomeRow = await queryOne(
      "SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE user_id = $1 AND type = 'income'",
      [req.user.id]
    );
    const expenseRow = await queryOne(
      "SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE user_id = $1 AND type = 'expense'",
      [req.user.id]
    );

    res.json({
      transactions,
      summary: {
        totalIncome: Number(incomeRow?.total || 0),
        totalExpense: Number(expenseRow?.total || 0),
      }
    });
  } catch (err) {
    console.error("Get transactions error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// POST /api/transactions
router.post("/", async (req, res) => {
  try {
    const { wallet_id, type, category, amount, note, date } = req.body;

    if (!wallet_id || !type || !category || !amount || !date) {
      return res.status(400).json({ error: "wallet_id, type, category, amount, and date are required." });
    }

    const wallet = await queryOne("SELECT * FROM wallets WHERE id = $1 AND user_id = $2", [wallet_id, req.user.id]);
    if (!wallet) return res.status(404).json({ error: "Wallet not found." });

    // Insert transaction
    const txRes = await db.query(
      "INSERT INTO transactions (user_id, wallet_id, type, category, amount, note, date) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id",
      [req.user.id, wallet_id, type, category, amount, note || null, date]
    );
    const txId = txRes.rows[0].id;

    // Update wallet balance
    if (type === "income") {
      await db.query("UPDATE wallets SET balance = balance + $1 WHERE id = $2", [amount, wallet_id]);
    } else {
      await db.query("UPDATE wallets SET balance = balance - $1 WHERE id = $2", [amount, wallet_id]);
    }

    // Update matching budgets if expense (case-insensitive)
    if (type === "expense") {
      await db.query(
        "UPDATE budgets SET spent = spent + $1 WHERE user_id = $2 AND LOWER(category) = LOWER($3)",
        [amount, req.user.id, category]
      );
    }

    const transaction = await queryOne(
      "SELECT t.*, w.name as wallet_name FROM transactions t LEFT JOIN wallets w ON t.wallet_id = w.id WHERE t.id = $1",
      [txId]
    );
    res.status(201).json({ transaction });
  } catch (err) {
    console.error("Create transaction error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// DELETE /api/transactions/:id
router.delete("/:id", async (req, res) => {
  try {
    const txId = req.params.id;
    const transaction = await queryOne("SELECT * FROM transactions WHERE id = $1 AND user_id = $2", [txId, req.user.id]);
    if (!transaction) return res.status(404).json({ error: "Transaction not found." });

    // Reverse wallet balance
    if (transaction.type === "income") {
      await db.query("UPDATE wallets SET balance = balance - $1 WHERE id = $2", [transaction.amount, transaction.wallet_id]);
    } else {
      await db.query("UPDATE wallets SET balance = balance + $1 WHERE id = $2", [transaction.amount, transaction.wallet_id]);
    }

    // Reverse budget spent
    if (transaction.type === "expense") {
        await db.query(
          "UPDATE budgets SET spent = spent - $1 WHERE user_id = $2 AND category = $3",
          [transaction.amount, req.user.id, transaction.category]
        );
    }

    await db.query("DELETE FROM transactions WHERE id = $1 AND user_id = $2", [txId, req.user.id]);

    res.json({ message: "Transaction deleted successfully." });
  } catch (err) {
    console.error("Delete transaction error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;
