import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import { Layout } from "@/components/layout/Layout";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Public pages
import Index from "./pages/Index";
import AllPapersPage from "./pages/AllPapersPage";
import PaperDetailPage from "./pages/PaperDetailPage";
import StrandsPage from "./pages/StrandsPage";
import AboutPage from "./pages/AboutPage";
import ProfileSettingsPage from "./pages/ProfileSettingsPage";
import NotFound from "./pages/NotFound";

// Admin pages
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminPapersPage from "./pages/admin/AdminPapersPage";
import AdminStrandsPage from "./pages/admin/AdminStrandsPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminActivityLogsPage from "./pages/admin/AdminActivityLogsPage";

import { useEffect } from "react";
import { useAdminStore } from "@/store/adminStore";

const queryClient = new QueryClient();

const App = () => {
  const checkAuth = useAdminStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();

    // Check auth status every 30 seconds to detect kicks/session expiry
    const interval = setInterval(() => {
      checkAuth();
    }, 30000);

    return () => clearInterval(interval);
  }, [checkAuth]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <ScrollToTop />
          <Routes>
            {/* Protected public routes - require login */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/home" element={<Index />} />
                <Route path="/papers" element={<AllPapersPage />} />
                <Route path="/papers/:id" element={<PaperDetailPage />} />
                <Route path="/strands" element={<StrandsPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/profile" element={<ProfileSettingsPage />} />
              </Route>
            </Route>

            {/* Admin and Auth routes */}
            <Route path="/" element={<AdminLoginPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboardPage />} />
                <Route path="papers" element={<AdminPapersPage />} />
                <Route path="strands" element={<AdminStrandsPage />} />
                <Route path="users" element={<AdminUsersPage />} />
                <Route path="activity-logs" element={<AdminActivityLogsPage />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
