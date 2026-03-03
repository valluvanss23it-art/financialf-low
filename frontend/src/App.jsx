import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Welcome from "./pages/Welcome";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Income from "./pages/Income";
import Expense from "./pages/Expense";
import FinancialData from "./pages/FinancialData";
import Calculators from "./pages/Calculators";
import Learn from "./pages/Learn";
import Goals from "./pages/Goals";
import Savings from "./pages/Savings";
import Assets from "./pages/Assets";
import Liabilities from "./pages/Liabilities";
import Insurance from "./pages/Insurance";
import Tax from "./pages/Tax";
import Investments from "./pages/Investments";
import Profile from "./pages/Profile";
import Reports from "./pages/Reports";
import { News } from "./pages/News";
import NotFound from "./pages/NotFound";

// Placeholder pages - will be implemented
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="min-h-screen flex items-center justify-center">
    <h1 className="text-2xl font-bold">{title} - Coming Soon</h1>
  </div>
);

const queryClient = new QueryClient();

const App = () => {
  console.log("App component rendering...");
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Welcome />} />
              <Route path="/dashboard" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/financial-data" element={<FinancialData />} />
              <Route path="/income" element={<Income />} />
              <Route path="/expense" element={<Expense />} />
              <Route path="/savings" element={<Savings />} />
              <Route path="/investments" element={<Investments />} />
              <Route path="/assets" element={<Assets />} />
              <Route path="/liabilities" element={<Liabilities />} />
              <Route path="/tax" element={<Tax />} />
              <Route path="/insurance" element={<Insurance />} />
              <Route path="/loans" element={<Liabilities />} />
              <Route path="/goals" element={<Goals />} />
              <Route path="/calculators" element={<Calculators />} />
              <Route path="/learn" element={<Learn />} />
              <Route path="/news" element={<News />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
