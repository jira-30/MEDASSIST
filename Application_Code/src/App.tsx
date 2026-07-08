import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Records from "./pages/Records";
import Appointments from "./pages/Appointments";
import Medications from "./pages/Medications";
import LabResultsPage from "./pages/LabResultsPage";
import VitalSigns from "./pages/VitalSigns";
import AIInsights from "./pages/AIInsights";
import VideoCall from "./pages/VideoCall";
import PatientForecast from "./pages/PatientForecast";
import JoinCall from "./pages/JoinCall";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/records" element={<Records />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/medications" element={<Medications />} />
          <Route path="/lab-results" element={<LabResultsPage />} />
          <Route path="/vital-signs" element={<VitalSigns />} />
          <Route path="/ai-insights" element={<AIInsights />} />
          <Route path="/video-call" element={<VideoCall />} />
          <Route path="/patient-forecast" element={<PatientForecast />} />
          <Route path="/join-call" element={<JoinCall />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
