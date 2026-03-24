import { useConfig } from "@/context/ConfigContext";
import heroBg from "@/assets/hero_premium.png";
import CountdownTimer from "@/components/CountdownTimer";
import PricingCard from "@/components/PricingCard";
import FeatureCard from "@/components/FeatureCard";
import TestimonialsCarousel from "@/components/TestimonialsCarousel";
import { Play, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { API_URL } from "@/lib/siteConfig";

const Index = () => {
  const { config, loading } = useConfig();
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    const txnId = localStorage.getItem('pending_txn_id');
    const email = localStorage.getItem('pending_email');
    
    if (txnId && email) {
      setIsVerifying(true);
      let pollCount = 0;
      const maxPolls = 120; // 10 minutes
      
      const checkStatus = async () => {
        try {
          const res = await axios.get(`${API_URL}/check-status/${txnId}`);
          const data = res.data;

          if (data.status === 'SUCCESS' || data.status === 'COMPLETED' || data.response_code === '00') {
            toast({
              title: config.success_toast_title || "Paiement Validé !",
              description: config.success_toast_subtitle || "Votre licence vous a été envoyée par email.",
              variant: "default",
            });
            localStorage.removeItem('pending_txn_id');
            localStorage.removeItem('pending_email');
            setIsVerifying(false);
            return true;
          } else if (data.status === 'FAILED' || data.status === 'CANCELLED') {
            toast({
              title: config.error_toast_title || "Paiement échoué",
              description: config.error_toast_subtitle || "La transaction a été annulée ou a échoué.",
              variant: "destructive",
            });
            localStorage.removeItem('pending_txn_id');
            setIsVerifying(false);
            return true;
          }
        } catch (e) {
          console.error("Polling error", e);
        }
        return false;
      };

      const interval = setInterval(async () => {
        const done = await checkStatus();
        if (done) clearInterval(interval);
        
        pollCount++;
        if (pollCount >= maxPolls) {
          clearInterval(interval);
          setIsVerifying(false);
        }
      }, 5000);

      checkStatus();
      return () => clearInterval(interval);
    }
  }, [toast, config.success_toast_title, config.success_toast_subtitle, config.error_toast_title, config.error_toast_subtitle]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section
        className="relative py-16 px-4 flex flex-col items-center text-center"
        style={{
          backgroundImage: `linear-gradient(to bottom, hsl(220 25% 6% / 0.7), hsl(220 25% 6% / 0.95)), url(${heroBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Status Overlay for verification */}
        {isVerifying && (
          <div className="fixed bottom-4 right-4 z-50 glass-card neon-border p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
            <div className="text-left">
              <p className="text-xs font-bold text-primary uppercase tracking-widest">{config.pending_title || "Vérification du paiement"}</p>
              <p className="text-[10px] text-muted-foreground">{config.pending_subtitle || "Une fois validé sur votre mobile, vous recevrez un mail."}</p>
            </div>
          </div>
        )}

        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-black tracking-wider mb-2">
          <span className="text-foreground">{config.heroTitle}</span>{" "}
          <span className="text-gradient">PROTECTION</span>
        </h1>
        <div className="w-16 h-1 bg-primary rounded-full my-4" />
        <p className="text-muted-foreground max-w-md text-sm sm:text-base mb-8">
          {config.heroSubtitle}
        </p>

        {/* Countdown */}
        <div className="mb-8">
          <p className="text-xs text-cyber-orange font-bold tracking-widest mb-4 animate-countdown">
            ⚡ OFFRE LIMITÉE — DÉPÊCHEZ-VOUS !
          </p>
          <CountdownTimer targetDate={config.countdownEndDate} />
        </div>

        {/* Pricing Card */}
        <PricingCard config={config} />
      </section>

      {/* Video Section */}
      <section className="py-20 px-4 bg-secondary/30 relative">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 space-y-4">
            <h2 className="font-display text-3xl font-bold tracking-tight text-foreground uppercase">
              🎬 {config.videoTitle || "PRÉSENTATION VIDÉO"}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {config.videoDescription || "Découvrez comment Kaspersky protège votre vie numérique en moins de 2 minutes."}
            </p>
          </div>

          <div className="glass-card rounded-3xl overflow-hidden border border-border/50 shadow-2xl relative group">
            <div className="aspect-video">
              <iframe
                className="w-full h-full"
                src={config.videoUrl || "https://www.youtube.com/embed/dQw4w9WgXcQ"}
                title={config.videoTitle}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-24 px-4 bg-background relative border-y border-border/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl sm:text-4xl font-black mb-4 uppercase tracking-tight">
              COMMENT <span className="text-primary">ACHETER</span> ?
            </h2>
            <p className="text-muted-foreground">Une procédure simple, rapide et 100% sécurisée.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center space-y-4 group">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-2xl group-hover:bg-primary group-hover:text-black transition-all duration-500 shadow-lg shadow-primary/5">
                01
              </div>
              <h3 className="font-display font-bold text-xl">CHOISISSEZ</h3>
              <p className="text-sm text-muted-foreground">Entrez votre email et cliquez sur le bouton de paiement.</p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center space-y-4 group">
              <div className="w-16 h-16 rounded-2xl bg-cyber-orange/10 border border-cyber-orange/20 flex items-center justify-center text-cyber-orange font-black text-2xl group-hover:bg-cyber-orange group-hover:text-black transition-all duration-500 shadow-lg shadow-cyber-orange/5">
                02
              </div>
              <h3 className="font-display font-bold text-xl">VALIDEZ</h3>
              <p className="text-sm text-muted-foreground">Confirmez la transaction par USSD sur votre téléphone mobile.</p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center space-y-4 group">
              <div className="w-16 h-16 rounded-2xl bg-cyber-green/10 border border-cyber-green/20 flex items-center justify-center text-cyber-green font-black text-2xl group-hover:bg-cyber-green group-hover:text-black transition-all duration-500 shadow-lg shadow-cyber-green/5">
                03
              </div>
              <h3 className="font-display font-bold text-xl">PROTÉGEZ</h3>
              <p className="text-sm text-muted-foreground">Recevez votre licence par email et activez votre antivirus.</p>
            </div>

            {/* Decorative arrow/line for desktop (optional but omitted for simplicity here) */}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-background relative overflow-hidden">
        <TestimonialsCarousel testimonials={config.testimonials || []} />
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2">
            {config.whyChooseTitle} <span className="text-gradient">KASPERSKY</span> ?
          </h2>
          <p className="text-sm text-muted-foreground mb-12 max-w-lg mx-auto">
            {config.whyChooseSubtitle}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {config.benefitCards.map((card, i) => (
              <FeatureCard key={i} {...card} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 text-center border-t border-border">
        <p className="font-display text-lg font-bold text-foreground tracking-wider mb-2">
          {config.footerTitle}
        </p>
        <p className="text-xs text-muted-foreground">{config.footerText}</p>
      </footer>
    </div>
  );
};

export default Index;
