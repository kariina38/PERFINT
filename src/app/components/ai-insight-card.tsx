import { TrendingUp, AlertTriangle, Sparkles, ArrowRight } from "lucide-react";
import { Card } from "./ui/card";
import { formatRupiah } from "../utils/currency";

interface AIInsightCardProps {
  forecast: {
    status: "healthy" | "warning" | "critical";
    summary: string;
    atRiskCategories: Array<{
      name: string;
      predictedSpent: number;
      daysUntilOverflow: number | null;
      riskLevel: "high" | "medium";
    }>;
    tips: string[];
  };
}

export function AIInsightCard({ forecast }: AIInsightCardProps) {
  const getStatusColors = () => {
    switch (forecast.status) {
      case "critical": return "from-red-500/10 to-orange-500/10 border-red-200";
      case "warning": return "from-orange-500/10 to-amber-500/10 border-orange-200";
      default: return "from-blue-500/10 to-indigo-500/10 border-blue-200";
    }
  };

  const getStatusIcon = () => {
    switch (forecast.status) {
      case "critical": return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case "warning": return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      default: return <Sparkles className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <Card className={`relative overflow-hidden border-2 bg-gradient-to-br ${getStatusColors()} p-5 rounded-2xl`}>
      {/* Background Glow */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/20 blur-3xl rounded-full" />
      
      <div className="flex items-center gap-2 mb-3">
        <div className="p-2 bg-white rounded-lg shadow-sm">
          {getStatusIcon()}
        </div>
        <h3 className="font-bold text-gray-900">AI Financial Insights</h3>
      </div>

      <p className="text-sm text-gray-700 font-medium mb-4 leading-relaxed">
        {forecast.summary}
      </p>

      {forecast.atRiskCategories.length > 0 && (
        <div className="space-y-3 mb-4">
          {forecast.atRiskCategories.map((cat, idx) => (
            <div key={idx} className="bg-white/60 backdrop-blur-sm p-3 rounded-xl border border-white/40">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-bold text-gray-800">{cat.name}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                  cat.riskLevel === 'high' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                }`}>
                  {cat.riskLevel} risk
                </span>
              </div>
              <p className="text-xs text-gray-600 mb-2">
                Est. spend: <span className="font-bold">{formatRupiah(cat.predictedSpent)}</span>
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${cat.riskLevel === 'high' ? 'bg-red-500' : 'bg-orange-500'}`}
                    style={{ width: '85%' }} // Aesthetic only
                  />
                </div>
                <span className="text-[10px] text-gray-500 font-medium">
                  {cat.daysUntilOverflow ? `Exceeds in ~${cat.daysUntilOverflow} days` : 'Already over limit'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Smart Tips</p>
        {forecast.tips.map((tip, idx) => (
          <div key={idx} className="flex items-start gap-2">
            <div className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
            <p className="text-xs text-gray-600 leading-tight">{tip}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
