import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { DateProvider } from "@/contexts/DateContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { InstallPWAButton } from "@/components/InstallPWAButton";
import Login from "./pages/Login";
import ChangePassword from "./pages/ChangePassword";
import Fasting from "./pages/Fasting";
import Progress from "./pages/Progress";
import Profile from "./pages/Profile";
import Onboarding from "./pages/Onboarding";
import FastingQuiz from "./pages/FastingQuiz";
import FastingResult from "./pages/FastingResult";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Content from "./pages/Content";
import NotFound from "./pages/NotFound";
import Help from "./pages/Help";

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
              <InstallPWAButton />
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
                <Route path="/help" element={<ProtectedRoute><Help /></ProtectedRoute>} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </TooltipProvider>
          </DateProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
