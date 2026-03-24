---
name: planification
description: "À utiliser lorsqu'une spécification ou des besoins complexes sont définis. Transforme un design en plan d'implémentation détaillé, étape par étape, avant de toucher au code."
version: 1.0.0
tags:
  - planification
  - roadmap
  - implementation
  - tdd
---

# Planification d'Implémentation

Cette compétence permet de rédiger des plans complets en découpant le travail en tâches atomiques. Le plan doit être si précis qu'un développeur sans contexte pourrait l'exécuter sans erreur.

## 📝 Structure du Plan
Chaque plan doit commencer par cet en-tête :

```markdown
# Plan d'Implémentation : [Nom de la Fonctionnalité]

**Objectif** : [Une phrase décrivant ce qu'on construit]
**Architecture** : [2-3 phrases sur l'approche technique]
**Stack Technique** : [Langages, outils et bibliothèques]
```

## 🪜 Granularité des Tâches (Bite-Sized)
Chaque étape doit prendre entre 2 et 5 minutes. Exemple de découpage (TDD) :
1. **Écrire le test** qui échoue.
2. **Lancer le test** pour vérifier l'échec.
3. **Implémenter le code minimal** pour faire passer le test.
4. **Lancer le test** pour vérifier le succès.
5. **Commit**.

## 🏗 Structure d'une Tâche
Pour chaque tâche, précisez :
- **Fichiers** : Chemins exacts (Création / Modification).
- **Code** : Fragments de code complets (pas de placeholders).
- **Tests** : Commandes exactes pour vérifier la réussite.

## 🔄 Boucle de Revue
Après avoir écrit le plan complet :
1. **Auto-revue** : Vérifier la cohérence avec la spécification de design.
2. **Validation Utilisateur** : Présenter le plan et demander :
   > "Le plan est prêt dans `<chemin>`. Voulez-vous passer à l'exécution ou modifier certaines étapes ?"

## 💡 Principes Clés
- **DRY** (Don't Repeat Yourself).
- **YAGNI** (You Ain't Gonna Need It).
- **Commits Fréquents** : Un commit par tâche atomique.
- **Chemins Absolus** : Toujours utiliser des chemins de fichiers précis.
