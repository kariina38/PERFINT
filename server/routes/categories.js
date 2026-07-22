const express = require('express');
const router = express.Router();
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

async function query(sql, params = []) {
  const res = await db.query(sql, params);
  return res.rows;
}

async function queryOne(sql, params = []) {
  const rows = await query(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

// Get all categories for the User
router.get('/', async (req, res) => {
  try {
    const type = req.query.type;
    
    let sql = "SELECT * FROM categories WHERE user_id = $1";
    let params = [req.user.id];

    if (type) {
      params.push(type);
      sql += ` AND type = $${params.length}`;
    }

    sql += " ORDER BY id ASC";
    
    const categories = await query(sql, params);
    res.json({ categories });
  } catch (error) {
    console.error("Fetch categories error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create a new category
router.post('/', async (req, res) => {
  try {
    const { name, type, icon, color } = req.body;

    if (!name || !type || !icon || !color) {
      return res.status(400).json({ error: "Name, type, icon, and color are required" });
    }

    if (type !== 'income' && type !== 'expense') {
      return res.status(400).json({ error: "Type must be income or expense" });
    }

    // Check if category name already exists for user
    const existing = await queryOne(
        "SELECT id FROM categories WHERE user_id = $1 AND LOWER(name) = LOWER($2) AND type = $3",
        [req.user.id, name, type]
    );

    if (existing) {
        return res.status(400).json({ error: "Category already exists" });
    }

    const insertRes = await db.query(
      "INSERT INTO categories (user_id, name, type, icon, color) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [req.user.id, name, type, icon, color]
    );

    res.status(201).json({ category: insertRes.rows[0], message: "Category created successfully" });
  } catch (error) {
    console.error("Create category error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update a category
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, icon, color } = req.body;

    const existingCategory = await queryOne("SELECT * FROM categories WHERE id = $1 AND user_id = $2", [id, req.user.id]);
    if (!existingCategory) {
      return res.status(404).json({ error: "Category not found" });
    }

    const updateRes = await db.query(
      "UPDATE categories SET name = COALESCE($1, name), icon = COALESCE($2, icon), color = COALESCE($3, color) WHERE id = $4 AND user_id = $5 RETURNING *",
      [name, icon, color, id, req.user.id]
    );

    res.json({ category: updateRes.rows[0], message: "Category updated successfully" });
  } catch (error) {
    console.error("Update category error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete a category
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await queryOne("SELECT id FROM categories WHERE id = $1 AND user_id = $2", [id, req.user.id]);
    if (!existing) {
      return res.status(404).json({ error: "Category not found" });
    }

    await db.query("DELETE FROM categories WHERE id = $1 AND user_id = $2", [id, req.user.id]);

    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Delete category error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
