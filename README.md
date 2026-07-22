# 💳 Perfint - Personal Finance Tracker Website

A modern, mobile-first **Personal Finance Management Web Application** built with **React 18, Vite 6, Tailwind CSS, Node.js Express, and Google Gemini AI**. Perfint helps users track incomes and expenses, manage multiple wallets, set category budgeting limits with automated alerts, and leverage AI for financial insights and smart receipt scanning.

---

## ✨ Features

- 📊 **Interactive Financial Dashboard**:
  - Real-time Total Balance overview with privacy toggle (*Hide/Show balance*).
  - Spending Distribution Chart (Pie Chart) powered by Recharts.
  - Quick summary cards for Total Income, Total Expenses, and Recent Transactions.
  - Automated **Budget Limit Alerts** modal when spending reaches or exceeds 90% of budget limit.
  - **AI Forecast Card** predicting upcoming spending trends.

- 💳 **Wallet Management**:
  - Support for multiple funding sources (Bank Accounts, E-Wallets, Cash, Credit Cards).
  - Balance tracking & percentage distribution across wallets.

- 📝 **Transaction Logging & AI Receipt OCR Scan**:
  - Log Expense and Income transactions with date, category, wallet source, and notes.
  - **AI Receipt Scanner (OCR)**: Upload receipt images to automatically extract transaction amount, category, and notes using Google Gemini AI.
  - Create custom categories with custom icons (emojis) and color themes.

- 🎯 **Budgeting & Spending Limits**:
  - Set category-specific spending limits for Daily, Weekly, or Monthly periods.
  - Visual status progress bars (Green: Safe, Orange: Warning, Red: Overbudget).

- 🤖 **FinAI Advisor**:
  - Interactive AI financial assistant for budgeting advice, cost-saving tips, and spending pattern analysis.

- 🔒 **Security & Account Management**:
  - JWT Authentication (Register, Login, Password Recovery).
  - Customizable User Profiles & Dynamic Avatars.
  - Change Password & Two-Factor Authentication (2FA / OTP).

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework**: React 18 (TypeScript) + Vite 6
- **Styling**: Tailwind CSS 4, Radix UI Primitives (`@radix-ui/react-*`)
- **Icons & Visuals**: Lucide Icons (`lucide-react`), Recharts (`recharts`)
- **Routing**: React Router v7 (`react-router`)
- **Toast Notifications**: Sonner (`sonner`)

### **Backend**
- **Runtime**: Node.js & Express.js
- **Database**: SQLite3 (`sqlite3` / `sqlite`)
- **Authentication**: JSON Web Token (`jsonwebtoken`), Bcrypt (`bcryptjs`)
- **AI Integration**: Google Generative AI SDK (`@google/genai` / Gemini API)

### **DevOps & Containerization**
- **Docker**: Docker & Docker Compose (`docker-compose.yml`, `docker-compose.dev.yml`)
- **Web Server**: Nginx (Production static file serving & reverse proxy)

---

## 📁 Project Structure

```text
Perfint/
├── server/                   # Express.js Backend API
│   ├── routes/               # API Routes (auth, wallets, transactions, budgets, ai, users)
│   ├── middleware/           # Auth JWT middleware
│   ├── db.js                 # SQLite database initialization
│   ├── index.js              # Server entry point
│   └── .env.example          # Backend Environment template
├── src/                      # React Frontend Application
│   ├── app/
│   │   ├── components/       # UI Components (MobileLayout, UserAvatar, AlertModal, etc.)
│   │   ├── contexts/         # React Contexts (AuthContext)
│   │   ├── screens/          # Application Screens (auth/ & mobile/)
│   │   ├── utils/            # API client (api.ts) & Currency helpers (currency.ts)
│   │   ├── App.tsx           # App Root Component
│   │   └── routes.tsx        # React Router configuration
│   ├── main.tsx              # React DOM entry point
│   └── styles/               # Global Tailwind CSS styles
├── docker-compose.yml        # Production Docker Compose config
├── docker-compose.dev.yml    # Development Docker Compose config
├── Dockerfile                # Frontend Nginx Dockerfile
├── nginx.conf                # Nginx production configuration
├── package.json              # Frontend dependencies & scripts
└── vite.config.ts            # Vite build configuration
```

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Docker](https://www.docker.com/) (Optional, for containerized running)

---

### Local Setup (Without Docker)

1. **Clone the repository**:
   ```bash
   git clone https://github.com/kariina38/PERFINT.git
   cd PERFINT
   ```

2. **Configure Environment Variables**:
   Create a `.env` file inside the `server/` directory:
   ```bash
   cp server/.env.example server/.env
   ```
   Add your Gemini API Key in `server/.env`:
   ```env
   PORT=3001
   GEMINI_API_KEY=your_gemini_api_key_here
   JWT_SECRET=your_jwt_secret_here
   ```

3. **Install Dependencies & Start Backend**:
   ```bash
   cd server
   npm install
   node index.js
   ```
   *Backend running at: `http://localhost:3001`*

4. **Install Dependencies & Start Frontend**:
   Open a new terminal at project root:
   ```bash
   npm install
   npm run dev
   ```
   *Frontend running at: `http://localhost:5173`*

---

### Docker Setup

#### **Production Mode (Nginx + Express Backend)**
```bash
docker compose up --build
```
- **Frontend**: http://localhost:5173 (or http://localhost:80)
- **Backend API**: http://localhost:3001

#### **Development Mode (Live Reload)**
```bash
docker compose -f docker-compose.dev.yml up --build
```

---

## 📝 License
This project is open-source and available under the [MIT License](LICENSE).
