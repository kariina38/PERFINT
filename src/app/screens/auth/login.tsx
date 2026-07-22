import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Mail, Lock, Eye, EyeOff, Loader2, Wallet } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { useAuth } from "../../contexts/auth-context";
import { toast } from "sonner";

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      toast.success("Login successful!");
      navigate("/app");
    } catch (err: any) {
      toast.error(err.message || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricLogin = () => {
    navigate("/app");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[600px]">
        {/* Left Side: Premium Marketing & Welcome Column */}
        <div className="lg:col-span-7 bg-gradient-to-br from-blue-600 to-indigo-800 p-8 sm:p-12 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Background Glows */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-12 -translate-y-12"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl translate-x-24 translate-y-24"></div>

          {/* Top Brand Logo & Title */}
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-md">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight leading-none">Perfint</h2>
                <span className="text-[10px] text-blue-200 font-bold uppercase tracking-wider">Finance Smartly</span>
              </div>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight mb-4">
              Manage your money like a pro.
            </h1>
            <p className="text-blue-100 text-sm sm:text-base max-w-md leading-relaxed">
              Perfint combines smart budgeting, multi-wallet tracking, and AI-powered insights to help you build financial freedom effortlessly.
            </p>
          </div>

          {/* Features Checklist */}
          <div className="relative z-10 my-10 space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                <span className="text-xl">🤖</span>
              </div>
              <div>
                <h4 className="font-bold text-sm sm:text-base">FinAI Assistant</h4>
                <p className="text-blue-200 text-xs sm:text-sm">Get real-time insights and automated financial advice customized for you.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                <span className="text-xl">📊</span>
              </div>
              <div>
                <h4 className="font-bold text-sm sm:text-base">Smart Budget Tracking</h4>
                <p className="text-blue-200 text-xs sm:text-sm">Set category spending limits and receive warnings when approaching your budget.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                <span className="text-xl">🧾</span>
              </div>
              <div>
                <h4 className="font-bold text-sm sm:text-base">AI Receipt OCR Scanner</h4>
                <p className="text-blue-200 text-xs sm:text-sm">Scan receipts instantly to automatically input transactions and categorize expenses.</p>
              </div>
            </div>
          </div>

          {/* Footer Callout */}
          <div className="relative z-10 text-xs text-blue-200 border-t border-white/10 pt-4 flex items-center justify-end">
            <span>Join thousands of smart spenders</span>
          </div>
        </div>

        {/* Right Side: Authentication Card */}
        <div className="lg:col-span-5 p-8 sm:p-12 flex flex-col justify-center bg-white">
          <div className="w-full max-w-sm mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
              <p className="text-sm text-gray-500 mt-1.5">Sign in to access your dashboard</p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <Label htmlFor="email" className="font-semibold text-gray-700">Email</Label>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-11 h-12 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-all shadow-none"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="font-semibold text-gray-700">Password</Label>
                  <Link to="/forgot-password" virtual-id="forgot-password-link" className="text-xs text-blue-600 hover:underline">
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative mt-1.5">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-11 pr-11 h-12 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-all shadow-none"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 h-12 rounded-xl font-bold transition-all shadow-md cursor-pointer mt-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            {/* Register Link */}
            <div className="mt-8 text-center border-t pt-6 border-gray-100">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link to="/register" className="text-blue-600 font-bold hover:underline">
                  Register
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}