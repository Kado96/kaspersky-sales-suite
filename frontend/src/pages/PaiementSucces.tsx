import { CheckCircle, Download, ShieldCheck, Mail, Play, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useConfig } from "@/context/ConfigContext";
import shieldImg from "@/assets/kaspersky-shield.png";

const PaiementSucces = () => {
  const navigate = useNavigate();
  const { config } = useConfig();

  const whatsappSupportUrl = `https://wa.me/25761000000?text=${encodeURIComponent(
    `Bonjour, j'ai complété mon paiement Kaspersky (Montant: ${config.price} ${config.currency}) et je sollicite une assistance pour l'installation.`
  )}`;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="glass-card neon-border rounded-2xl p-6 sm:p-8 max-w-lg w-full text-center space-y-6">
        {/* Success icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-cyber-green/10 border-2 border-cyber-green/40 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-cyber-green animate-pulse" />
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
        <div className="glass-card rounded-xl p-5 text-left space-y-3 border border-border">
          <div className="flex items-center gap-3 pb-3 border-b border-border">
            <img src={shieldImg} alt="Kaspersky" className="w-10 h-10 object-contain" />
            <div>
              <p className="text-sm font-bold text-foreground">{config.productName}</p>
              <p className="text-xs text-muted-foreground">{config.subtitle}</p>
            </div>
            <p className="ml-auto font-display font-bold text-primary text-base">
              {config.price} {config.currency}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="w-4 h-4 text-cyber-green flex-shrink-0" />
            <span>Licence activée • Valable 1 an Multi-appareils</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Mail className="w-4 h-4 text-primary flex-shrink-0" />
            <span>Un email de confirmation contenant vos accès vous a été envoyé</span>
          </div>
        </div>

        {/* Tutorial Video Section */}
        <div className="glass-card rounded-xl overflow-hidden border border-border/50 shadow-lg">
          <div className="bg-secondary/30 p-3 border-b border-border/50 text-left flex items-center gap-2">
            <Play className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold tracking-widest text-foreground uppercase">Tutoriel d'installation</span>
          </div>
          <div className="aspect-video">
            <iframe
              className="w-full h-full"
              src={config.videoUrl || "https://www.youtube.com/embed/dQw4w9WgXcQ"}
              title="Tutoriel d'installation Kaspersky"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>

        {/* Download Action */}
        <div className="space-y-2">
          <a
            href={config.downloadUrl || "https://drive.google.com/file/d/1jk5kbmm74K6nf9OYcs03aJ0Zd1-GCY74/view?usp=drive_link"}
            target="_blank"
            rel="noopener noreferrer"
            className="cyber-button w-full py-4 rounded-lg text-sm flex items-center justify-center gap-3 font-bold"
          >
            <Download className="w-5 h-5" />
            TÉLÉCHARGER KASPERSKY
          </a>
          <p className="text-xs text-muted-foreground">
            Cliquez pour télécharger l'installateur officiel
          </p>
        </div>

        {/* Instructions */}
        <div className="glass-card rounded-xl p-5 text-left space-y-3 border border-border/50">
          <p className="font-display text-xs font-bold tracking-widest text-primary uppercase">
            ÉTAPES D'INSTALLATION
          </p>
          {(config.success_page_steps || [
            "Téléchargez le fichier d'installation",
            "Lancez l'application et suivez les instructions",
            "Entrez votre clé de licence reçue par email",
            "Profitez d'une protection complète en temps réel !"
          ]).map((step, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-xs text-primary font-bold flex-shrink-0">
                {i + 1}
              </span>
              <p className="text-xs sm:text-sm text-foreground">{step}</p>
            </div>
          ))}
        </div>

        {/* WhatsApp Assistance */}
        <div className="pt-2">
          <a
            href={whatsappSupportUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-4 rounded-xl bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#25D366]/20 transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            BESOIN D'AIDE SUR WHATSAPP ?
          </a>
        </div>

        <div>
          <button
            onClick={() => navigate("/")}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors underline"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaiementSucces;
