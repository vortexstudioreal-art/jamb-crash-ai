import { lazy, Suspense } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { TrialProvider } from "@/contexts/TrialContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PasswordRecoveryHandler } from "@/components/PasswordRecoveryHandler";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { InstallPrompt } from "@/components/InstallPrompt";
import { OfflineReadyChecklist } from "@/components/OfflineReadyChecklist";

import { ErrorBoundary } from "@/components/ErrorBoundary";

const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const Settings = lazy(() => import("./pages/Settings"));
const CollaboratorDashboard = lazy(() => import("./pages/CollaboratorDashboard"));
const RepeatedQuestionsPage = lazy(() => import("./pages/RepeatedQuestionsPage"));
const GamesPage = lazy(() => import("./pages/GamesPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const JambRepeatsPastQuestions = lazy(() => import("./pages/JambRepeatsPastQuestions"));
const ResellerDashboard = lazy(() => import("./pages/ResellerDashboard"));
const PinRedeemPage = lazy(() => import("./pages/PinRedeemPage"));

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
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <TrialProvider>
              <ErrorBoundary>
              <PasswordRecoveryHandler>
                <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
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
                  <Route path="/games" element={<ProtectedRoute><GamesPage /></ProtectedRoute>} />
                  <Route path="/jamb-repeats-past-questions" element={<JambRepeatsPastQuestions />} />
                  <Route path="/reseller" element={<ProtectedRoute><ResellerDashboard /></ProtectedRoute>} />
                  <Route path="/redeem-pin" element={<PinRedeemPage />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
                </Suspense>
                {/* Global Components */}
                <OfflineIndicator variant="minimal" />
                <InstallPrompt />
                <OfflineReadyChecklist />
              </PasswordRecoveryHandler>
              </ErrorBoundary>
            </TrialProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

