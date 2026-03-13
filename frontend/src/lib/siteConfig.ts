export interface Testimonial {
  name: string;
  role: string;
  content: string;
  rating: number;
}

export interface SiteConfig {
  productName: string;
  subtitle: string;
  heroTitle: string;
  heroSubtitle: string;
  price: string;
  currency: string;
  paymentNote: string;
  features: string[];
  videoUrl: string;
  videoTitle: string;
  videoDescription: string;
  ctaText: string;
  emailPlaceholder: string;
  countdownEndDate: string;
  whyChooseTitle: string;
  whyChooseSubtitle: string;
  benefitCards: { icon: string; title: string; description: string }[];
  testimonials: Testimonial[];
  footerTitle: string;
  footerText: string;
  trustBadge1: string;
  trustBadge2: string;
  primaryHue?: string;
  downloadUrl?: string;
}

const API_URL = 'http://localhost:5001/api';

export const getDefaultConfig = (): SiteConfig => ({
  productName: "Kaspersky Antivirus",
  subtitle: "MULTI-APPAREILS",
  heroTitle: "KASPERSKY",
  heroSubtitle: "Un investissement pour votre tranquillité d'esprit. Protégez-vous dès aujourd'hui.",
  price: "30 000",
  currency: "BIF",
  paymentNote: "PAIEMENT UNIQUE · LICENCE 1 AN",
  features: [
    "Multi-appareils",
    "Garantie 3 ans incluse",
    "Guide d'installation complet",
    "Vidéo tutoriel fournie",
    "Lien de téléchargement envoyé par email",
    "Protection antivirus en temps réel",
    "Blocage des ransomwares",
    "Support technique 24/7",
  ],
  videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  videoTitle: "TUTORIEL D'INSTALLATION",
  videoDescription: "Suivez ce guide vidéo étape par étape pour sécuriser votre appareil en moins de 3 minutes.",
  ctaText: "PROCÉDER AU PAIEMENT",
  emailPlaceholder: "votre.email@exemple.com",
  countdownEndDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
  whyChooseTitle: "POURQUOI CHOISIR",
  whyChooseSubtitle: "Une suite complète de sécurité pour protéger tous les aspects de votre vie numérique.",
  benefitCards: [
    { icon: "shield", title: "Protection Totale", description: "Détection et suppression des virus, malwares et menaces en temps réel." },
    { icon: "lock", title: "Anti-Ransomware", description: "Protection avancée contre les ransomwares et le cryptage malveillant de vos fichiers." },
    { icon: "eye", title: "Vie Privée", description: "Protégez vos données personnelles et votre identité en ligne." },
    { icon: "globe", title: "Navigation Sécurisée", description: "Bloquez les sites dangereux et les tentatives de phishing automatiquement." },
    { icon: "zap", title: "Performance Optimale", description: "Léger et rapide, n'affecte pas les performances de votre ordinateur." },
    { icon: "headphones", title: "Support 24/7", description: "Assistance technique disponible à tout moment pour vous aider." },
  ],
  testimonials: [
    { name: "Jean-Pierre B.", role: "PME Informatique", content: "Depuis que j'utilise cette licence, je n'ai plus aucun problème de virus sur mes machines de bureau. Livraison instantanée !", rating: 5 },
    { name: "Marie N.", role: "Particulier", content: "Très satisfaite du service. Le tutoriel est très clair et l'installation s'est faite en 2 minutes.", rating: 5 },
    { name: "Sylvain K.", role: "Consultant", content: "Meilleur prix pour Kaspersky au Burundi. Le support m'a aidé rapidement pour l'activation.", rating: 4 },
  ],
  footerTitle: "KASPERSKY.",
  footerText: "© 2025 · Revendeur agréé Kaspersky. Tous droits réservés.",
  trustBadge1: "🔒 SÉCURISÉ DE BOUT EN BOUT",
  trustBadge2: "✅ Vérifié et Partenaire Officiel",
  primaryHue: "160", // Greenish
  downloadUrl: "https://drive.google.com/file/d/1jk5kbmm74K6nf9OYcs03aJ0Zd1-GCY74/view?usp=drive_link"
});

export async function fetchSiteConfig(): Promise<SiteConfig> {
  try {
    const response = await fetch(`${API_URL}/config`);
    if (!response.ok) throw new Error('No config');
    return response.json();
  } catch (e) {
    return getDefaultConfig();
  }
}

export async function updateSiteConfig(config: SiteConfig, token: string): Promise<void> {
  const response = await fetch(`${API_URL}/config`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(config),
  });
  if (!response.ok) throw new Error('Failed to update config');
}
