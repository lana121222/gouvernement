# 🔥 Déploiement des Cloud Functions - Suppression Utilisateurs

## 📋 Fonctionnalités

Ce système permet de supprimer **complètement** un utilisateur de votre application Firebase :

✅ **Suppression du compte Firebase Authentication**  
✅ **Suppression de tous les documents Firestore liés**  
✅ **Suppression de l'historique des transactions**  
✅ **Suppression des sauvegardes créées**  
✅ **Libération de l'adresse email** pour permettre la recréation d'un compte

## 🚀 Déploiement

### 1. Prérequis

```bash
# Installer Firebase CLI
npm install -g firebase-tools

# Se connecter à Firebase
firebase login

# Vérifier la connexion au projet
firebase projects:list
```

### 2. Déployer les fonctions

```bash
# Depuis la racine du projet
firebase deploy --only functions

# Ou déployer seulement une fonction spécifique
firebase deploy --only functions:deleteUserCompletely
```

### 3. Vérifier le déploiement

```bash
# Voir les logs des fonctions
firebase functions:log

# Lister les fonctions déployées
firebase functions:list
```

## 🔧 Fonctions disponibles

### `deleteUserCompletely`
- **Type** : Callable Function (HTTPS)
- **Permissions** : Admin seulement
- **Paramètres** : `{ userId: string }`
- **Description** : Supprime complètement un utilisateur et toutes ses données

### `cleanupUserData`
- **Type** : Auth Trigger (automatique)
- **Déclencheur** : Suppression d'un compte Auth
- **Description** : Nettoyage automatique des données Firestore

### `checkUserExists`
- **Type** : Callable Function (HTTPS)
- **Permissions** : Utilisateur authentifié
- **Paramètres** : `{ userId: string }`
- **Description** : Vérifie l'existence d'un utilisateur

## 🛡️ Sécurité

### Permissions requises
- L'utilisateur qui supprime doit être **admin** (role: 'admin')
- L'utilisateur doit être **authentifié**
- La fonction vérifie automatiquement les permissions

### Protection des données
- Suppression en cascade de toutes les données liées
- Logs détaillés pour audit
- Gestion d'erreurs robuste

## 🎯 Utilisation dans l'interface

### Interface admin
1. Aller dans **Dashboard** → **🔧 Administration - Gestion des utilisateurs**
2. Cliquer sur le bouton de suppression (🗑️) à côté d'un utilisateur
3. Confirmer la suppression dans la boîte de dialogue
4. La fonction Cloud sera appelée automatiquement

### Messages affichés
- **Confirmation** : Message détaillé avec liste des éléments supprimés
- **Progression** : Indicateur pendant la suppression
- **Succès** : Confirmation que l'email est libéré
- **Erreurs** : Messages d'erreur spécifiques selon le problème

## 🐛 Debugging

### Voir les logs
```bash
# Logs en temps réel
firebase functions:log --follow

# Logs d'une fonction spécifique
firebase functions:log --only deleteUserCompletely
```

### Tester localement
```bash
# Démarrer l'émulateur
cd functions
npm run serve

# Les fonctions seront disponibles sur :
# http://localhost:5001/gouvernement-rp-4c53c/us-central1/deleteUserCompletely
```

## ⚡ Commandes utiles

```bash
# Compiler les fonctions
cd functions && npm run build

# Installer les dépendances
cd functions && npm install

# Déployer avec force (ignorer les avertissements)
firebase deploy --only functions --force

# Voir l'utilisation et les coûts
firebase functions:log --limit 100
```

## 🎉 Résultat

Après suppression, l'utilisateur :
- ❌ Ne peut plus se connecter avec ses anciens identifiants
- ✅ Peut créer un nouveau compte avec la même adresse email
- ✅ Toutes ses données ont été supprimées de Firestore
- ✅ Son compte Firebase Auth n'existe plus

## 📞 Support

En cas de problème :
1. Vérifiez les logs : `firebase functions:log`
2. Vérifiez les permissions dans Firestore Rules
3. Vérifiez que l'utilisateur admin a bien le role 'admin'
4. Vérifiez la configuration Firebase dans le projet 