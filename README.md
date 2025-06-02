# 🔥 Gouvernement RP - Application Firebase

## 🚀 **Application gouvernementale complète avec Firebase**

### **Technologies utilisées :**
- ⚡ **Vue.js 3** + TypeScript
- 🎨 **Tailwind CSS** + Headless UI
- 🔥 **Firebase** (Firestore + Authentication)
- 📦 **Pinia** (State Management)
- 🛠️ **Vite** (Build Tool)

### **Fonctionnalités :**
- ✅ **Authentification sécurisée** avec rôles
- ✅ **Dashboard** avec statistiques en temps réel
- ✅ **Gestion des employés** (CRUD complet)
- ✅ **Comptabilité** (transactions, salaires, bilans)
- ✅ **Système de permissions** par rôle
- ✅ **Interface responsive** et moderne

## 🔧 **Installation rapide :**

```bash
# Cloner le projet
git clone https://github.com/lana121222/gouvernement.git
cd gouvernement

# Installer les dépendances
npm install

# Configurer Firebase (voir FIREBASE-GUIDE.md)
cp firebase-config.md .env
# Éditer .env avec vos vraies valeurs Firebase

# Démarrer en développement
npm run dev
```

## 📚 **Documentation :**

- 📖 **[FIREBASE-GUIDE.md](./FIREBASE-GUIDE.md)** - Configuration complète Firebase
- 🔧 **[firebase-config.md](./firebase-config.md)** - Variables d'environnement
- 🔒 **[firestore.rules](./firestore.rules)** - Règles de sécurité

## 🎯 **Avantages Firebase vs Supabase :**

| **Aspect** | **Firebase** | **Supabase** |
|------------|--------------|--------------|
| **Setup** | ⚡ 10 minutes | ⏳ 3 heures |
| **Configuration** | 🎯 Interface simple | 📝 Scripts SQL complexes |
| **Collections** | ✨ Auto-créées | 🔧 Tables manuelles |
| **Auth** | 🔐 2 clics | 🛠️ Configuration manuelle |
| **Règles** | 📄 1 fichier | 🗃️ Politiques RLS multiples |

## 🔐 **Comptes par défaut :**

| **Rôle** | **Email** | **Mot de passe** |
|----------|-----------|------------------|
| 🔴 **Admin** | `admin@gouvernement-rp.com` | `AdminGouv2024!` |
| 🟡 **Manager** | `manager@gouvernement-rp.com` | `ManagerGouv2024!` |
| 🟢 **Comptable** | `comptable@gouvernement-rp.com` | `ComptaGouv2024!` |

## 🚀 **Déploiement :**

```bash
# Build de production
npm run build

# Déployer sur Firebase Hosting
firebase deploy

# Ou déployer sur Vercel
vercel --prod
```

## 📱 **Captures d'écran :**

- 🏠 **Dashboard** - Vue d'ensemble avec statistiques
- 👥 **Employés** - Gestion complète du personnel
- 💰 **Comptabilité** - Transactions et bilans
- 🔐 **Authentification** - Connexion sécurisée

## 🛠️ **Scripts disponibles :**

```bash
npm run dev          # Développement
npm run build        # Build production
npm run preview      # Prévisualiser le build
npm run lint         # Linter le code
npm run format       # Formater le code
```

## 🎉 **Migration réussie !**

✅ **Supabase supprimé** - Plus de scripts SQL complexes  
✅ **Firebase intégré** - Configuration ultra-simple  
✅ **Application fonctionnelle** - Prête pour la production  
✅ **Documentation complète** - Guides détaillés  

**Votre portail gouvernemental Firebase est prêt ! 🚀**
