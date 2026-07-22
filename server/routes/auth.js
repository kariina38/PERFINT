const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");
const { JWT_SECRET } = require("../middleware/auth");

const router = express.Router();

// Helper: run a query and return all rows
async function query(sql, params = []) {
  const res = await db.query(sql, params);
  return res.rows;
}

// Helper: run a query and return first row
async function queryOne(sql, params = []) {
  const rows = await query(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required." });
    }
    if (password.length < 4) {
      return res.status(400).json({ error: "Password must be at least 4 characters." });
    }

    // Check if user already exists
    const existingUser = await queryOne("SELECT id FROM users WHERE email = $1", [email]);
    if (existingUser) {
      return res.status(409).json({ error: "Email already registered." });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert user
    const insertRes = await db.query(
      "INSERT INTO users (name, email, phone, password_hash) VALUES ($1, $2, $3, $4) RETURNING id, created_at",
      [name, email, phone || null, passwordHash]
    );
    const userId = insertRes.rows[0].id;
    const createdAt = insertRes.rows[0].created_at;

    // Create default wallets
    const defaultWallets = [
      ["Cash", "cash", "💵", "bg-gradient-to-br from-green-500 to-green-600", 0],
      ["Bank BCA", "bank", "🏦", "bg-gradient-to-br from-blue-500 to-blue-600", 0],
      ["GoPay", "ewallet", "📱", "bg-gradient-to-br from-emerald-500 to-emerald-600", 0],
    ];

    for (const [wName, wType, wIcon, wColor, wBalance] of defaultWallets) {
      await db.query(
        "INSERT INTO wallets (user_id, name, type, icon, color, balance) VALUES ($1, $2, $3, $4, $5, $6)",
        [userId, wName, wType, wIcon, wColor, wBalance]
      );
    }

    // Create default categories
    const defaultCategories = [
      ["Food", "expense", "🍔", "bg-orange-500"],
      ["Transport", "expense", "🚗", "bg-blue-500"],
      ["Shopping", "expense", "🛍️", "bg-pink-500"],
      ["Bills & Utilities", "expense", "📄", "bg-red-500"],
      ["Health", "expense", "🏥", "bg-green-500"],
      ["Entertainment", "expense", "🎬", "bg-purple-500"],
      ["Education", "expense", "📚", "bg-indigo-500"],
      ["Salary", "income", "💰", "bg-emerald-500"],
      ["Bonus", "income", "🎁", "bg-amber-500"],
      ["Other", "expense", "☕", "bg-gray-500"]
    ];

    for (const [cName, cType, cIcon, cColor] of defaultCategories) {
      await db.query(
        "INSERT INTO categories (user_id, name, type, icon, color) VALUES ($1, $2, $3, $4, $5)",
        [userId, cName, cType, cIcon, cColor]
      );
    }

    const token = jwt.sign(
      { userId: userId, email: email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Registration successful.",
      token,
      user: {
        id: userId,
        name,
        email,
        phone,
        created_at: createdAt,
      },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const user = await queryOne("SELECT * FROM users WHERE email = $1", [email]);
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar || null,
        created_at: user.created_at,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// POST /api/auth/verify-otp
router.post("/verify-otp", async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({ error: "User ID and OTP are required." });
    }

    // Find user
    const user = await queryOne("SELECT * FROM users WHERE id = $1", [userId]);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Since we don't have a real email service yet, 
    // we'll accept any 6-digit OTP for development/testing.
    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({ error: "Invalid OTP format. Please enter a 6-digit code." });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar || null,
        created_at: user.created_at,
      },
    });
  } catch (err) {
    console.error("OTP Verification error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// POST /api/auth/reset-password
router.post("/reset-password", async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ error: "Email and new password are required." });
    }
    if (newPassword.length < 4) {
      return res.status(400).json({ error: "New password must be at least 4 characters." });
    }

    // Check if user exists
    const user = await queryOne("SELECT id FROM users WHERE email = $1", [email]);
    if (!user) {
      return res.status(404).json({ error: "No account found with this email." });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    // Update password
    await db.query("UPDATE users SET password_hash = $1 WHERE id = $2", [passwordHash, user.id]);

    res.json({ message: "Password has been reset successfully." });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;

