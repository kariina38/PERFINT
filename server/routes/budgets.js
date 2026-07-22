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

// GET /api/budgets
router.get("/", async (req, res) => {
  try {
    const { period } = req.query;
    let sql = "SELECT * FROM budgets WHERE user_id = $1";
    const params = [req.user.id];
    if (period) { 
      params.push(period); 
      sql += ` AND period = $${params.length}`; 
    }
    sql += " ORDER BY created_at ASC";

    const budgets = await query(sql, params);
    res.json({ budgets });
  } catch (err) {
    console.error("Get budgets error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// POST /api/budgets
router.post("/", async (req, res) => {
  try {
    const { category, limit_amount, period, icon, color } = req.body;
    if (!category || !limit_amount || !period) {
      return res.status(400).json({ error: "Category, limit_amount, and period are required." });
    }

    const insertRes = await db.query(
      "INSERT INTO budgets (user_id, category, limit_amount, spent, period, icon, color) VALUES ($1, $2, $3, 0, $4, $5, $6) RETURNING *",
      [req.user.id, category, limit_amount, period, icon || "📊", color || "bg-blue-500"]
    );
    
    res.status(201).json({ budget: insertRes.rows[0] });
  } catch (err) {
    console.error("Create budget error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// PUT /api/budgets/:id
router.put("/:id", async (req, res) => {
  try {
    const { category, limit_amount, spent, period, icon, color } = req.body;
    const budgetId = req.params.id;

    const existing = await queryOne("SELECT * FROM budgets WHERE id = $1 AND user_id = $2", [budgetId, req.user.id]);
    if (!existing) return res.status(404).json({ error: "Budget not found." });

    const updateRes = await db.query(
      "UPDATE budgets SET category = $1, limit_amount = $2, spent = $3, period = $4, icon = $5, color = $6 WHERE id = $7 AND user_id = $8 RETURNING *",
      [
        category || existing.category,
        limit_amount !== undefined ? limit_amount : existing.limit_amount,
        spent !== undefined ? spent : existing.spent,
        period || existing.period,
        icon || existing.icon,
        color || existing.color,
        budgetId,
        req.user.id
      ]
    );

    res.json({ budget: updateRes.rows[0] });
  } catch (err) {
    console.error("Update budget error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// DELETE /api/budgets/:id
router.delete("/:id", async (req, res) => {
  try {
    const budgetId = req.params.id;
    const existing = await queryOne("SELECT * FROM budgets WHERE id = $1 AND user_id = $2", [budgetId, req.user.id]);
    if (!existing) return res.status(404).json({ error: "Budget not found." });

    await db.query("DELETE FROM budgets WHERE id = $1 AND user_id = $2", [budgetId, req.user.id]);

    res.json({ message: "Budget deleted successfully." });
  } catch (err) {
    console.error("Delete budget error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;
