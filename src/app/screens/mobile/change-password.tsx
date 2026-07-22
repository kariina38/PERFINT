import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Lock, Eye, EyeOff } from "lucide-react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { usersApi } from "../../utils/api";
import { toast } from "sonner";

export function ChangePassword() {
  const navigate = useNavigate();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);



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
          <h1 className="text-lg font-bold text-gray-900">Change Password</h1>
        </div>
      </div>

      <div className="p-4 space-y-6 pb-24">
        {/* Info Card */}
        <Card className="p-4 rounded-2xl bg-blue-50 border-blue-100">
          <div className="flex gap-3">
            <Lock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900 mb-1">Secure Your Account</p>
              <p className="text-sm text-gray-600">
                Choose a strong password to protect your financial data.
              </p>
            </div>
          </div>
        </Card>

        {/* Password Form */}
        <div className="space-y-4">
          {/* Current Password */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Current Password
            </label>
            <Card className="p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-gray-400" />
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  placeholder="Enter current password"
                  className="flex-1 outline-none bg-transparent"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <button
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="p-1"
                >
                  {showCurrentPassword ? (
                    <EyeOff className="w-5 h-5 text-gray-400" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>
            </Card>
          </div>

          {/* New Password */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              New Password
            </label>
            <Card className="p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-gray-400" />
                <input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  className="flex-1 outline-none bg-transparent"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="p-1"
                >
                  {showNewPassword ? (
                    <EyeOff className="w-5 h-5 text-gray-400" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>
            </Card>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Confirm New Password
            </label>
            <Card className="p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  className="flex-1 outline-none bg-transparent"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="p-1"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5 text-gray-400" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>
            </Card>
          </div>
        </div>



        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            className="w-full py-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
            disabled={isSubmitting || !currentPassword || !newPassword || !confirmPassword}
            onClick={async () => {
              if (newPassword !== confirmPassword) {
                toast.error("New passwords do not match.");
                return;
              }
              if (newPassword.length < 4) {
                toast.error("New password must be at least 4 characters.");
                return;
              }

              setIsSubmitting(true);
              try {
                await usersApi.changePassword(currentPassword, newPassword);
                toast.success("Password changed successfully!");
                navigate(-1);
              } catch (err: any) {
                toast.error(err.message || "Failed to change password.");
              } finally {
                setIsSubmitting(false);
              }
            }}
          >
            {isSubmitting ? "Updating..." : "Update Password"}
          </Button>
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="w-full py-6 rounded-xl"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
