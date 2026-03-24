---
name: ui-ux-pro-max
description: Intelligence de conception avancée pour créer des interfaces UI/UX professionnelles. Fournit des recommandations de styles, palettes de couleurs, typographies, structures de landing pages et guides UX basés sur 161 industries.
version: 2.0.0
author: Antigravity Manager (transcription de nextlevelbuilder)
tags:
  - design
  - ui
  - ux
  - developpement-frontend
---

# UI-UX Pro Max

UI-UX Pro Max est un kit d'intelligence de conception conçu pour guider la création de sites web et d'applications au design premium et à l'ergonomie irréprochable.

## 🚀 Capacités principales

1. **Génération de Système de Design** : Analyse des besoins métier pour créer un système complet (Pattern + Style + Couleurs + Typo).
2. **Bibliothèque de Styles (67 styles)** : De l'épuré (Minimalism) au futuriste (Glassmorphism, Cyberpunk).
3. **Optimisation par Industrie (161 industries)** : Recommandations spécifiques pour le SaaS, la Fintech, le Médical, etc.
4. **Accessibilité & UX (99 guides)** : Application des meilleures pratiques (WCAG AA, anti-patterns à éviter).

## 🛠 Utilisation du moteur de recherche local

La compétence utilise un script Python pour extraire les données pertinentes.

### Commandes de base
Accédez aux dossiers `/skills/ui-ux-pro-max/scripts/` pour vos recherches :

```bash
# Rechercher un type de produit spécifique
python scripts/search.py "saas landing page" --domain product

# Trouver des styles UI recommandés
python scripts/search.py "glassmorphism" --domain style

# Sélectionner une palette de couleurs par industrie
python scripts/search.py "fintech banking" --domain color

# Recommandations de typographie (Google Fonts)
python scripts/search.py "elegant serif" --domain typography
```

### Stacks Techniques supportées
Vous pouvez filtrer les recommandations par stack : `html-tailwind`, `react`, `nextjs`, `vue`, `swiftui`, `flutter`, `shadcn`.

```bash
python scripts/search.py "form validation" --stack react
```

## 📋 Directives d'Implémentation

Lors de l'utilisation de cette compétence :
1. **Pensez "Design-First"** : Avant de coder, listez les éléments du système de design (MASTER.md).
2. **Utilisez les Micro-animations** : Appliquez des transitions de 200ms à 300ms.
3. **Évitez les Anti-patterns** : Pas d'emojis comme icônes (utilisez Lucide/Heroicons), pas de contrastes trop faibles.
4. **Focus Accessibilité** : Ratio de contraste 4.5:1 minimum pour le texte.

> [!IMPORTANT]
> Pour générer un système de design complet en une seule commande, utilisez :
> `python scripts/search.py "[VOTRE_PROJET]" --design-system -f markdown`
