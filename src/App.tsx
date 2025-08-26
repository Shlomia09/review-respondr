import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import { Reviews } from "./pages/Reviews";
import { AIResponses } from "./pages/AIResponses";
import { Analytics } from "./pages/Analytics";
import { SocialHub } from "./pages/SocialHub";
import { Integrations } from "./pages/Integrations";
import { Customers } from "./pages/Customers";
import { Settings } from "./pages/Settings";
import { Support } from "./pages/Support";
import { Layout } from "./components/Layout";
import { TranslationProvider } from "@/hooks/useTranslation";

const queryClient = new QueryClient();

const App = () => {
  return (
    <HelmetProvider>
      <TranslationProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                
                {/* Dashboard Routes with Layout */}
                <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
                <Route path="/reviews" element={<Layout><Reviews /></Layout>} />
                <Route path="/ai-responses" element={<Layout><AIResponses /></Layout>} />
                <Route path="/analytics" element={<Layout><Analytics /></Layout>} />
                <Route path="/social-hub" element={<Layout><SocialHub /></Layout>} />
                <Route path="/integrations" element={<Layout><Integrations /></Layout>} />
                <Route path="/customers" element={<Layout><Customers /></Layout>} />
                <Route path="/settings" element={<Layout><Settings /></Layout>} />
                <Route path="/support" element={<Layout><Support /></Layout>} />
                
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </TranslationProvider>
    </HelmetProvider>
  );
};

export default App;
