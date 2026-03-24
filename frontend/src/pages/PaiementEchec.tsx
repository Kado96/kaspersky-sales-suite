import { XCircle, RefreshCw, AlertTriangle, ArrowLeft, MessageCircle } from "lucide-react";
import supportImg from "@/assets/payment_support.png";
import { useNavigate } from "react-router-dom";
import { useConfig } from "@/context/ConfigContext";

const reasons = [
  "Solde insuffisant sur votre compte",
  "Transaction annulée ou expirée",
  "Problème de connexion réseau",
  "Numéro de téléphone incorrect",
];

const PaiementEchec = () => {
  const navigate = useNavigate();
  const { config } = useConfig();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="glass-card neon-border rounded-2xl p-8 max-w-lg w-full text-center space-y-6">
        {/* Error icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-destructive/10 border-2 border-destructive/40 flex items-center justify-center">
            <XCircle className="w-10 h-10 text-destructive" />
          </div>
        </div>

        {/* Title */}
        <div>
            <h1 className="font-display text-3xl font-black text-foreground mb-1">
              {config.error_page_title || "Paiement Échoué"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {config.error_page_subtitle || "La transaction n'a pas pu être complétée. Aucun montant n'a été débité."}
            </p>
        </div>

        {/* Reasons */}
        <div className="glass-card rounded-xl p-5 text-left space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-cyber-orange flex-shrink-0" />
            <p className="font-display text-xs font-bold tracking-widest text-cyber-orange">
              CAUSES POSSIBLES
            </p>
          </div>
          {reasons.map((reason, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-destructive/60 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">{reason}</p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={() => navigate("/")}
            className="cyber-button w-full py-4 rounded-lg text-sm flex items-center justify-center gap-3"
          >
            <RefreshCw className="w-5 h-5" />
            RÉESSAYER LE PAIEMENT
          </button>
          <button
            onClick={() => navigate("/")}
            className="w-full py-3 rounded-lg text-sm border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à l'accueil
          </button>
        </div>

        {/* Illustration */}
        <div className="flex justify-center py-2">
          <img src={supportImg} alt="Support" className="w-40 h-40 object-contain opacity-80" />
        </div>

        {/* Support */}
        <div className="space-y-4 pt-4 border-t border-border/50">
          <p className="text-xs text-muted-foreground italic">
            "Une petite erreur n'est pas la fin du monde. Nos techniciens sont là pour vous aider."
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a 
              href="https://wa.me/25712345678" 
              target="_blank" 
              className="flex-1 py-3 px-4 rounded-xl bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#25D366]/20 transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              AIDE WHATSAPP
            </a>
            <div className="flex-1 py-3 px-4 rounded-xl bg-primary/10 border border-primary/30 text-primary text-xs font-bold flex items-center justify-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              SUPPORT 24/7
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaiementEchec;
