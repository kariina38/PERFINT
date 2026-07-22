import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Eye, EyeOff, TrendingUp, TrendingDown, Bell, Sparkles } from "lucide-react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import { AlertModal } from "../../components/alert-modal";
import { AIInsightCard } from "../../components/ai-insight-card";
import { formatRupiah } from "../../utils/currency";
import { useAuth } from "../../contexts/auth-context";
import { walletsApi, transactionsApi, budgetsApi, categoriesApi, aiApi, type Transaction, type Budget, type Category } from "../../utils/api";
import { toast } from "sonner";
import { UserAvatar } from "../../components/user-avatar";

export function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [totalBalance, setTotalBalance] = useState(0);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [monthlyExpense, setMonthlyExpense] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [alertBudget, setAlertBudget] = useState<Budget | null>(null);
  const [aiForecast, setAiForecast] = useState<any>(null);
  const [isAiLoading, setIsAiLoading] = useState(true);
  const [aiError, setAiError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsAiLoading(true);
    setAiError(false);
    try {
      const [walletsData, txData, bData, cData] = await Promise.all([
        walletsApi.getAll(),
        transactionsApi.getAll({ limit: 50 }), // fetch a bit more for the chart
        budgetsApi.getAll(),
        categoriesApi.getAll("expense"),
      ]);

      const total = walletsData.wallets.reduce((sum, w) => sum + w.balance, 0);
      setTotalBalance(total);
      setMonthlyIncome(txData.summary.totalIncome);
      setMonthlyExpense(txData.summary.totalExpense);
      setTransactions(txData.transactions);
      setCategoriesList(cData.categories);

      // Fetch AI Forecast separately
      fetchAIForecast();

      // Check if any budget is nearing (>= 90%) or exceeded (> 100%) the limit
      // Sort to prioritize the most critical (highest percentage) budget
      const exceededList = bData.budgets
        .filter(b => b.limit_amount > 0 && (b.spent / b.limit_amount) >= 0.9)
        .sort((a, b) => (b.spent / b.limit_amount) - (a.spent / a.limit_amount));

      if (exceededList.length > 0) {
        const criticalBudget = exceededList[0];
        setAlertBudget(criticalBudget);
        
        // Only auto-show the alert once per session for each user
        const sessionKey = `budget_alert_shown_${user?.id}`;
        const alreadyShown = sessionStorage.getItem(sessionKey);
        
        if (!alreadyShown) {
          setShowAlert(true);
          sessionStorage.setItem(sessionKey, "true");
        }
      }

    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAIForecast = () => {
    setIsAiLoading(true);
    setAiError(false);
    aiApi.getForecast()
      .then(res => {
        setAiForecast(res.forecast);
        setIsAiLoading(false);
      })
      .catch(err => {
        console.error("Forecast failed:", err);
        setAiError(true);
        setIsAiLoading(false);
      });
  };

  // Compute dynamic spending Data for pie chart
  const spendingMap: Record<string, number> = {};
  transactions.filter(t => t.type === "expense").forEach(t => {
    spendingMap[t.category] = (spendingMap[t.category] || 0) + t.amount;
  });

  const spendingData = Object.keys(spendingMap).map(cat => {
    const categoryDef = categoriesList.find(c => c.name === cat);
    // fallback color extraction from eg "bg-orange-500" or direct hex
    let hexColor = "#3b82f6"; // default blue
    if (categoryDef?.color) {
      if (categoryDef.color.includes("orange")) hexColor = "#f97316";
      else if (categoryDef.color.includes("blue")) hexColor = "#3b82f6";
      else if (categoryDef.color.includes("pink")) hexColor = "#ec4899";
      else if (categoryDef.color.includes("red")) hexColor = "#ef4444";
      else if (categoryDef.color.includes("green")) hexColor = "#22c55e";
      else if (categoryDef.color.includes("purple")) hexColor = "#a855f7";
      else if (categoryDef.color.includes("indigo")) hexColor = "#6366f1";
      else if (categoryDef.color.includes("emerald")) hexColor = "#10b981";
      else if (categoryDef.color.includes("amber")) hexColor = "#f59e0b";
      else if (categoryDef.color.includes("teal")) hexColor = "#14b8a6";
    }

    return {
      name: cat,
      value: spendingMap[cat],
      color: hexColor
    };
  }).sort((a, b) => b.value - a.value).slice(0, 5); // top 5 expenses

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      "Food": "☕", "Food & Dining": "☕", "Transport": "🚗", "Transportation": "🚗",
      "Shopping": "🛍️", "Entertainment": "🎬", "Bills": "📄", "Health": "🏥",
      "Education": "📚", "Income": "💰", "Other": "💵",
    };
    return icons[category] || "💵";
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <UserAvatar
            name={user?.name}
            avatar={user?.avatar}
            size="md"
            className="cursor-pointer hover:scale-105 transition-transform"
            onClick={() => navigate("/app/profile")}
          />
          <div>
            <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500">Welcome back, {user?.name || "User"}!</p>
          </div>
        </div>
        <button
          onClick={() => {
             if (alertBudget) setShowAlert(true);
             else {
               toast.info("No urgent alerts right now.");
             }
          }}
          className="relative p-2 rounded-full hover:bg-gray-100"
        >
          <Bell className="w-6 h-6 text-gray-700" />
          {alertBudget && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>}
        </button>
      </div>

      {/* Top Cards: Total Balance, Income, Expense */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        {/* Total Balance Card */}
        <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-6 rounded-2xl shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <p className="text-blue-100 text-sm font-medium">Total Balance</p>
            <button
              onClick={() => setBalanceVisible(!balanceVisible)}
              className="text-white hover:bg-blue-500 p-1.5 rounded-lg transition-colors cursor-pointer"
            >
              {balanceVisible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            </button>
          </div>
          <h2 className="text-3xl font-extrabold mb-4">
            {balanceVisible ? formatRupiah(totalBalance) : "•••••••"}
          </h2>
          <div className="flex items-center gap-2 text-sm text-blue-100 font-medium">
            <TrendingUp className="w-4 h-4 text-emerald-300" />
            <span>+12.5% from last month</span>
          </div>
        </Card>

        {/* Income Card */}
        <Card className="p-6 rounded-2xl border-2 border-green-100 bg-green-50/70 flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center shadow-sm">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Income</p>
              <p className="text-xs text-gray-400">All time earnings</p>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatRupiah(monthlyIncome)}</p>
        </Card>

        {/* Expense Card */}
        <Card className="p-6 rounded-2xl border-2 border-red-100 bg-red-50/70 flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center shadow-sm">
              <TrendingDown className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Expense</p>
              <p className="text-xs text-gray-400">All time spending</p>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatRupiah(monthlyExpense)}</p>
        </Card>
      </div>

      {/* AI Insights Card */}
      {isAiLoading && (
        <Card className="p-6 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center animate-pulse py-10">
          <Sparkles className="w-8 h-8 text-gray-300 mb-2" />
          <p className="text-gray-400 font-medium">Analysing your spending patterns...</p>
        </Card>
      )}

      {aiForecast && !isAiLoading && (
        <AIInsightCard forecast={aiForecast} />
      )}

      {aiError && !isAiLoading && (
        <Card className="p-4 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-orange-400" />
            <p className="text-xs text-orange-700 font-medium">AI is currently busy. Try again?</p>
          </div>
          <Button 
            onClick={fetchAIForecast}
            variant="outline" 
            size="sm" 
            className="h-8 text-xs border-orange-200 text-orange-700 hover:bg-orange-100"
          >
            Retry
          </Button>
        </Card>
      )}

      {/* Two Column Grid on Desktop: Spending Distribution & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending Distribution */}
        <Card className="p-6 rounded-2xl">
          <h3 className="font-bold text-gray-900 mb-4 text-base">Spending Distribution</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={spendingData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={2}
                dataKey="value"
              >
                {spendingData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Legend
                verticalAlign="bottom"
                height={50}
                formatter={(value, entry: any) => {
                  const total = spendingData.reduce((sum, item) => sum + item.value, 0);
                  const percent = total > 0 ? ((entry.payload.value / total) * 100).toFixed(1) : 0;
                  return (
                    <span className="text-[12px] text-gray-700 font-medium">
                      {value} ({percent}%)
                    </span>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Recent Transactions */}
        <Card className="p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 text-base">Recent Transactions</h3>
          </div>
        {transactions.length === 0 && !isLoading ? (
          <p className="text-center text-gray-500 py-8">No transactions yet. Add your first transaction!</p>
        ) : (
          <div className="space-y-4">
            {transactions.slice(0, 5).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.type === "income" ? "bg-green-100" : "bg-red-100"
                    }`}
                  >
                    {transaction.type === "income" ? (
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{transaction.category}</p>
                    <p className="text-xs text-gray-500">{transaction.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`font-bold ${
                      transaction.type === "income" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {transaction.type === "income" ? "+" : "-"}{formatRupiah(transaction.amount)}
                  </p>
                  <p className="text-xs text-gray-500">{transaction.wallet_name}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>

      <AlertModal
        isOpen={showAlert}
        onClose={() => setShowAlert(false)}
        type="budget"
        customTitle={alertBudget && (alertBudget.spent / alertBudget.limit_amount) > 1.0 ? "Budget Exceeded!" : "Budget Limit Alert"}
        customDescription={alertBudget && (alertBudget.spent / alertBudget.limit_amount) > 1.0 
          ? `You have EXCEEDED your ${alertBudget.period} ${alertBudget.category} budget by ${((alertBudget.spent / alertBudget.limit_amount) * 100 - 100).toFixed(0)}%! Please review your spending.`
          : `You have reached ${alertBudget ? ((alertBudget.spent / alertBudget.limit_amount) * 100).toFixed(0) : "0"}% of your ${alertBudget?.period} ${alertBudget?.category} budget limit.`}
        customDetails={alertBudget ? [
          { label: "Category", value: alertBudget.category },
          { label: "Status", value: (alertBudget.spent / alertBudget.limit_amount) > 1.0 ? "OUT OF BUDGET" : "Nearing Limit" },
          { label: "Spent", value: `${formatRupiah(alertBudget.spent)} of ${formatRupiah(alertBudget.limit_amount)}` },
          { label: "Remaining", value: formatRupiah(alertBudget.limit_amount - alertBudget.spent) },
        ] : undefined}
        onAction={() => {
          setShowAlert(false);
          if (alertBudget) {
            navigate(`/app/budgeting?highlight=${encodeURIComponent(alertBudget.category)}`);
          }
        }}
      />
    </div>
  );
}