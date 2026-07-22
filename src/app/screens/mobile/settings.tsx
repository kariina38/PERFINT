import { useState } from "react";
import { useNavigate } from "react-router";
import {
  User,
  Lock,
  Bell,
  Fingerprint,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { Card } from "../../components/ui/card";
import { Switch } from "../../components/ui/switch";
import { Button } from "../../components/ui/button";
import { useAuth } from "../../contexts/auth-context";
import { UserAvatar } from "../../components/user-avatar";

export function Settings() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [budgetAlerts, setBudgetAlerts] = useState(true);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const settingsSections = [
    {
      title: "Account",
      items: [
        { icon: User, label: "Profile Information", action: () => navigate("/app/profile") },
        { icon: Lock, label: "Change Password", action: () => navigate("/app/change-password") },
      ],
    },
    {
      title: "Notifications",
      items: [
        {
          icon: Bell,
          label: "Budget Limit Alerts",
          hasSwitch: true,
          value: budgetAlerts,
          onChange: setBudgetAlerts,
        },
      ],
    },
    {
      title: "Support",
      items: [
        { icon: HelpCircle, label: "Help Center", action: () => navigate("/app/help") },
        { icon: HelpCircle, label: "Terms & Privacy", action: () => navigate("/app/terms") },
      ],
    },
  ];

  return (
    <div className="p-4 space-y-4 pb-24">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500">Manage your preferences</p>
      </div>

      {/* User Profile Card */}
      <Card className="p-4 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700">
        <div className="flex items-center gap-4">
          <UserAvatar
            name={user?.name}
            avatar={user?.avatar}
            size="lg"
            className="cursor-pointer hover:scale-105 transition-transform"
            onClick={() => navigate("/app/profile")}
          />
          <div className="text-white">
            <h3 className="font-bold">{user?.name || "User"}</h3>
            <p className="text-sm text-blue-100">{user?.email || ""}</p>
            <p className="text-sm text-blue-100">{user?.phone || ""}</p>
          </div>
        </div>
      </Card>

      {/* Settings Sections */}
      {settingsSections.map((section, sectionIndex) => (
        <div key={sectionIndex} className="space-y-2">
          <h3 className="font-medium text-gray-700 text-sm px-2">{section.title}</h3>
          <Card className="rounded-2xl overflow-hidden divide-y">
            {section.items.map((item, itemIndex) => {
              const Icon = item.icon;
              return (
                <div
                  key={itemIndex}
                  className={`w-full p-4 flex items-center justify-between ${
                    !item.hasSwitch ? 'hover:bg-gray-50 cursor-pointer active:bg-gray-100' : ''
                  }`}
                  onClick={!item.hasSwitch ? item.action : undefined}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                      <Icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-gray-900">{item.label}</span>
                  </div>
                  {item.hasSwitch ? (
                    <Switch
                      checked={item.value}
                      onCheckedChange={item.onChange}
                    />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              );
            })}
          </Card>
        </div>
      ))}

      {/* Logout Button */}
      <Button
        onClick={handleLogout}
        variant="outline"
        className="w-full py-6 rounded-xl border-red-200 text-red-600 hover:bg-red-50"
      >
        <LogOut className="w-5 h-5 mr-2" />
        Logout
      </Button>

      {/* App Version */}
      <p className="text-center text-sm text-gray-400 pt-4">Version 1.0.0</p>
    </div>
  );
}