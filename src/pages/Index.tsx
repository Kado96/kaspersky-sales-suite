import { useState, useEffect } from "react";
import heroBg from "@/assets/hero-bg.jpg";
import CountdownTimer from "@/components/CountdownTimer";
import PricingCard from "@/components/PricingCard";
import FeatureCard from "@/components/FeatureCard";
import { getSiteConfig, type SiteConfig } from "@/lib/siteConfig";
import { Play } from "lucide-react";

const Index = () => {
  const [config, setConfig] = useState<SiteConfig>(getSiteConfig());

  useEffect(() => {
    const handleStorage = () => setConfig(getSiteConfig());
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

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
      <section className="py-20 px-4 bg-secondary/30">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 cyber-button px-4 py-1.5 rounded-full text-xs mb-6">
            <Play className="w-3 h-3" /> {config.videoTitle}
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2">
            COMMENT <span className="text-gradient">TÉLÉCHARGER</span> ET INSTALLER ?
          </h2>
          <p className="text-sm text-muted-foreground mb-8 max-w-lg mx-auto">
            {config.videoDescription}
          </p>
          <div className="aspect-video rounded-xl overflow-hidden neon-border">
            <iframe
              src={config.videoUrl}
              title="Tutorial"
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
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
          KASPERSKY.
        </p>
        <p className="text-xs text-muted-foreground">{config.footerText}</p>
      </footer>
    </div>
  );
};

export default Index;
