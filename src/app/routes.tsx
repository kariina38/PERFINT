import { createBrowserRouter, Navigate } from "react-router";
import { MobileLayout } from "./components/mobile-layout";
import { Login } from "./screens/auth/login";
import { Register } from "./screens/auth/register";
import { ForgotPassword } from "./screens/auth/forgot-password";
import { Dashboard } from "./screens/mobile/dashboard";

import { Wallets } from "./screens/mobile/wallets";
import { AddTransaction } from "./screens/mobile/add-transaction";
import { Budgeting } from "./screens/mobile/budgeting";
import { Settings } from "./screens/mobile/settings";
import { ProfileInformation } from "./screens/mobile/profile-information";
import { ChangePassword } from "./screens/mobile/change-password";
import { TwoFactorAuth } from "./screens/mobile/two-factor-auth";
import { HelpCenter } from "./screens/mobile/help-center";
import { TermsPrivacy } from "./screens/mobile/terms-privacy";
import { AIAdvisor } from "./screens/mobile/ai-advisor";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("auth_token");
  if (!token) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Login,
  },
  {
    path: "/register",
    Component: Register,
  },
  {
    path: "/forgot-password",
    Component: ForgotPassword,
  },
  {
    path: "/app",

    element: (
      <ProtectedRoute>
        <MobileLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, Component: Dashboard },
      { path: "wallets", Component: Wallets },
      { path: "add-transaction", Component: AddTransaction },
      { path: "budgeting", Component: Budgeting },
      { path: "settings", Component: Settings },
      { path: "profile", Component: ProfileInformation },
      { path: "change-password", Component: ChangePassword },
      { path: "two-factor", Component: TwoFactorAuth },
      { path: "help", Component: HelpCenter },
      { path: "terms", Component: TermsPrivacy },
      { path: "ai", Component: AIAdvisor },
    ],
  },
]);