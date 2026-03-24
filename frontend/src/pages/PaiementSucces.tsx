import { CheckCircle, Download, ShieldCheck, Mail, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useConfig } from "@/context/ConfigContext";
import shieldImg from "@/assets/kaspersky-shield.png";

const PaiementSucces = () => {
  const navigate = useNavigate();
  const { config } = useConfig();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="glass-card neon-border rounded-2xl p-8 max-w-lg w-full text-center space-y-6">
        {/* Success icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-cyber-green/10 border-2 border-cyber-green/40 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-cyber-green" />
          </div>
        </div>

        {/* Title */}
        <div>
            <h1 className="font-display text-3xl font-black text-foreground mb-1">
              {config.success_page_title || "Paiement Réussi !"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {config.success_page_subtitle || `Votre licence ${config.productName} a été activée avec succès.`}
            </p>
        </div>

        {/* Receipt */}
        <div className="glass-card rounded-xl p-5 text-left space-y-3">
          <div className="flex items-center gap-3 pb-3 border-b border-border">
            <img src={shieldImg} alt="Kaspersky" className="w-10 h-10 object-contain" />
            <div>
              <p className="text-sm font-bold text-foreground">{config.productName}</p>
              <p className="text-xs text-muted-foreground">{config.subtitle}</p>
            </div>
            <p className="ml-auto font-display font-bold text-primary">
              {config.price} {config.currency}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="w-4 h-4 text-cyber-green" />
            <span>Licence activée • Valable 1 an</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Mail className="w-4 h-4 text-primary" />
            <span>Un email de confirmation a été envoyé</span>
          </div>
        </div>

        {/* Tutorial Video Section */}
        <div className="glass-card rounded-xl overflow-hidden border border-border/50 shadow-lg">
          <div className="bg-secondary/20 p-3 border-b border-border/50 text-left flex items-center gap-2">
            <Play className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold tracking-widest text-foreground uppercase">Tutoriel d'installation</span>
          </div>
          <div className="aspect-video">
            <iframe
              className="w-full h-full"
              src={config.videoUrl || "https://www.youtube.com/embed/dQw4w9WgXcQ"}
              title="Tutoriel d'installation Kaspersky"
              allowFullScreen
            ></iframe>
          </div>
        </div>

        {/* Download */}
        <div className="space-y-3">
          <a
            href={config.downloadUrl || "https://www.kaspersky.com/downloads"}
            target="_blank"
            rel="noopener noreferrer"
            className="cyber-button w-full py-4 rounded-lg text-sm flex items-center justify-center gap-3 block"
          >
            <Download className="w-5 h-5" />
            TÉLÉCHARGER KASPERSKY
          </a>
          <p className="text-xs text-muted-foreground">
            Cliquez pour télécharger et installer votre antivirus
          </p>
        </div>

        {/* Instructions */}
        <div className="glass-card rounded-xl p-5 text-left space-y-3">
          <p className="font-display text-xs font-bold tracking-widest text-primary">
            ÉTAPES D'INSTALLATION
          </p>
          {[
            "Téléchargez le fichier d'installation",
            "Ouvrez le fichier et suivez les instructions",
            "Entrez votre clé de licence (envoyée par email)",
            "Profitez de votre protection complète !",
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-xs text-primary font-bold flex-shrink-0">
                {i + 1}
              </span>
              <p className="text-sm text-foreground">{step}</p>
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate("/")}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors underline"
        >
          Retour à l'accueil
        </button>
      </div>
    </div>
  );
};

export default PaiementSucces;
