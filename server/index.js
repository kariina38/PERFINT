const express = require("express");
const cors = require("cors");
const { initDatabase } = require("./db");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000", "http://localhost:5176"],
  credentials: true,
}));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

let dbInitialized = null;
async function getDbConnection() {
  if (!dbInitialized) {
    dbInitialized = initDatabase();
  }
  return dbInitialized;
}

// Middleware to ensure DB is initialized
app.use(async (req, res, next) => {
  try {
    await getDbConnection();
    next();
  } catch (err) {
    console.error("Database connection check failed:", err);
    res.status(500).json({ error: "Failed to connect to database" });
  }
});

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const walletRoutes = require("./routes/wallets");
const transactionRoutes = require("./routes/transactions");
const budgetRoutes = require("./routes/budgets");
const categoryRoutes = require("./routes/categories");
const aiRoutes = require("./routes/ai");

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/wallets", walletRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/ai", aiRoutes);

// Root route
app.get("/", (req, res) => {
  res.send("<h1>Finance Tracker API is running</h1><p>Visit <a href='/api/health'>/api/health</a> for more info.</p>");
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error." });
});

// Start server locally if not on Vercel
if (process.env.VERCEL !== "1") {
  const PORT = process.env.PORT || 3001;
  initDatabase().then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Finance Tracker API server running on http://localhost:${PORT}`);
    });
  }).catch(err => {
    console.error("Failed to start server locally:", err);
  });
}

module.exports = app;
