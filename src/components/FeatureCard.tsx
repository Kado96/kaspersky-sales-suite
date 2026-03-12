import { Shield, Lock, Eye, Globe, Zap, Headphones } from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  shield: Shield,
  lock: Lock,
  eye: Eye,
  globe: Globe,
  zap: Zap,
  headphones: Headphones,
};

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => {
  const Icon = iconMap[icon] || Shield;

  return (
    <div className="glass-card rounded-xl p-6 hover:neon-border transition-all duration-300 group">
      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <h3 className="font-display text-sm font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
};

export default FeatureCard;
