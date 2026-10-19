import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { LocationProvider } from "@/context/LocationContext";
import { DonationProvider } from "@/context/DonationContext";
import { NGOProvider } from "@/context/NGOContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";

import RoleSelection from "./pages/RoleSelection";
import Auth from "./pages/Auth";
import NGOSelection from "./pages/NGOSelection";
import NGOBrowse from "./pages/NGOBrowse";
import DonorDashboard from "./pages/DonorDashboard";
import NGODashboard from "./pages/NGODashboard";
import AppAdminDashboard from "./pages/AppAdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function DashboardRouter() {
  const { role } = useAuth();

  if (role === 'donor') {
    return <NGOBrowse />;
  } else if (role === 'ngo_admin') {
    return <NGODashboard />;
  } else if (role === 'app_admin') {
    return <AppAdminDashboard />;
  }

  return <NotFound />;
}

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<RoleSelection />} />
    <Route path="/ngo-selection" element={<NGOSelection />} />
    <Route path="/auth" element={<Auth />} />
    <Route
      path="/dashboard"
      element={
        <ProtectedRoute>
          <DashboardRouter />
        </ProtectedRoute>
      }
    />
    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LocationProvider>
        <AuthProvider>
          <NGOProvider>
            <DonationProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <AppRoutes />
              </BrowserRouter>
            </DonationProvider>
          </NGOProvider>
        </AuthProvider>
      </LocationProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
