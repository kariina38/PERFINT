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

// GET /api/wallets
router.get("/", async (req, res) => {
  try {
    const wallets = await query(
      "SELECT * FROM wallets WHERE user_id = $1 ORDER BY created_at ASC",
      [req.user.id]
    );
    res.json({ wallets });
  } catch (err) {
    console.error("Get wallets error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// POST /api/wallets
router.post("/", async (req, res) => {
  try {
    const { name, type, icon, color, balance } = req.body;
    if (!name) return res.status(400).json({ error: "Wallet name is required." });

    const insertRes = await db.query(
      "INSERT INTO wallets (user_id, name, type, icon, color, balance) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [req.user.id, name, type || "cash", icon || "💵", color || "bg-gradient-to-br from-green-500 to-green-600", balance || 0]
    );
    
    res.status(201).json({ wallet: insertRes.rows[0] });
  } catch (err) {
    console.error("Create wallet error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// PUT /api/wallets/:id
router.put("/:id", async (req, res) => {
  try {
    const { name, type, icon, color, balance } = req.body;
    const walletId = req.params.id;

    const existing = await queryOne("SELECT * FROM wallets WHERE id = $1 AND user_id = $2", [walletId, req.user.id]);
    if (!existing) return res.status(404).json({ error: "Wallet not found." });

    const updateRes = await db.query(
      "UPDATE wallets SET name = $1, type = $2, icon = $3, color = $4, balance = $5 WHERE id = $6 AND user_id = $7 RETURNING *",
      [name || existing.name, type || existing.type, icon || existing.icon, color || existing.color, balance !== undefined ? balance : existing.balance, walletId, req.user.id]
    );

    res.json({ wallet: updateRes.rows[0] });
  } catch (err) {
    console.error("Update wallet error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// DELETE /api/wallets/:id
router.delete("/:id", async (req, res) => {
  try {
    const walletId = req.params.id;
    const existing = await queryOne("SELECT * FROM wallets WHERE id = $1 AND user_id = $2", [walletId, req.user.id]);
    if (!existing) return res.status(404).json({ error: "Wallet not found." });

    await db.query("DELETE FROM wallets WHERE id = $1 AND user_id = $2", [walletId, req.user.id]);

    res.json({ message: "Wallet deleted successfully." });
  } catch (err) {
    console.error("Delete wallet error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;
