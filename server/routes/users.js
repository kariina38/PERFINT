const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../db");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();
router.use(authMiddleware);

async function queryOne(sql, params = []) {
  const res = await db.query(sql, params);
  return res.rows.length > 0 ? res.rows[0] : null;
}

// GET /api/users/profile
router.get("/profile", async (req, res) => {
  try {
    const user = await queryOne(
      "SELECT id, name, email, phone, avatar, created_at FROM users WHERE id = $1",
      [req.user.id]
    );
    if (!user) return res.status(404).json({ error: "User not found." });
    res.json({ user });
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// PUT /api/users/profile
router.put("/profile", async (req, res) => {
  try {
    const { name, phone, avatar } = req.body;
    console.log("📥 PUT /api/users/profile body:", { name, phone, avatarLength: avatar ? avatar.length : avatar, userId: req.user.id });
    
    if (name !== undefined) await db.query("UPDATE users SET name = $1 WHERE id = $2", [name, req.user.id]);
    if (phone !== undefined) await db.query("UPDATE users SET phone = $1 WHERE id = $2", [phone, req.user.id]);
    if (avatar !== undefined) await db.query("UPDATE users SET avatar = $1 WHERE id = $2", [avatar, req.user.id]);

    const user = await queryOne(
      "SELECT id, name, email, phone, avatar, created_at FROM users WHERE id = $1",
      [req.user.id]
    );
    console.log("✅ Updated user in DB:", { ...user, avatar: user?.avatar ? user.avatar.substring(0, 30) + '...' : null });
    res.json({ user });
  } catch (err) {
    console.error("❌ Update profile error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// PUT /api/users/change-password
router.put("/change-password", async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current and new passwords are required." });
    }
    if (newPassword.length < 4) {
      return res.status(400).json({ error: "New password must be at least 4 characters." });
    }


    const user = await queryOne("SELECT password_hash FROM users WHERE id = $1", [req.user.id]);

    const isValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: "Current password is incorrect." });
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);
    await db.query("UPDATE users SET password_hash = $1 WHERE id = $2", [newHash, req.user.id]);

    res.json({ message: "Password changed successfully." });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;
