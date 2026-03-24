---
name: createur-de-competence
description: Compétence méta pour concevoir, structurer et générer de nouvelles compétences Antigravity claires, cohérentes et modulaires, exclusivement en français.
version: 1.0.0
author: Antigravity Manager
tags:
  - meta
  - creation-de-competence
  - documentation
---

# Créateur de Compétences (Skill Creator)

Cette compétence guide l'agent Antigravity dans le processus de création de nouvelles capacités spécialisées (Skills). Elle assure que chaque compétence produite est parfaitement structurée et facile à intégrer.

## 🛠 Principes Fondamentaux de Conception

1. **Modularité** : Une compétence doit traiter UN domaine ou UNE tâche spécifique.
2. **Autonomie** : Fournir toutes les instructions nécessaires pour que l'agent puisse exécuter la tâche sans aide extérieure.
3. **Clarté** : Utiliser un langage précis et des instructions par étapes.
4. **Langue** : Toutes les compétences générées sous cette directive doivent être rédigées en **Français**.

## 📄 Structure du Fichier `SKILL.md`

### 1. Frontmatter YAML (En-tête)
Le bloc doit être délimité par `---` et contenir :
- `name` : Identifiant unique (minuscules, chiffres, tirets).
- `description` : Résumé explicite du rôle de la compétence.
- `version` : Version sémantique (ex: 1.0.0).
- `tags` : Mots-clés pour la catégorisation.

### 2. Corps des Instructions
Il doit être structuré avec des titres (H1, H2, H3) et inclure :
- **Objectif** : Ce que la compétence permet d'accomplir.
- **Workflow** : Les étapes chronologiques d'exécution.
- **Règles métier** : Les contraintes et bonnes pratiques spécifiques au domaine.
- **Templates** : Des exemples de structures de fichiers ou de codes si nécessaire.

## 🔄 Workflow de Génération

### Étape 1 : Analyse du Besoin
Identifier :
- Le public cible (interne/externe).
- Les outils requis (`allowed-tools`).
- Les entrées (inputs) et sorties (outputs) attendues.

### Étape 2 : Rédaction du YAML
Définir une description qui permettra au système de déclencher la compétence au bon moment.

### Étape 3 : Rédaction des Instructions
Utiliser un ton impératif et structuré. Inclure des alertes Markdown :
> [!IMPORTANT]
> Pour les points critiques.
> [!TIP]
> Pour les astuces de performance.

### Étape 4 : Validation
Vérifier que le fichier est placé dans `/skills/[nom-competence]/SKILL.md`.

## 📋 Template de Base (Copier/Coller)

```markdown
---
name: [identifiant-unique]
description: [description-claire]
version: 1.0.0
tags:
  - [tag1]
  - [tag2]
---

# Nom de la Compétence

## Objectif
[Décrire l'objectif ici]

## Instructions
1. [Étape 1]
2. [Étape 2]

> [!NOTE]
> [Note optionnelle]
```
