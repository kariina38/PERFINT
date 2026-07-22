import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, X as XIcon } from "lucide-react";
import { Card } from "../../components/ui/card";
import { Progress } from "../../components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Button } from "../../components/ui/button";
import { useLocation } from "react-router";
import { formatRupiah } from "../../utils/currency";
import { budgetsApi, categoriesApi, type Budget, type Category } from "../../utils/api";
import { toast } from "sonner";

const getStatusColor = (percentage: number) => {
  if (percentage >= 90) return "bg-red-100 text-red-700";
  if (percentage >= 70) return "bg-orange-100 text-orange-700";
  return "bg-green-100 text-green-700";
};

const getProgressColor = (percentage: number) => {
  if (percentage >= 90) return "bg-red-500";
  if (percentage >= 70) return "bg-orange-500";
  return "bg-blue-500";
};

export function Budgeting() {
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("monthly");
  const [showAddBudget, setShowAddBudget] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [budgetCategory, setBudgetCategory] = useState("");
  const [budgetLimit, setBudgetLimit] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState<"daily" | "weekly" | "monthly">("monthly");
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const highlightCategory = searchParams.get("highlight");

  const budgetIcons = ["🍔", "🚗", "🛍️", "🎬", "📄", "🛒", "☕", "🍱", "🏥", "📚", "✈️", "💰"];
  const budgetColors = [
    { name: "Blue", value: "bg-blue-500" },
    { name: "Purple", value: "bg-purple-500" },
    { name: "Pink", value: "bg-pink-500" },
    { name: "Orange", value: "bg-orange-500" },
    { name: "Green", value: "bg-green-500" },
    { name: "Red", value: "bg-red-500" },
    { name: "Amber", value: "bg-amber-500" },
    { name: "Teal", value: "bg-teal-500" },
  ];

  const loadData = async () => {
    try {
      const [bData, cData] = await Promise.all([
        budgetsApi.getAll(),
        categoriesApi.getAll("expense")
      ]);
      setBudgets(bData.budgets);
      setCategoriesList(cData.categories);

      // Auto-scroll to highlighted budget if any
      if (highlightCategory) {
        setTimeout(() => {
          const el = document.getElementById(`budget-${highlightCategory}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          } else {
            const targetBudget = bData.budgets.find((b: Budget) => b.category === highlightCategory);
            if (targetBudget) {
               setPeriod(targetBudget.period as "daily" | "weekly" | "monthly");
               setTimeout(() => {
                  document.getElementById(`budget-${highlightCategory}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
               }, 100);
            }
          }
        }, 300);
      }
    } catch (err) {
      console.error("Failed to load budgeting data:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveBudget = async () => {
    try {
      const data = {
        category: budgetCategory,
        limit_amount: parseFloat(budgetLimit),
        period: selectedPeriod,
        icon: selectedIcon || "📊",
        color: selectedColor || "bg-blue-500",
      };

      if (editingBudget) {
        await budgetsApi.update(editingBudget.id, data);
        toast.success("Budget updated successfully!");
      } else {
        await budgetsApi.create(data);
        toast.success("Budget created successfully!");
      }

      setShowAddBudget(false);
      resetForm();
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to save budget.");
    }
  };

  const handleDeleteBudget = async (id: number) => {
    if (!confirm("Are you sure you want to delete this budget?")) return;
    try {
      await budgetsApi.delete(id);
      toast.success("Budget deleted successfully!");
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete budget.");
    }
  };

  const startEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setBudgetCategory(budget.category);
    setBudgetLimit(budget.limit_amount.toString());
    setSelectedPeriod(budget.period as any);
    setSelectedIcon(budget.icon);
    setSelectedColor(budget.color);
    setShowAddBudget(true);
  };

  const resetForm = () => {
    setEditingBudget(null);
    setBudgetCategory("");
    setBudgetLimit("");
    setSelectedPeriod("monthly");
    setSelectedIcon(null);
    setSelectedColor(null);
  };

  const filteredBudgets = budgets.filter((b) => b.period === period);
  const totalLimit = filteredBudgets.reduce((sum, b) => sum + b.limit_amount, 0);
  const totalSpent = filteredBudgets.reduce((sum, b) => sum + b.spent, 0);

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Budget Tracking</h1>
          <p className="text-sm text-gray-500">Monitor your spending limits</p>
        </div>
        <Button
          onClick={() => { resetForm(); setShowAddBudget(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center gap-2 cursor-pointer shadow-md px-4 py-2.5"
        >
          <Plus className="w-5 h-5" />
          <span className="font-bold hidden sm:inline">Create Budget</span>
        </Button>
      </div>

      {/* Period Selector */}
      <Tabs value={period} onValueChange={(v) => setPeriod(v as "daily" | "weekly" | "monthly")}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Overall Budget Summary */}
      <Card className="p-6 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-white">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-blue-100 text-sm font-medium">
              Total {period.charAt(0).toUpperCase() + period.slice(1)} Budget
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold mt-1">{formatRupiah(totalLimit)}</h2>
          </div>
          <div className="sm:text-right">
            <p className="text-blue-100 text-sm font-medium">Spent</p>
            <p className="text-xl sm:text-2xl font-bold mt-1 text-blue-100">{formatRupiah(totalSpent)}</p>
          </div>
        </div>
        {totalLimit > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{((totalSpent / totalLimit) * 100).toFixed(0)}%</span>
            </div>
            <div className="w-full bg-blue-800 rounded-full h-3">
              <div
                className="bg-white rounded-full h-3 transition-all"
                style={{ width: `${Math.min((totalSpent / totalLimit) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}
      </Card>

      {/* Budget List */}
      <div className="space-y-3">
        <h3 className="font-medium text-gray-700 text-sm">
          {period.charAt(0).toUpperCase() + period.slice(1)} Budgets
        </h3>
        {filteredBudgets.length === 0 ? (
          <Card className="p-8 rounded-xl text-center">
            <p className="text-gray-500">No {period} budgets set. Create one!</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredBudgets.map((budget) => {
              const percentage = (budget.spent / budget.limit_amount) * 100;
              return (
                <Card 
                  key={budget.id} 
                  id={`budget-${budget.category}`}
                  className={`p-4 rounded-xl transition-all duration-1000 ${
                    highlightCategory === budget.category ? "ring-4 ring-blue-400 shadow-xl scale-[1.02]" : ""
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${budget.color} rounded-xl flex items-center justify-center text-xl`}>
                        {budget.icon}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{budget.category}</h4>
                        <p className="text-sm text-gray-500">
                          {formatRupiah(budget.spent)} of {formatRupiah(budget.limit_amount)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => startEdit(budget)}
                        className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteBudget(budget.id)}
                        className="p-2 hover:bg-red-50 rounded-full text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <span className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(percentage)}`}>
                        {percentage.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Progress
                      value={Math.min(percentage, 100)}
                      className="h-2"
                      indicatorClassName={getProgressColor(percentage)}
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{formatRupiah(Math.max(0, budget.limit_amount - budget.spent))} remaining</span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Add/Edit Budget Modal */}
      {showAddBudget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end md:items-center justify-center z-50">
          <Card className="bg-white rounded-t-3xl md:rounded-2xl w-full md:w-[480px] max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between rounded-t-3xl">
              <h3 className="text-lg font-bold text-gray-900">
                {editingBudget ? "Edit Budget" : "Add New Budget"}
              </h3>
              <button
                onClick={() => { setShowAddBudget(false); resetForm(); }}
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full"
              >
                <XIcon className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  value={budgetCategory}
                  onChange={(e) => setBudgetCategory(e.target.value)}
                >
                  <option value="">Select a category</option>
                  {categoriesList.map((category) => (
                    <option key={category.id} value={category.name}>{category.icon} {category.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Budget Limit</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">Rp</span>
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={budgetLimit}
                    onChange={(e) => setBudgetLimit(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Budget Period</label>
                <div className="grid grid-cols-3 gap-3">
                  {(["daily", "weekly", "monthly"] as const).map((periodOption) => (
                    <button
                      key={periodOption}
                      onClick={() => setSelectedPeriod(periodOption)}
                      className={`py-3 px-4 rounded-xl border-2 font-medium transition-all ${
                        selectedPeriod === periodOption
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      {periodOption.charAt(0).toUpperCase() + periodOption.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Choose Icon</label>
                <div className="grid grid-cols-6 gap-2">
                  {budgetIcons.map((icon) => (
                    <button
                      key={icon}
                      onClick={() => setSelectedIcon(icon)}
                      className={`w-full aspect-square rounded-xl border-2 flex items-center justify-center text-2xl transition-all ${
                        selectedIcon === icon ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Choose Color</label>
                <div className="grid grid-cols-4 gap-2">
                  {budgetColors.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setSelectedColor(color.value)}
                      className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                        selectedColor === color.value ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className={`w-8 h-8 ${color.value} rounded-full`} />
                      <span className="text-xs text-gray-600">{color.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 pt-4 sticky bottom-0 bg-white z-10 pb-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <Button
                  onClick={handleSaveBudget}
                  disabled={!budgetCategory || !budgetLimit || !selectedIcon || !selectedColor}
                  className="w-full py-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {editingBudget ? "Update Budget" : "Create Budget"}
                </Button>
                <Button onClick={() => { setShowAddBudget(false); resetForm(); }} variant="outline" className="w-full py-6 rounded-xl">
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      <button
        onClick={() => { resetForm(); setShowAddBudget(true); }}
        className="fixed bottom-20 md:bottom-8 right-6 md:right-8 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-xl flex items-center justify-center transition-transform hover:scale-105 active:scale-95 z-40 cursor-pointer"
        title="Create New Budget"
      >
        <Plus className="w-7 h-7" />
      </button>
    </div>
  );
}