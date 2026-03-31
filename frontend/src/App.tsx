import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ConfigProvider } from "./context/ConfigContext";

import Index from "./pages/Index.tsx";
import Admin from "./pages/Admin.tsx";
import PaiementSucces from "./pages/PaiementSucces.tsx";
import PaiementEchec from "./pages/PaiementEchec.tsx";
import PaymentResult from "./pages/PaymentResult.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ConfigProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/paiement/succes" element={<PaiementSucces />} />
            <Route path="/paiement/echec" element={<PaiementEchec />} />
            <Route path="/paiement/result" element={<PaymentResult />} />
            <Route path="/paiement/resultat" element={<PaymentResult />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ConfigProvider>
  </QueryClientProvider>
);

export default App;
