import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { DateProvider } from "@/contexts/DateContext";
import { lazy, Suspense } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const Login = lazy(() => import("./pages/Login"));
const ChangePassword = lazy(() => import("./pages/ChangePassword"));
const Fasting = lazy(() => import("./pages/Fasting"));
const Progress = lazy(() => import("./pages/Progress"));
const Profile = lazy(() => import("./pages/Profile"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const FastingQuiz = lazy(() => import("./pages/FastingQuiz"));
const FastingResult = lazy(() => import("./pages/FastingResult"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const Content = lazy(() => import("./pages/Content"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Install = lazy(() => import("./pages/Install"));
const Register = lazy(() => import("./pages/Register"));
const Help = lazy(() => import("./pages/Help"));
const MetabolicQuiz = lazy(() => import("./pages/MetabolicQuiz"));
const MetabolicResult = lazy(() => import("./pages/MetabolicResult"));

const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <DateProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Navigate to="/fasting" replace />} />
                <Route path="/dashboard" element={<Navigate to="/fasting" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
                <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
                <Route path="/fasting" element={<ProtectedRoute><Fasting /></ProtectedRoute>} />
                <Route path="/fasting-quiz" element={<ProtectedRoute><FastingQuiz /></ProtectedRoute>} />
                <Route path="/fasting-result" element={<ProtectedRoute><FastingResult /></ProtectedRoute>} />
                <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/content" element={<ProtectedRoute><Content /></ProtectedRoute>} />
                <Route path="/metabolic-quiz" element={<ProtectedRoute><MetabolicQuiz /></ProtectedRoute>} />
                <Route path="/metabolic-result" element={<ProtectedRoute><MetabolicResult /></ProtectedRoute>} />
                <Route path="/help" element={<ProtectedRoute><Help /></ProtectedRoute>} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/install" element={<Install />} />
                <Route path="/registro" element={<Register />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              </Suspense>
            </TooltipProvider>
          </DateProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
