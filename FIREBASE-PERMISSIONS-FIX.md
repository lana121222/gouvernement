# 🔧 Guide de résolution - Erreur de permissions Firebase

## ❌ Problème
```
FirebaseError: Missing or insufficient permissions
```

## 🎯 Solution - Mise à jour des règles Firestore

### 📍 Étapes à suivre :

1. **Allez dans la console Firebase** : https://console.firebase.google.com/
2. **Sélectionnez votre projet** (gouvernement-rp)
3. **Dans le menu de gauche, cliquez sur "Firestore Database"**
4. **Cliquez sur l'onglet "Règles" (Rules)**
5. **Remplacez toutes les règles par le code ci-dessous :**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // 👤 USERS COLLECTION
    match /users/{userId} {
      // Chaque utilisateur peut accéder à son propre document
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Admins peuvent accéder à tous les documents users
      allow read, write: if request.auth != null && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // 📝 PROFILES COLLECTION
    match /profiles/{profileId} {
      // Chaque utilisateur peut accéder à son propre profil (profileId = userId)
      allow read, write: if request.auth != null && request.auth.uid == profileId;
      
      // Admins peuvent accéder à tous les profils
      allow read, write: if request.auth != null && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // 💼 EMPLOYEES COLLECTION
    match /employees/{employeeId} {
      allow read, write: if request.auth != null && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'manager'];
    }
    
    // 💰 TRANSACTIONS COLLECTION
    match /transactions/{transactionId} {
      allow read, write: if request.auth != null && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'manager'] ||
         'accounting' in get(/databases/$(database)/documents/users/$(request.auth.uid)).data.permissions);
    }
    
    // 🔒 Tout le reste interdit par défaut
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

6. **Cliquez sur "Publier" pour sauvegarder les nouvelles règles**

### ✅ Vérification

Après avoir mis à jour les règles :
1. Rechargez votre application
2. Essayez d'accéder à la page de profil
3. L'erreur de permissions devrait être résolue

## 🛠️ Améliorations apportées côté code

### 🖼️ Compression automatique des images
- Les images sont automatiquement redimensionnées (max 800x600px)
- Compression JPEG avec qualité 0.7
- Limite de 5MB avant compression
- Vérification de la taille finale (max 1MB pour Firestore)

### 🚨 Gestion d'erreur améliorée
- Messages d'erreur informatifs
- Détection des problèmes de permissions
- Alertes utilisateur pour les images trop volumineuses
- Logs de débogage détaillés

### 📱 Interface utilisateur
- Instructions claires sur les limites
- Messages d'erreur visuels
- Informations sur la compression automatique

## 🔍 Dépannage

Si le problème persiste :

1. **Vérifiez que vous êtes connecté** avec un compte Firebase valide
2. **Vérifiez les logs de la console** pour des détails supplémentaires
3. **Assurez-vous que les règles ont été correctement sauvegardées** dans la console Firebase
4. **Essayez de vous reconnecter** pour actualiser les permissions

## 📧 Support

Si vous avez toujours des problèmes, contactez l'administrateur avec :
- Les messages d'erreur complets
- Votre adresse email de connexion
- Les captures d'écran de l'erreur 