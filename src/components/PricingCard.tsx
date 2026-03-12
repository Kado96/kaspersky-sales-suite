import { CheckCircle, Mail } from "lucide-react";
import shieldImg from "@/assets/kaspersky-shield.png";
import type { SiteConfig } from "@/lib/siteConfig";

interface PricingCardProps {
  config: SiteConfig;
}

const PricingCard = ({ config }: PricingCardProps) => {
  return (
    <div className="glass-card neon-border rounded-2xl p-8 max-w-md mx-auto relative overflow-hidden">
      {/* Badge */}
      <div className="absolute -top-0 left-1/2 -translate-x-1/2 translate-y-0">
        <span className="cyber-button px-4 py-1.5 rounded-full text-xs font-bold tracking-widest">
          OFFRE SPÉCIALE
        </span>
      </div>

      {/* Shield icon */}
      <div className="flex justify-center mt-6 mb-4">
        <img src={shieldImg} alt="Shield" className="w-16 h-16 object-contain" />
      </div>

      {/* Product info */}
      <h3 className="text-xl font-display font-bold text-center text-foreground">
        {config.productName}
      </h3>
      <p className="text-xs text-center text-muted-foreground tracking-[0.3em] mt-1">
        {config.subtitle}
      </p>

      {/* Price */}
      <div className="text-center my-6">
        <span className="text-5xl font-display font-black text-gradient">{config.price}</span>
        <span className="text-lg text-muted-foreground ml-2">{config.currency}</span>
        <p className="text-xs text-muted-foreground tracking-[0.15em] mt-2">{config.paymentNote}</p>
      </div>

      {/* Features */}
      <div className="space-y-3 mb-6">
        {config.features.map((feat, i) => (
          <div key={i} className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-cyber-green flex-shrink-0" />
            <span className="text-sm text-foreground">{feat}</span>
          </div>
        ))}
      </div>

      {/* Email */}
      <div className="space-y-3">
        <p className="text-xs text-center text-muted-foreground tracking-[0.15em] flex items-center justify-center gap-2">
          <Mail className="w-4 h-4" /> EMAIL DE RÉCEPTION
        </p>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="email"
            placeholder={config.emailPlaceholder}
            className="w-full bg-secondary border border-border rounded-lg py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <button className="cyber-button w-full py-3.5 rounded-lg text-sm">
          {config.ctaText}
        </button>
      </div>

      {/* Trust */}
      <div className="mt-4 text-center space-y-1">
        <p className="text-xs text-muted-foreground">{config.trustBadge1}</p>
        <p className="text-xs text-muted-foreground">{config.trustBadge2}</p>
      </div>
    </div>
  );
};

export default PricingCard;
