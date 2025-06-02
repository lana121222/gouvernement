# 🔥 Guide Firebase - Configuration Ultra-Rapide

## ⚡ **Configuration en 10 minutes !**

### **Étape 1 : Créer le projet Firebase**
1. Allez sur [console.firebase.google.com](https://console.firebase.google.com)
2. Cliquez **"Créer un projet"**
3. Nom du projet : `gouvernement-rp`
4. Activez Google Analytics (optionnel)
5. Cliquez **"Créer le projet"**

### **Étape 2 : Ajouter une application Web**
1. Dans votre projet → **"Ajouter une app"** → **Web** (icône `</>`)
2. Nom de l'app : `Gouvernement RP`
3. Cochez **"Configurer Firebase Hosting"**
4. Cliquez **"Enregistrer l'app"**
5. **COPIEZ** les valeurs de configuration

### **Étape 3 : Configurer les variables d'environnement**
Créez un fichier `.env` à la racine du projet :

```env
VITE_FIREBASE_API_KEY=AIzaSyC...
VITE_FIREBASE_AUTH_DOMAIN=gouvernement-rp.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=gouvernement-rp
VITE_FIREBASE_STORAGE_BUCKET=gouvernement-rp.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

### **Étape 4 : Activer Authentication**
1. **Authentication** → **Get started**
2. **Sign-in method** → **Email/Password** → **Activer**
3. **Users** → **Add user** et créez :
   - `admin@gouvernement-rp.com` / `AdminGouv2024!`
   - `manager@gouvernement-rp.com` / `ManagerGouv2024!`
   - `comptable@gouvernement-rp.com` / `ComptaGouv2024!`

### **Étape 5 : Activer Firestore**
1. **Firestore Database** → **Créer une base de données**
2. Mode : **Test** (pour commencer)
3. Région : **europe-west1** (Belgique)

### **Étape 6 : Déployer les règles Firestore**
```bash
firebase login
firebase init firestore
firebase deploy --only firestore:rules
```

### **Étape 7 : Créer les profils utilisateur**
Dans la console Firestore, créez manuellement ces documents :

**Collection : `users`**

**Document ID : `[UID de admin@gouvernement-rp.com]`**
```json
{
  "email": "admin@gouvernement-rp.com",
  "role": "admin",
  "permissions": ["accounting", "users", "employees", "transactions"],
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

**Document ID : `[UID de manager@gouvernement-rp.com]`**
```json
{
  "email": "manager@gouvernement-rp.com",
  "role": "manager",
  "permissions": ["accounting", "employees"],
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

**Document ID : `[UID de comptable@gouvernement-rp.com]`**
```json
{
  "email": "comptable@gouvernement-rp.com",
  "role": "employee",
  "permissions": ["accounting"],
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

### **Étape 8 : Ajouter des données de test (optionnel)**

**Collection : `employees`**
```json
{
  "first_name": "Jean",
  "last_name": "Dupont",
  "email": "jean.dupont@gouvernement-rp.com",
  "position": "Commissaire de Police",
  "hourly_rate": 25,
  "hours_worked": 160,
  "bonus_amount": 0,
  "total_earnings": 4000,
  "is_active": true,
  "is_former": false,
  "is_blacklisted": false,
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

**Collection : `transactions`**
```json
{
  "type": "income",
  "amount": 50000,
  "description": "Budget mensuel gouvernement",
  "category": "Budget",
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

## 🎯 **Avantages Firebase vs Supabase :**

✅ **Zéro SQL** - Pas de scripts de 200 lignes !  
✅ **Collections auto** - Se créent automatiquement  
✅ **Auth simple** - Comptes en 2 clics  
✅ **Règles simples** - Un seul fichier  
✅ **Temps de setup** - 10 min vs 3 heures  

## 🚀 **Commandes utiles :**

```bash
# Démarrer le projet
npm run dev

# Déployer sur Firebase Hosting
firebase deploy

# Voir les logs Firebase
firebase functions:log

# Ouvrir la console Firebase
firebase open
```

## 🔧 **Dépannage :**

**Erreur** : "Firebase config not found"  
**Solution** : Vérifiez votre fichier `.env`

**Erreur** : "Permission denied"  
**Solution** : Vérifiez les règles Firestore

**Erreur** : "User not found"  
**Solution** : Créez le document utilisateur dans Firestore

## 🎉 **C'est fini !**

Votre application gouvernementale Firebase est prête ! 🚀

**Plus simple, plus rapide, plus fiable que Supabase !** 