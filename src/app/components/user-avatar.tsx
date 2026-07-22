interface UserAvatarProps {
  name?: string | null;
  avatar?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  onClick?: () => void;
}

export function getInitials(name?: string | null): string {
  if (!name || !name.trim()) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.trim().charAt(0).toUpperCase();
}

export function getAvatarGradient(name?: string | null): string {
  const gradients = [
    "bg-gradient-to-br from-blue-600 to-indigo-700",
    "bg-gradient-to-br from-purple-600 to-pink-600",
    "bg-gradient-to-br from-emerald-500 to-teal-700",
    "bg-gradient-to-br from-amber-500 to-orange-600",
    "bg-gradient-to-br from-rose-500 to-red-600",
    "bg-gradient-to-br from-cyan-600 to-blue-700",
  ];
  if (!name) return gradients[0];
  let sum = 0;
  for (let i = 0; i < name.length; i++) {
    sum += name.charCodeAt(i);
  }
  return gradients[sum % gradients.length];
}

export function UserAvatar({ name, avatar, size = "md", className = "", onClick }: UserAvatarProps) {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs font-bold",
    md: "w-10 h-10 text-sm font-bold",
    lg: "w-16 h-16 text-xl font-bold",
    xl: "w-24 h-24 text-3xl font-extrabold",
  }[size];

  const gradientClass = getAvatarGradient(name);
  const initials = getInitials(name);

  return (
    <div
      onClick={onClick}
      className={`rounded-full flex items-center justify-center overflow-hidden border-2 border-white shadow-md text-white select-none ${gradientClass} ${sizeClasses} ${className}`}
    >
      {avatar ? (
        <img
          src={avatar}
          alt={name || "User"}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Hide image element if corrupted URL
            (e.target as HTMLElement).style.display = "none";
          }}
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}
