import { useState, useEffect } from "react";
import { getSiteConfig, saveSiteConfig, type SiteConfig } from "@/lib/siteConfig";
import { Save, ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Admin = () => {
  const [config, setConfig] = useState<SiteConfig>(getSiteConfig());
  const navigate = useNavigate();

  const update = <K extends keyof SiteConfig>(key: K, value: SiteConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const updateFeature = (index: number, value: string) => {
    const features = [...config.features];
    features[index] = value;
    update("features", features);
  };

  const removeFeature = (index: number) => {
    update("features", config.features.filter((_, i) => i !== index));
  };

  const addFeature = () => {
    update("features", [...config.features, "Nouvelle fonctionnalité"]);
  };

  const updateBenefit = (index: number, key: string, value: string) => {
    const cards = [...config.benefitCards];
    cards[index] = { ...cards[index], [key]: value };
    update("benefitCards", cards);
  };

  const handleSave = () => {
    saveSiteConfig(config);
    toast.success("Configuration sauvegardée !");
  };

  const inputClass =
    "w-full bg-secondary border border-border rounded-lg py-2.5 px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50";
  const labelClass = "text-xs font-bold text-muted-foreground tracking-wider uppercase mb-1 block";

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Retour au site
          </button>
          <button onClick={handleSave} className="cyber-button px-6 py-2.5 rounded-lg text-sm flex items-center gap-2">
            <Save className="w-4 h-4" /> Sauvegarder
          </button>
        </div>

        <h1 className="font-display text-2xl font-bold text-foreground mb-8">
          ⚙️ Administration
        </h1>

        <div className="space-y-8">
          {/* General */}
          <Section title="Informations générales">
            <Field label="Titre hero" value={config.heroTitle} onChange={(v) => update("heroTitle", v)} />
            <Field label="Sous-titre" value={config.heroSubtitle} onChange={(v) => update("heroSubtitle", v)} />
            <Field label="Nom du produit" value={config.productName} onChange={(v) => update("productName", v)} />
            <Field label="Sous-titre produit" value={config.subtitle} onChange={(v) => update("subtitle", v)} />
          </Section>

          {/* Pricing */}
          <Section title="Prix">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Prix" value={config.price} onChange={(v) => update("price", v)} />
              <Field label="Devise" value={config.currency} onChange={(v) => update("currency", v)} />
            </div>
            <Field label="Note de paiement" value={config.paymentNote} onChange={(v) => update("paymentNote", v)} />
          </Section>

          {/* Countdown */}
          <Section title="Compte à rebours">
            <label className={labelClass}>Date de fin</label>
            <input
              type="datetime-local"
              value={config.countdownEndDate.slice(0, 16)}
              onChange={(e) => update("countdownEndDate", new Date(e.target.value).toISOString())}
              className={inputClass}
            />
          </Section>

          {/* Features */}
          <Section title="Fonctionnalités incluses">
            {config.features.map((f, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={f}
                  onChange={(e) => updateFeature(i, e.target.value)}
                  className={inputClass}
                />
                <button onClick={() => removeFeature(i)} className="text-destructive hover:text-destructive/80 p-2">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button onClick={addFeature} className="flex items-center gap-2 text-sm text-primary hover:text-primary/80">
              <Plus className="w-4 h-4" /> Ajouter
            </button>
          </Section>

          {/* Video */}
          <Section title="Vidéo">
            <Field label="Titre section" value={config.videoTitle} onChange={(v) => update("videoTitle", v)} />
            <Field label="Description" value={config.videoDescription} onChange={(v) => update("videoDescription", v)} />
            <Field label="URL YouTube (embed)" value={config.videoUrl} onChange={(v) => update("videoUrl", v)} />
          </Section>

          {/* Benefits */}
          <Section title="Avantages (cartes)">
            {config.benefitCards.map((card, i) => (
              <div key={i} className="glass-card rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Icône" value={card.icon} onChange={(v) => updateBenefit(i, "icon", v)} />
                  <Field label="Titre" value={card.title} onChange={(v) => updateBenefit(i, "title", v)} />
                </div>
                <Field label="Description" value={card.description} onChange={(v) => updateBenefit(i, "description", v)} />
              </div>
            ))}
          </Section>

          {/* CTA & Footer */}
          <Section title="Boutons & Footer">
            <Field label="Texte du bouton CTA" value={config.ctaText} onChange={(v) => update("ctaText", v)} />
            <Field label="Placeholder email" value={config.emailPlaceholder} onChange={(v) => update("emailPlaceholder", v)} />
            <Field label="Badge de confiance 1" value={config.trustBadge1} onChange={(v) => update("trustBadge1", v)} />
            <Field label="Badge de confiance 2" value={config.trustBadge2} onChange={(v) => update("trustBadge2", v)} />
            <Field label="Texte footer" value={config.footerText} onChange={(v) => update("footerText", v)} />
          </Section>
        </div>

        <div className="mt-8 pb-8">
          <button onClick={handleSave} className="cyber-button w-full py-3.5 rounded-lg text-sm flex items-center justify-center gap-2">
            <Save className="w-4 h-4" /> Sauvegarder toutes les modifications
          </button>
        </div>
      </div>
    </div>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="glass-card rounded-xl p-6 space-y-4">
    <h2 className="font-display text-sm font-bold text-primary tracking-wider">{title}</h2>
    {children}
  </div>
);

const Field = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
  <div>
    <label className="text-xs font-bold text-muted-foreground tracking-wider uppercase mb-1 block">
      {label}
    </label>
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-secondary border border-border rounded-lg py-2.5 px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
    />
  </div>
);

export default Admin;
