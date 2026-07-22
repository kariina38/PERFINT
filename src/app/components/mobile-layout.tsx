import { Outlet, Link, useLocation, useNavigate } from "react-router";
import {
  Home,
  Wallet,
  PlusCircle,
  Target,
  Settings as SettingsIcon,
  Sparkles,
  LogOut,
  CreditCard,
} from "lucide-react";
import { useAuth } from "../contexts/auth-context";
import { UserAvatar } from "./user-avatar";

export function MobileLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navItems = [
    { path: "/app", icon: Home, label: "Dashboard" },
    { path: "/app/wallets", icon: Wallet, label: "Wallets" },
    { path: "/app/add-transaction", icon: PlusCircle, label: "Add Transaction" },
    { path: "/app/budgeting", icon: Target, label: "Budgeting" },
    { path: "/app/ai", icon: Sparkles, label: "AI Advisor" },
    { path: "/app/settings", icon: SettingsIcon, label: "Settings" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* ========================================================================= */}
      {/* DESKTOP SIDEBAR NAVIGATION (Visible on md: flex >=768px, hidden on mobile) */}
      {/* ========================================================================= */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-white border-r border-gray-200 min-h-screen sticky top-0 h-screen z-30 shadow-sm flex-shrink-0">
        {/* Brand Header */}
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-lg leading-tight">Finance Tracker</h1>
            <p className="text-xs text-gray-500 font-medium">Personal Finance App</p>
          </div>
        </div>

        {/* Sidebar Navigation Items */}
        <div className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Main Menu
          </p>
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl font-medium text-sm transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 font-semibold"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-gray-400"}`} />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>

        {/* Desktop User Profile Badge at Bottom */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-gray-100 transition-colors group">
            <Link to="/app/profile" className="flex items-center gap-3 flex-1 min-w-0">
              <UserAvatar name={user?.name} avatar={user?.avatar} size="md" />
              <div className="min-w-0 flex-1">
                <p className="font-bold text-sm text-gray-900 truncate">{user?.name || "User"}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email || ""}</p>
              </div>
            </Link>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* MAIN CONTENT AREA (Fills screen smoothly on desktop & mobile) */}
      {/* ========================================================================= */}
      <main className="flex-1 min-w-0 bg-gray-50 min-h-screen pb-24 md:pb-8">
        <div className="w-full max-w-7xl mx-auto md:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>

      {/* ========================================================================= */}
      {/* MOBILE BOTTOM NAVIGATION (Visible on mobile <768px, hidden on desktop) */}
      {/* ========================================================================= */}
      <nav className="fixed bottom-0 left-0 right-0 md:hidden bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`flex flex-col items-center gap-1 transition-colors min-w-[56px] py-1 ${
                  isActive ? "text-blue-600" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium leading-tight">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}