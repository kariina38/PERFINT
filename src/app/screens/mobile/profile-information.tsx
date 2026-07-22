import { useNavigate } from "react-router";
import { ArrowLeft, User, Mail, Phone, Calendar, Camera, Trash2, Loader2 } from "lucide-react";
import { Card } from "../../components/ui/card";
import { useState } from "react";
import { useAuth } from "../../contexts/auth-context";
import { usersApi } from "../../utils/api";
import { toast } from "sonner";
import { UserAvatar } from "../../components/user-avatar";

// Bulletproof file reader
const readFileAsDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

// Image compression helper (falls back gracefully to raw base64 if canvas scaling fails)
const compressProfileImage = async (file: File): Promise<string> => {
  const dataUrl = await readFileAsDataUrl(file);
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const maxWidth = 400;
        const maxHeight = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        const result = canvas.toDataURL("image/jpeg", 0.85);
        resolve(result || dataUrl);
      } catch {
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
};

export function ProfileInformation() {
  const navigate = useNavigate();
  const { user, updateUser, refreshUser } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [imgError, setImgError] = useState(false);

  const profileData = [
    {
      icon: User,
      label: "Full Name",
      value: user?.name || "N/A",
    },
    {
      icon: Mail,
      label: "Email Address",
      value: user?.email || "N/A",
    },
    {
      icon: Phone,
      label: "Phone Number",
      value: user?.phone || "N/A",
    },
    {
      icon: Calendar,
      label: "Member Since",
      value: user?.created_at
        ? new Date(user.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
        : new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
    },
  ];

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log("📸 File selected:", file.name, file.size, file.type);
    setIsUploading(true);
    setImgError(false);

    try {
      const base64Image = await compressProfileImage(file);
      console.log("🖼️ Compressed image length:", base64Image.length);

      const res = await usersApi.updateProfile({ avatar: base64Image });
      console.log("✅ UPDATE PROFILE RESPONSE:", res);

      if (res?.user) {
        updateUser(res.user);
        toast.success("Profile photo updated successfully!");
      }
    } catch (err: any) {
      console.error("❌ Profile photo upload error:", err);
      toast.error(err.message || "Failed to upload photo.");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleRemovePhoto = async () => {
    setIsUploading(true);
    setImgError(false);

    try {
      const res = await usersApi.updateProfile({ avatar: null });
      if (res?.user) {
        updateUser(res.user);
      } else {
        await refreshUser();
      }
      toast.success("Profile photo removed.");
    } catch (err: any) {
      toast.error(err.message || "Failed to remove photo.");
    } finally {
      setIsUploading(false);
    }
  };

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
          <h1 className="text-lg font-bold text-gray-900">Profile Information</h1>
        </div>
      </div>

      <div className="p-4 space-y-6 pb-24">
        {/* Native Label File Upload Container */}
        <div className="flex flex-col items-center gap-3 py-4">
          <label
            htmlFor="profile-avatar-input"
            className="relative cursor-pointer group block focus:outline-none"
            title="Click to upload profile photo"
          >
            <input
              id="profile-avatar-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
              disabled={isUploading}
            />

            {isUploading ? (
              <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
            ) : (
              <UserAvatar
                name={user?.name}
                avatar={imgError ? null : user?.avatar}
                size="xl"
                className="border-4 border-white shadow-lg group-hover:scale-105 transition-transform"
              />
            )}

            {/* Pure Avatar without Camera Badge */}
          </label>

          {/* User Name & Member Since */}
          <div className="text-center">
            <h2 className="font-bold text-gray-900 text-lg">{user?.name || "User"}</h2>
            <p className="text-sm text-gray-500">
              Member since {user?.created_at ? new Date(user.created_at).getFullYear() : new Date().getFullYear()}
            </p>
          </div>

          {/* Remove Photo Action if Avatar Exists */}
          {user?.avatar && !isUploading && (
            <button
              onClick={handleRemovePhoto}
              className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 font-medium py-1 px-3 rounded-full hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Remove Photo
            </button>
          )}
        </div>

        {/* Profile Details */}
        <div className="space-y-3">
          {profileData.map((item, index) => {
            const Icon = item.icon;
            return (
              <Card key={index} className="p-4 rounded-2xl">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-1">{item.label}</p>
                    <p className="text-gray-900 font-medium">{item.value}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Account Status */}
        <Card className="p-4 rounded-2xl bg-blue-50 border-blue-100">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <div>
              <p className="font-medium text-gray-900">Account Status</p>
              <p className="text-sm text-gray-600">Verified & Active</p>
            </div>
          </div>
        </Card>

        {/* Info Note */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <p className="text-sm text-blue-800">
            <span className="font-medium">Note:</span> To update your profile information, please contact our support team or visit the Help Center.
          </p>
        </div>
      </div>
    </div>
  );
}