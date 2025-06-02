# 🔥 Configuration Firebase

## Variables d'environnement à créer dans .env

```env
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

## 📝 Instructions de configuration :

### 1. Créer le projet Firebase
1. Allez sur [console.firebase.google.com](https://console.firebase.google.com)
2. Cliquez **"Créer un projet"**
3. Nom du projet : `gouvernement-rp`
4. Activez Google Analytics (optionnel)

### 2. Ajouter une application Web
1. Dans votre projet → **"Ajouter une app"** → **Web**
2. Nom de l'app : `Gouvernement RP`
3. Cochez **"Configurer Firebase Hosting"**
4. **Copiez les valeurs de configuration** dans votre fichier `.env`

### 3. Activer Authentication
1. **Authentication** → **Get started**
2. **Sign-in method** → **Email/Password** → **Activer**
3. Créer les comptes admin :
   - `admin@gouvernement-rp.com` / `AdminGouv2024!`
   - `manager@gouvernement-rp.com` / `ManagerGouv2024!`
   - `comptable@gouvernement-rp.com` / `ComptaGouv2024!`

### 4. Activer Firestore
1. **Firestore Database** → **Créer une base de données**
2. Mode : **Test** (pour commencer)
3. Région : **europe-west1** (Belgique)

### 5. Déployer les règles
```bash
firebase deploy --only firestore:rules
```

## 🎯 Avantages Firebase vs Supabase :

✅ **Configuration automatique** - Pas de tables à créer  
✅ **Collections dynamiques** - Se créent automatiquement  
✅ **Auth intégrée** - Comptes admin en 2 clics  
✅ **Règles simples** - Un seul fichier  
✅ **Déploiement facile** - `firebase deploy`  

## 🚀 Prêt en 10 minutes au lieu de 3 heures ! 