import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Shield, Smartphone, Mail, Key, CheckCircle2 } from "lucide-react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";

export function TwoFactorAuth() {
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [isEnabled, setIsEnabled] = useState(false);

  const authMethods = [
    {
      id: "sms",
      icon: Smartphone,
      title: "SMS Authentication",
      description: "Receive a verification code via text message",
      phone: "+1 234 567 8900",
    },
    {
      id: "email",
      icon: Mail,
      title: "Email Authentication",
      description: "Receive a verification code via email",
      email: "john.doe@email.com",
    },
    {
      id: "app",
      icon: Key,
      title: "Authenticator App",
      description: "Use an authenticator app like Google Authenticator",
      status: "Recommended",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="p-4 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="w-5 h-5 text-gray-900" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">Two-Factor Authentication</h1>
        </div>
      </div>

      <div className="p-4 space-y-6 pb-24">
        {/* Status Card */}
        <Card className={`p-4 rounded-2xl ${isEnabled ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isEnabled ? 'bg-green-100' : 'bg-yellow-100'}`}>
              <Shield className={`w-6 h-6 ${isEnabled ? 'text-green-600' : 'text-yellow-600'}`} />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">
                2FA is {isEnabled ? "Enabled" : "Disabled"}
              </p>
              <p className="text-sm text-gray-600">
                {isEnabled
                  ? "Your account is protected with 2FA"
                  : "Add an extra layer of security"}
              </p>
            </div>
          </div>
        </Card>

        {/* Info Section */}
        <div className="space-y-3">
          <h3 className="font-medium text-gray-900">What is Two-Factor Authentication?</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            Two-factor authentication (2FA) adds an extra layer of security to your account. 
            In addition to your password, you'll need to enter a verification code to access your account.
          </p>
        </div>

        {/* Authentication Methods */}
        <div className="space-y-3">
          <h3 className="font-medium text-gray-900">Choose Authentication Method</h3>
          
          {authMethods.map((method) => {
            const Icon = method.icon;
            const isSelected = selectedMethod === method.id;
            
            return (
              <Card
                key={method.id}
                className={`p-4 rounded-2xl cursor-pointer transition-all ${
                  isSelected ? 'border-blue-500 border-2 bg-blue-50' : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedMethod(method.id)}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isSelected ? 'bg-blue-600' : 'bg-blue-50'
                  }`}>
                    <Icon className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-blue-600'}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900">{method.title}</h4>
                      {method.status && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                          {method.status}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{method.description}</p>
                    {method.phone && (
                      <p className="text-sm text-gray-500">📱 {method.phone}</p>
                    )}
                    {method.email && (
                      <p className="text-sm text-gray-500">✉️ {method.email}</p>
                    )}
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Benefits */}
        <Card className="p-4 rounded-2xl bg-gray-50">
          <h4 className="font-medium text-gray-900 mb-3">Security Benefits</h4>
          <div className="space-y-2">
            {[
              "Protects against unauthorized access",
              "Secures your financial transactions",
              "Prevents account takeover",
              "Complies with security best practices",
            ].map((benefit, index) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span className="text-sm text-gray-700">{benefit}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          {!isEnabled ? (
            <Button
              onClick={() => setIsEnabled(true)}
              disabled={!selectedMethod}
              className="w-full py-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-300"
            >
              Enable Two-Factor Authentication
            </Button>
          ) : (
            <Button
              onClick={() => {
                setIsEnabled(false);
                setSelectedMethod(null);
              }}
              variant="outline"
              className="w-full py-6 rounded-xl border-red-200 text-red-600 hover:bg-red-50"
            >
              Disable Two-Factor Authentication
            </Button>
          )}
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="w-full py-6 rounded-xl"
          >
            Back to Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
