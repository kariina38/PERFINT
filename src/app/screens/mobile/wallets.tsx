import { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { formatRupiah } from "../../utils/currency";
import { walletsApi, type Wallet } from "../../utils/api";
import { toast } from "sonner";

export function Wallets() {
  const [showAddWallet, setShowAddWallet] = useState(false);
  const [walletName, setWalletName] = useState("");
  const [walletBalance, setWalletBalance] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const walletTypes = [
    { id: "cash", name: "Cash", icon: "💵", color: "bg-gradient-to-br from-green-500 to-green-600" },
    { id: "bank", name: "Bank Account", icon: "🏦", color: "bg-gradient-to-br from-blue-500 to-blue-600" },
    { id: "ewallet", name: "E-Wallet", icon: "📱", color: "bg-gradient-to-br from-emerald-500 to-emerald-600" },
    { id: "credit", name: "Credit Card", icon: "💳", color: "bg-gradient-to-br from-purple-500 to-purple-600" },
  ];

  const walletIcons = ["💵", "🏦", "📱", "💳", "💰", "🎯", "🔷", "⭐", "🌟", "✨"];

  useEffect(() => {
    loadWallets();
  }, []);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (showAddWallet) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showAddWallet]);

  const loadWallets = async () => {
    try {
      const data = await walletsApi.getAll();
      setWallets(data.wallets);
    } catch (err) {
      console.error("Failed to load wallets:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddWallet = async () => {
    try {
      const type = walletTypes.find(t => t.id === selectedType);
      await walletsApi.create({
        name: walletName,
        type: selectedType || "cash",
        icon: selectedIcon || type?.icon || "💵",
        color: type?.color || "bg-gradient-to-br from-green-500 to-green-600",
        balance: parseFloat(walletBalance) || 0,
      });
      toast.success("Wallet added successfully!");
      setShowAddWallet(false);
      setWalletName("");
      setWalletBalance("");
      setSelectedType(null);
      setSelectedIcon(null);
      loadWallets();
    } catch (err: any) {
      toast.error(err.message || "Failed to add wallet.");
    }
  };

  const totalBalance = wallets.reduce((sum, wallet) => sum + wallet.balance, 0);

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">My Wallets</h1>
        <p className="text-sm text-gray-500">Manage your payment sources</p>
      </div>

      {/* Total Balance Summary */}
      <Card className="bg-gradient-to-br from-indigo-600 to-indigo-700 text-white p-6 rounded-2xl shadow-lg">
        <p className="text-indigo-100 text-sm mb-2">Total Balance Across All Wallets</p>
        <h2 className="text-3xl font-bold">{formatRupiah(totalBalance)}</h2>
      </Card>

      {/* Wallets List */}
      <div className="space-y-3">
        <h3 className="font-medium text-gray-700 text-sm">Your Wallets</h3>
        {wallets.length === 0 && !isLoading ? (
          <Card className="p-8 rounded-xl text-center">
            <p className="text-gray-500">No wallets yet. Add your first wallet!</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {wallets.map((wallet) => (
              <Card
                key={wallet.id}
                className="p-4 rounded-xl hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 ${wallet.color} rounded-xl flex items-center justify-center`}>
                      <div className="text-white text-xl">{wallet.icon}</div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{wallet.name}</h4>
                      <p className="text-sm text-gray-500">Available Balance</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{formatRupiah(wallet.balance)}</p>
                    {totalBalance > 0 && (
                      <p className="text-xs text-gray-500">
                        {((wallet.balance / totalBalance) * 100).toFixed(1)}%
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add Wallet Modal */}
      {showAddWallet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end md:items-center justify-center z-50">
          <Card className="bg-white rounded-t-3xl md:rounded-2xl w-full md:w-[480px] max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between rounded-t-3xl">
              <h3 className="text-lg font-bold text-gray-900">Add New Wallet</h3>
              <button
                onClick={() => setShowAddWallet(false)}
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Wallet Name</label>
                <input
                  type="text"
                  placeholder="e.g., My Bank Account"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={walletName}
                  onChange={(e) => setWalletName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Initial Balance</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">Rp</span>
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={walletBalance}
                    onChange={(e) => setWalletBalance(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Wallet Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {walletTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type.id)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        selectedType === type.id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className={`w-12 h-12 ${type.color} rounded-xl flex items-center justify-center`}>
                          <span className="text-2xl">{type.icon}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{type.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Choose Icon</label>
                <div className="grid grid-cols-5 gap-2">
                  {walletIcons.map((icon) => (
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

              <div className="space-y-3 pt-4 sticky bottom-0 bg-white z-10 pb-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <Button
                  onClick={handleAddWallet}
                  disabled={!walletName || !selectedType}
                  className="w-full py-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Add Wallet
                </Button>
                <Button onClick={() => setShowAddWallet(false)} variant="outline" className="w-full py-6 rounded-xl">
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      <button
        onClick={() => setShowAddWallet(true)}
        className="fixed bottom-24 right-4 sm:right-6 md:right-8 lg:right-[calc(50%-300px+1.5rem)] w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 z-40"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}