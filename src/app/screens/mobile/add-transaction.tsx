import { useState, useEffect, useRef } from "react";
import { Calendar, Wallet, Tag, StickyNote, Camera, Loader2, Calculator } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Textarea } from "../../components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Card } from "../../components/ui/card";
import { categoriesApi, walletsApi, transactionsApi, aiApi, type Category, type Wallet as WalletType } from "../../utils/api";
import { toast } from "sonner";

export function AddTransaction() {
  const [transactionType, setTransactionType] = useState<"expense" | "income">("expense");
  const [amount, setAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedWallet, setSelectedWallet] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState("");
  const [wallets, setWallets] = useState<WalletType[]>([]);
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [showKeypad, setShowKeypad] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Custom Category Form state
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryIcon, setNewCategoryIcon] = useState("🏷️");
  const [newCategoryColor, setNewCategoryColor] = useState("bg-blue-500");

  const iconsToChoose = [
    "🍔", "🚗", "🛍️", "🎬", "📄", "🏥", "📚", "✈️", "💰", "🏷️", "☕", "🎮", 
    "💊", "👕", "🏠", "🎁", "📱", "🔋", "💡", "🛠️", "🧼", "🐶", "🐱", "🌱"
  ];
  const colorsToChoose = [
    "bg-orange-500", "bg-blue-500", "bg-pink-500", "bg-red-500", 
    "bg-green-500", "bg-purple-500", "bg-indigo-500", "bg-gray-500",
    "bg-emerald-500", "bg-teal-500", "bg-cyan-500", "bg-sky-500",
    "bg-violet-500", "bg-fuchsia-500", "bg-rose-500", "bg-amber-500",
    "bg-lime-500", "bg-yellow-500", "bg-orange-600", "bg-blue-600",
    "bg-pink-600", "bg-red-600", "bg-green-600", "bg-purple-600",
    "bg-indigo-600", "bg-emerald-600", "bg-teal-600", "bg-cyan-600",
    "bg-sky-600", "bg-violet-600", "bg-fuchsia-600", "bg-rose-600"
  ];

  useEffect(() => {
    loadData();
  }, []);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (showAddCategory) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showAddCategory]);

  const loadData = async () => {
    try {
      const [wRes, cRes] = await Promise.all([
        walletsApi.getAll(),
        categoriesApi.getAll()
      ]);
      setWallets(wRes.wallets);
      setCategoriesList(cRes.categories);
      if (wRes.wallets.length > 0) {
        setSelectedWallet(String(wRes.wallets[0].id));
      }
    } catch (err) {
      console.error("Failed to load generic data:", err);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName) return;
    try {
      await categoriesApi.create({
        name: newCategoryName,
        type: transactionType,
        icon: newCategoryIcon,
        color: newCategoryColor
      });
      toast.success("Category added!");
      setShowAddCategory(false);
      setNewCategoryName("");
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to add category");
    }
  };

  // Filter categories by selected transaction type
  const activeCategories = categoriesList.filter(c => c.type === transactionType);

  // Available colors that are not already used by active categories
  const usedColors = activeCategories.map(c => c.color);
  const availableColors = colorsToChoose.filter(c => !usedColors.includes(c));

  // Set initial color if current selection is taken
  useEffect(() => {
    if (showAddCategory) {
      const used = activeCategories.map((c) => c.color);
      if (used.includes(newCategoryColor)) {
        const available = colorsToChoose.filter((c) => !used.includes(c));
        if (available.length > 0) {
          setNewCategoryColor(available[0]);
        }
      }
    }
  }, [showAddCategory, transactionType, categoriesList, newCategoryColor]);

  const handleNumberClick = (num: string) => {
    if (num === "." && amount.includes(".")) return;
    setAmount(amount + num);
  };

  const handleBackspace = () => {
    setAmount(amount.slice(0, -1));
  };

  const handleClear = () => {
    setAmount("");
  };

  const handleAddPreset = (val: number) => {
    const current = parseFloat(amount) || 0;
    setAmount(String(current + val));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !selectedCategory || !selectedWallet) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      // Validate balance for expenses
      if (transactionType === "expense") {
        const wallet = wallets.find(w => String(w.id) === selectedWallet);
        if (wallet && wallet.balance < parseFloat(amount)) {
          toast.error("Insufficient balance");
          setIsSubmitting(false);
          return;
        }
      }

      await transactionsApi.create({
        wallet_id: parseInt(selectedWallet),
        type: transactionType,
        category: selectedCategory,
        amount: parseFloat(amount),
        note: note || undefined,
        date,
      });
      toast.success("Transaction added successfully!");
      setAmount("");
      setSelectedCategory("");
      setNote("");
    } catch (err: any) {
      toast.error(err.message || "Failed to add transaction.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleScanReceipt = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64String = (reader.result as string).split(",")[1];
        try {
          const res = await aiApi.scanReceipt(base64String);
          const data = res.data;
          
          if (data.amount) setAmount(String(data.amount));
          if (data.merchant) setNote(data.merchant + (data.note ? `: ${data.note}` : ""));
          if (data.date) setDate(data.date);
          if (data.category) {
             const foundCat = categoriesList.find(c => 
               c.type === "expense" && 
               (c.name.toLowerCase().includes(data.category.toLowerCase()) || 
                data.category.toLowerCase().includes(c.name.toLowerCase()))
             );
             if (foundCat) setSelectedCategory(foundCat.name);
          }
          toast.success("Receipt scanned successfully!");
        } catch (err: any) {
          toast.error(err.message || "Failed to scan receipt. Ensure your API Key is valid.");
        } finally {
          setIsScanning(false);
        }
      };
    } catch (err) {
      toast.error("Error reading file.");
      setIsScanning(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-gray-200">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Add Transaction</h1>
          <p className="text-sm text-gray-500">Record your income or expense</p>
        </div>
        <div className="flex gap-2">
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleScanReceipt}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isScanning}
            onClick={() => fileInputRef.current?.click()}
            className="border-blue-200 text-blue-600 hover:bg-blue-50 bg-white shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            {isScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
            <span className="text-xs font-bold">AI SCAN RECEIPT</span>
          </Button>
        </div>
      </div>

      {/* Transaction Form Container */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Transaction Type Toggle */}
        <Tabs value={transactionType} onValueChange={(v) => setTransactionType(v as "expense" | "income")}>
          <TabsList className="grid w-full grid-cols-2 h-12 bg-gray-200/60 p-1 rounded-xl">
            <TabsTrigger value="expense" className="rounded-lg font-bold data-[state=active]:bg-red-600 data-[state=active]:text-white">
              Expense
            </TabsTrigger>
            <TabsTrigger value="income" className="rounded-lg font-bold data-[state=active]:bg-green-600 data-[state=active]:text-white">
              Income
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* 2-Column Responsive Grid on Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Amount Input, Presets, Keypad & Categories */}
          <div className="space-y-5">
            {/* Amount Card */}
            <Card className={`p-5 rounded-2xl ${transactionType === "expense" ? "bg-red-50/80 border-red-200" : "bg-green-50/80 border-green-200"}`}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</p>
                <button
                  type="button"
                  onClick={() => setShowKeypad(!showKeypad)}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  {showKeypad ? "Hide Keypad" : "Keypad"}
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-extrabold text-gray-900">Rp</span>
                <input
                  type="number"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="text-3xl font-extrabold bg-transparent outline-none flex-1 text-gray-900 w-full"
                />
              </div>

              {/* Quick Amount Presets */}
              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200/50 overflow-x-auto">
                {[10000, 20000, 50000, 100000, 500000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleAddPreset(val)}
                    className="px-2.5 py-1 text-xs font-semibold bg-white/80 border border-gray-300/80 rounded-lg hover:bg-white text-gray-700 shrink-0 transition-colors"
                  >
                    +{val >= 1000 ? `${val / 1000}k` : val}
                  </button>
                ))}
              </div>
            </Card>

            {/* Collapsible Keypad */}
            {showKeypad && (
              <Card className="p-4 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="grid grid-cols-3 gap-2">
                  {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "⌫"].map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        if (key === "⌫") handleBackspace();
                        else handleNumberClick(key);
                      }}
                      className="h-11 text-lg font-semibold rounded-xl bg-gray-100 hover:bg-gray-200 active:bg-gray-300 transition-colors"
                    >
                      {key}
                    </button>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleClear}
                  className="w-full mt-2 text-xs"
                >
                  Clear Amount
                </Button>
              </Card>
            )}

            {/* Category Selection */}
            <div>
              <Label className="flex items-center gap-2 mb-2 font-semibold text-gray-700">
                <Tag className="w-4 h-4 text-blue-600" />
                Category
              </Label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {activeCategories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setSelectedCategory(category.name)}
                    className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 transition-all cursor-pointer ${
                      selectedCategory === category.name
                        ? "border-blue-600 bg-blue-50/80 shadow-sm"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div className={`w-9 h-9 ${category.color} rounded-full flex items-center justify-center text-lg`}>
                      {category.icon}
                    </div>
                    <span className="text-[11px] font-medium text-gray-700 text-center truncate w-full px-1">
                      {category.name}
                    </span>
                  </button>
                ))}
                
                <button
                  type="button"
                  onClick={() => setShowAddCategory(true)}
                  className="flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all text-gray-500 bg-white cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center border-2 border-current">
                    <span className="text-lg leading-none">+</span>
                  </div>
                  <span className="text-[11px] font-medium text-center">New</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Wallet, Date, Note & Submit Button */}
          <div className="space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Wallet Selection */}
              <div>
                <Label className="flex items-center gap-2 mb-2 font-semibold text-gray-700">
                  <Wallet className="w-4 h-4 text-blue-600" />
                  {transactionType === "expense" ? "From Wallet" : "To Wallet"}
                </Label>
                <Select value={selectedWallet} onValueChange={setSelectedWallet}>
                  <SelectTrigger className="h-11 rounded-xl bg-white border-gray-200">
                    <SelectValue placeholder="Select wallet" />
                  </SelectTrigger>
                  <SelectContent>
                    {wallets.map((wallet) => (
                      <SelectItem key={wallet.id} value={String(wallet.id)}>
                        {wallet.icon} {wallet.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Picker */}
              <div>
                <Label className="flex items-center gap-2 mb-2 font-semibold text-gray-700">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  Date
                </Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="h-11 rounded-xl bg-white border-gray-200"
                />
              </div>

              {/* Note */}
              <div>
                <Label className="flex items-center gap-2 mb-2 font-semibold text-gray-700">
                  <StickyNote className="w-4 h-4 text-blue-600" />
                  Note (Optional)
                </Label>
                <Textarea
                  placeholder="Add a note or description..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  className="rounded-xl bg-white border-gray-200"
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting || !amount || !selectedCategory || !selectedWallet}
              className={`w-full py-6 rounded-xl font-bold text-base shadow-md cursor-pointer transition-all ${
                transactionType === "expense"
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
            >
              {isSubmitting ? "Saving..." : `Add ${transactionType === "expense" ? "Expense" : "Income"}`}
            </Button>
          </div>
        </div>
      </form>

      {/* Add Custom Category Modal */}
      {showAddCategory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <Card className="bg-white rounded-2xl w-full max-w-sm flex flex-col max-h-[85vh] shadow-2xl">
            <div className="p-6 border-b sticky top-0 bg-white z-10 rounded-t-2xl">
              <h3 className="font-bold text-lg text-center text-gray-900">
                Add {transactionType === "expense" ? "Expense" : "Income"} Category
              </h3>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div>
                <Label className="text-gray-700 font-medium">Category Name</Label>
                <Input
                  autoFocus
                  placeholder="e.g. Subscriptions"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label className="text-gray-700 font-medium">Pick an Icon</Label>
                <div className="grid grid-cols-6 gap-2 mt-2">
                  {iconsToChoose.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setNewCategoryIcon(icon)}
                      className={`text-2xl p-2 rounded-lg border-2 transition-all ${
                        newCategoryIcon === icon ? "border-blue-500 bg-blue-50" : "border-gray-100 hover:bg-gray-50"
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-gray-700 font-medium">Pick a Color</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {colorsToChoose.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewCategoryColor(color)}
                      className={`h-10 rounded-lg ${color} border-4 transition-all ${
                        newCategoryColor === color ? "border-white ring-2 ring-blue-500 scale-110" : "border-transparent opacity-80 hover:opacity-100"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t sticky bottom-0 bg-white z-10 rounded-b-2xl">
              <div className="flex gap-3">
                <Button 
                  type="button"
                  onClick={() => setShowAddCategory(false)} 
                  variant="outline" 
                  className="flex-1 rounded-xl"
                >
                  Cancel
                </Button>
                <Button 
                  type="button"
                  onClick={handleAddCategory} 
                  disabled={!newCategoryName} 
                  className="flex-1 bg-blue-600 hover:bg-blue-700 rounded-xl"
                >
                  Save
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
