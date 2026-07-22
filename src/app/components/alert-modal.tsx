import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { AlertTriangle, Shield } from "lucide-react";

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "budget" | "security";
  customTitle?: string;
  customDescription?: string;
  customDetails?: { label: string; value: string }[];
  onAction?: () => void;
}

export function AlertModal({ isOpen, onClose, type, customTitle, customDescription, customDetails, onAction }: AlertModalProps) {
  const alerts = {
    budget: {
      icon: AlertTriangle,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      title: "Budget Limit Alert",
      description: "You've reached 90% of your monthly Food budget limit. Consider reducing spending in this category.",
      details: [
        { label: "Category", value: "Food" },
        { label: "Spent", value: "Rp2.250.000 of Rp2.500.000" },
        { label: "Remaining", value: "Rp250.000" },
      ],
    },
    security: {
      icon: Shield,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      title: "Security Alert",
      description: "New device login detected from iPhone 13 Pro in New York, USA.",
      details: [
        { label: "Device", value: "iPhone 13 Pro" },
        { label: "Location", value: "New York, USA" },
        { label: "Time", value: "2 hours ago" },
      ],
    },
  };

  const alert = alerts[type];
  const Icon = alert.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className={`w-16 h-16 ${alert.iconBg} rounded-full flex items-center justify-center`}>
              <Icon className={`w-8 h-8 ${alert.iconColor}`} />
            </div>
          </div>
          <DialogTitle className="text-center">{customTitle || alert.title}</DialogTitle>
          <DialogDescription className="text-center">
            {customDescription || alert.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {(customDetails || alert.details).map((detail, index) => (
            <div key={index} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
              <span className="text-sm text-gray-500">{detail.label}</span>
              <span className="text-sm font-medium text-gray-900">{detail.value}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Button onClick={onClose} variant="outline" className="flex-1">
            Dismiss
          </Button>
          <Button onClick={onAction || onClose} className="flex-1 bg-blue-600 hover:bg-blue-700">
            {type === "budget" ? "View Budget" : "Review Activity"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
