import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PasswordRecoveryHandler } from "@/components/PasswordRecoveryHandler";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { InstallPrompt } from "@/components/InstallPrompt";

import Index from "./pages/Index";
import Auth from "./pages/Auth";
import PaymentSuccess from "./pages/PaymentSuccess";
import AdminPanel from "./pages/AdminPanel";
import Settings from "./pages/Settings";
import CollaboratorDashboard from "./pages/CollaboratorDashboard";
import RepeatedQuestionsPage from "./pages/RepeatedQuestionsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Initialize dark mode on app load
const initializeDarkMode = () => {
  const storedTheme = localStorage.getItem('jamb_theme');
  // Default to dark mode if no preference stored
  if (storedTheme === 'light') {
    document.documentElement.classList.remove('dark');
  } else {
    // Default to dark mode
    document.documentElement.classList.add('dark');
    if (!storedTheme) {
      localStorage.setItem('jamb_theme', 'dark');
    }
  }
};

// Run immediately to prevent flash
initializeDarkMode();

const App = () => {
  useEffect(() => {
    initializeDarkMode();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <PasswordRecoveryHandler>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/payment-success" element={<PaymentSuccess />} />
                <Route path="/settings" element={<Settings />} />
                <Route 
                  path="/admin" 
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminPanel />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/collaborator-dashboard" element={<CollaboratorDashboard />} />
                <Route path="/repeated-questions" element={<RepeatedQuestionsPage />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              {/* PWA Components */}
              <OfflineIndicator variant="minimal" />
              <InstallPrompt />
            </PasswordRecoveryHandler>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

