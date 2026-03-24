---
name: brainstorming
description: "À utiliser AVANT tout travail créatif ou technique (création de fonctionnalités, modification de comportement, ajout de composants). Explore l'intention utilisateur, les besoins et le design avant toute implémentation."
version: 1.0.0
tags:
  - ideation
  - design
  - conception
  - strategie
---

# Brainstorming : De l'Idée au Design

Cette compétence transforme des idées vagues en designs et spécifications complètes via un dialogue collaboratif naturel.

## 🛑 RÈGLE D'OR (HARD-GATE)
N'invoquez AUCUNE compétence d'implémentation, n'écrivez AUCUN code et ne créez AUCUN projet tant que vous n'avez pas présenté un design complet et obtenu la **VALIDATION EXPLICITE** de l'utilisateur. Cette règle s'applique même pour les projets "simples".

## 📋 Checklist de Processus
Vous devez effectuer ces étapes dans l'ordre :
1. **Explorer le contexte** : Analyser les fichiers existants, les docs et l'historique.
2. **Questions de clarification** : Poser une question à la fois pour comprendre l'objectif, les contraintes et les critères de succès.
3. **Proposer 2-3 approches** : Présenter des options avec leurs compromis et votre recommandation.
4. **Présenter le design** : Documenter l'architecture, les composants et le flux de données.
5. **Rédiger la doc de design** : Sauvegarder dans `docs/specs/YYYY-MM-DD-<sujet>-design.md`.
6. **Validation utilisateur** : Demander une revue finale avant de passer à la planification.

## 🔄 Flux de Dialogue
- **Une question à la fois** : Ne submergez pas l'utilisateur.
- **Choix multiples** : Préférez proposer des options (A, B, C) pour faciliter la décision.
- **YAGNI (You Ain't Gonna Need It)** : Soyez impitoyable pour supprimer les fonctionnalités inutiles dès la phase de design.

## 🎨 Compagnon Visuel
Si le sujet implique des éléments d'interface (UI) ou des diagrammes :
> "Certains points seraient plus faciles à expliquer visuellement. Voulez-vous que je génère des maquettes ou des diagrammes dans le navigateur pour nous aider ?"

## Finalisation
Une fois le design approuvé, la transition DOIT se faire vers la compétence `planification`.
