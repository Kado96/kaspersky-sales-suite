import { Smartphone, Clock, Loader2, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useConfig } from "@/context/ConfigContext";
import { API_URL } from "@/lib/siteConfig";

const steps = [
  { num: 1, text: "Composez", bold: "*163#" },
  { num: 2, text: "Choisissez", bold: "4 Payer les factures" },
  { num: 3, text: "Choisissez", bold: "2 Approuver les transactions" },
  { num: 4, text: "Choisissez", bold: "1 AFRIREGISTER" },
];

const Paiement = () => {
  const navigate = useNavigate();
  const { config } = useConfig();
  const [dots, setDots] = useState(".");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "." : d + "."));
    }, 600);

    // Polling backend status (using the same logic as PaymentResult for fallback)
    const checkStatus = setInterval(async () => {
      try {
        const txnId = localStorage.getItem('pending_txn_id');
        if (!txnId) return;

        const res = await fetch(`${API_URL}/check-status/${txnId}`);
        const data = await res.json();
        if (data.status === "SUCCESS" || data.status === "COMPLETED" || data.response_code === "00") {
          navigate("/paiement/succes");
        } else if (data.status === "FAILED" || data.status === "CANCELLED") {
          navigate("/paiement/echec");
        }
      } catch (e) {
        console.error("Status check failed", e);
      }
    }, 5000);

    return () => {
      clearInterval(interval);
      clearInterval(checkStatus);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="glass-card neon-border rounded-2xl p-8 max-w-lg w-full text-center space-y-8">
        {/* Phone icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center neon-glow">
            <Smartphone className="w-8 h-8 text-primary" />
          </div>
        </div>

        {/* Title */}
        <h1 className="font-display text-3xl font-black">
          <span className="text-foreground">Paiement en </span>
          <span className="text-gradient">cours</span>
          <span className="text-primary animate-pulse">|</span>
        </h1>

        {/* Status */}
        <div className="glass-card rounded-xl p-4 flex items-center gap-4 text-left">
          <Loader2 className="w-8 h-8 text-primary animate-spin flex-shrink-0" />
          <div>
            <p className="text-xs font-display font-bold text-primary tracking-widest">
              VÉRIFICATION EN TEMPS RÉEL
            </p>
            <p className="text-sm text-muted-foreground">
              Nous attendons la confirmation d'AfriPay{dots}
            </p>
          </div>
        </div>

        {/* Instructions */}
        <div className="glass-card rounded-xl p-6 text-left space-y-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
            <p className="font-display text-sm font-bold tracking-widest text-foreground">
              INSTRUCTIONS DE VALIDATION
            </p>
          </div>

          <div className="space-y-3">
            {steps.map((step) => (
              <div key={step.num} className="flex items-center gap-4">
                <span className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-xs text-muted-foreground font-bold flex-shrink-0">
                  {step.num}
                </span>
                <p className="text-sm text-foreground">
                  {step.text} <span className="font-bold">{step.bold}</span>
                </p>
              </div>
            ))}
          </div>

          <p className="text-xs text-center text-muted-foreground italic pt-2">
            🔒 Une fois la transaction validée sur votre mobile, la redirection sera instantanée.
          </p>
        </div>

        {/* Warning */}
        <div className="flex items-center justify-center gap-2 text-cyber-orange">
          <Clock className="w-4 h-4" />
          <p className="text-xs font-display font-bold tracking-widest">
            NE FERMEZ PAS CETTE FENÊTRE
          </p>
        </div>

        {/* Dev buttons - remove in production */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={() => navigate("/paiement/succes")}
            className="cyber-button flex-1 py-2.5 rounded-lg text-xs"
          >
            Simuler Succès
          </button>
          <button
            onClick={() => navigate("/paiement/echec")}
            className="flex-1 py-2.5 rounded-lg text-xs border border-destructive/50 text-destructive hover:bg-destructive/10 transition-colors"
          >
            Simuler Échec
          </button>
        </div>
      </div>
    </div>
  );
};

export default Paiement;
