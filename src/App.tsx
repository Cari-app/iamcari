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
import Dashboard from "./pages/Dashboard";
import Fasting from "./pages/Fasting";
import Progress from "./pages/Progress";
import Profile from "./pages/Profile";
import Onboarding from "./pages/Onboarding";
import Assessment from "./pages/Assessment";
import NutritionQuiz from "./pages/NutritionQuiz";
import FastingQuiz from "./pages/FastingQuiz";
import FastingResult from "./pages/FastingResult";
import DietResult from "./pages/DietResult";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import ExploreDiets from "./pages/ExploreDiets";
import DietDetail from "./pages/DietDetail";
import NotFound from "./pages/NotFound";
import Help from "./pages/Help";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <DateProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <InstallPWAButton />
              <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
              <Route path="/assessment" element={<ProtectedRoute><Assessment /></ProtectedRoute>} />
              <Route path="/nutrition-quiz" element={<ProtectedRoute><NutritionQuiz /></ProtectedRoute>} />
              <Route path="/fasting-quiz" element={<ProtectedRoute><FastingQuiz /></ProtectedRoute>} />
              <Route path="/fasting-result" element={<ProtectedRoute><FastingResult /></ProtectedRoute>} />
              <Route path="/diet-result" element={<ProtectedRoute><DietResult /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/fasting" element={<ProtectedRoute><Fasting /></ProtectedRoute>} />
              <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/diets" element={<ProtectedRoute><ExploreDiets /></ProtectedRoute>} />
              <Route path="/diet-detail" element={<ProtectedRoute><DietDetail /></ProtectedRoute>} />
              <Route path="/help" element={<ProtectedRoute><Help /></ProtectedRoute>} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          </TooltipProvider>
        </DateProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
