# Kaspersky Sales Suite

Une application complète pour la gestion des ventes et l'administration de licences, comprenant un Frontend moderne et un Backend Robuste.

## 🚀 Structure du Projet

- **/frontend** : Interface utilisateur construite avec React, Vite et Shadcn/UI.
- **/server** : API Backend construite avec Node.js, Express et intégration de services (Afripay, Nodemailer).

---

## 🛠️ Installation et Configuration

### 1. Prérequis
- [Node.js](https://nodejs.org/) (version 18 ou supérieure recommandée)
- [npm](https://www.npmjs.com/)

### 2. Configuration du Backend (`/server`)
Le serveur gère l'authentification, les transactions et l'envoi d'emails.

1. Allez dans le dossier server :
   ```bash
   cd server
   ```
2. Installez les dépendances :
   ```bash
   npm install
   ```
3. Créez un fichier `.env` à la racine du dossier `/server` (utilisez la structure ci-dessous) :
   ```env
   PORT=5001
   AFRIPAY_APP_ID=votre_app_id
   AFRIPAY_APP_SECRET=votre_secret
   EMAIL_USER=votre_email@gmail.com
   EMAIL_PASS=votre_mot_de_passe_app
   ADMIN_USER=donald
   ADMIN_PASS=admin
   ```

### Note de Déploiement (Cloud/VPS)
Si vous déployez sur une plateforme comme InfinityFree ou Heroku :
- **Root Directory** : `server`
- **Build Command** : `npm install`
- **Start Command** : `node index.js`


### 3. Configuration du Frontend (`/frontend`)
Le frontend est l'interface client et le panneau d'administration.

1. Allez dans le dossier frontend :
   ```bash
   cd frontend
   ```
2. Installez les dépendances :
   ```bash
   npm install
   ```

---

## 🏃 Lancement de l'application

Pour que l'application fonctionne correctement, vous devez lancer **le serveur et le frontend simultanément**.

### Lancer le Backend
Dans un premier terminal :
```bash
cd server
npm run dev
```
*Le serveur sera accessible sur `http://localhost:5001`.*

### Lancer le Frontend
Dans un second terminal :
```bash
cd frontend
npm run dev
```
*L'interface sera accessible sur `http://localhost:8080` (par défaut avec Vite).*

---

## 🧪 Tests
- **Frontend** : `npm run test` (Vitest)
- **E2E** : `npx playwright test`

---

## 🛡️ Stack Technique

### Frontend
- **Framework** : React + TypeScript
- **Build Tool** : Vite
- **Styling** : Tailwind CSS + Shadcn/UI
- **Gestion d'état** : TanStack Query (React Query)

### Backend
- **Runtime** : Node.js
- **Framework** : Express
- **Services** : 
  - Nodemailer (Notifications)
  - Axios (Intégration API externes)
  - Admin Dashboard sécurisé

---

## 📝 Auteur
Développé avec ❤️ pour la gestion des ventes Kaspersky.
