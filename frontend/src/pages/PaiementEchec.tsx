import { XCircle, RefreshCw, AlertTriangle, ArrowLeft, MessageCircle } from "lucide-react";
import supportImg from "@/assets/payment_support.png";
import { useNavigate } from "react-router-dom";
import { useConfig } from "@/context/ConfigContext";

const reasons = [
  "Solde Lumicash / Ecocash insuffisant au moment de la validation",
  "Délai d'approbation USSD dépassé sur votre mobile",
  "Code PIN incorrect ou transaction annulée sur votre téléphone",
  "Problème temporaire de connexion avec le réseau mobile",
];

const PaiementEchec = () => {
  const navigate = useNavigate();
  const { config } = useConfig();

  const pendingTxnId = localStorage.getItem('pending_txn_id');
  const whatsappSupportUrl = `https://wa.me/25761000000?text=${encodeURIComponent(
    `Bonjour, mon paiement de ${config.price} ${config.currency} pour Kaspersky n'a pas abouti (ID: ${pendingTxnId || 'N/A'}). Pourriez-vous m'assister ?`
  )}`;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="glass-card neon-border rounded-2xl p-6 sm:p-8 max-w-lg w-full text-center space-y-6">
        {/* Error icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-destructive/10 border-2 border-destructive/40 flex items-center justify-center">
            <XCircle className="w-10 h-10 text-destructive animate-pulse" />
          </div>
        </div>

        {/* Title */}
        <div>
          <h1 className="font-display text-3xl font-black text-foreground mb-1">
            {config.error_page_title || "Paiement Non Complété"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {config.error_page_subtitle || "La transaction n'a pas pu aboutir. Aucun montant n'a été débité."}
          </p>
        </div>

        {/* Amount Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary border border-border text-xs text-muted-foreground font-semibold">
          <span>Montant prévu :</span>
          <span className="text-foreground font-bold">{config.price} {config.currency}</span>
        </div>

        {/* Reasons */}
        <div className="glass-card rounded-xl p-5 text-left space-y-3 border border-border/50">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-cyber-orange flex-shrink-0" />
            <p className="font-display text-xs font-bold tracking-widest text-cyber-orange uppercase">
              Causes fréquentes d'échec
            </p>
          </div>
          {reasons.map((reason, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-destructive/80 flex-shrink-0 mt-1.5" />
              <p className="text-xs sm:text-sm text-muted-foreground">{reason}</p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={() => navigate("/")}
            className="cyber-button w-full py-4 rounded-lg text-sm flex items-center justify-center gap-3 font-bold"
          >
            <RefreshCw className="w-4 h-4" />
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
        <div className="flex justify-center py-1">
          <img src={supportImg} alt="Support" className="w-36 h-36 object-contain opacity-80" />
        </div>

        {/* Support Direct */}
        <div className="space-y-3 pt-2 border-t border-border/50">
          <p className="text-xs text-muted-foreground">
            Un problème technique ? Notre support réactif est à votre disposition.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a 
              href={whatsappSupportUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex-1 py-3 px-4 rounded-xl bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#25D366]/20 transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              ASSISTANCE WHATSAPP
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaiementEchec;
