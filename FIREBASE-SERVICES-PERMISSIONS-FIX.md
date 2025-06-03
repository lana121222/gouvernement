# 🔧 CORRECTION ERREUR PERMISSIONS FIREBASE - SERVICES

## ❗ Problème
Erreur lors de la prise de service : `FirebaseError: Missing or insufficient permissions`

## 🎯 Solution
Les nouvelles collections `serviceItems` et `serviceTransactions` ne sont pas autorisées dans les règles Firestore.

## 📋 Étapes à suivre

### 1. Accéder à la console Firebase
1. Allez sur https://console.firebase.google.com/
2. Sélectionnez votre projet `gouvernement-rp`
3. Dans le menu latéral, cliquez sur **Firestore Database**
4. Cliquez sur l'onglet **Règles** (Rules)

### 2. Remplacer les règles actuelles
Copiez et collez **EXACTEMENT** le code suivant (remplace tout le contenu existant) :

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

    
    // 📝 PROFILES COLLECTION - Règles simplifiées temporairement
    match /profiles/{profileId} {
      // TEMPORAIRE: Tous les utilisateurs authentifiés peuvent accéder aux profils
      // En attendant que les règles soient mises à jour dans la console Firebase
      allow read, write: if request.auth != null;
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
    
    // 🛠️ SERVICE ITEMS COLLECTION (prix et services)
    match /serviceItems/{serviceItemId} {
      allow read, write: if request.auth != null && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'manager'] ||
         'accounting' in get(/databases/$(database)/documents/users/$(request.auth.uid)).data.permissions);
    }
    
    // 📊 SERVICE TRANSACTIONS COLLECTION (historique prise/fin service, ventes)
    match /serviceTransactions/{serviceTransactionId} {
      allow read, write: if request.auth != null && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'manager'] ||
         'accounting' in get(/databases/$(database)/documents/users/$(request.auth.uid)).data.permissions);
    }
    
    // 🗄️ ACCOUNTING BACKUPS COLLECTION
    match /accounting_backups/{backupId} {
      allow read, write: if request.auth != null && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // 🔒 Tout le reste interdit par défaut
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### 3. Publier les règles
1. Cliquez sur le bouton **Publier** (Publish)
2. Attendez que la publication soit terminée (quelques secondes)

### 4. Vérifier que ça fonctionne
1. Retournez sur votre application
2. Rechargez la page (F5)
3. Essayez à nouveau de cliquer sur "Prise de service"

## ✅ Résultat attendu
- Plus d'erreur "Missing or insufficient permissions"
- Les prises de service fonctionnent
- L'historique des services se remplit
- Les compteurs temps réel s'affichent

## 🆘 Si ça ne marche toujours pas
1. Vérifiez que votre utilisateur a le rôle `admin` ou `manager` dans la collection `users`
2. Ou que votre utilisateur a la permission `accounting` dans le champ `permissions`
3. Contactez l'administrateur pour vérifier vos permissions utilisateur

## 📞 Support
Si le problème persiste, vérifiez :
- Que vous êtes bien connecté à l'application
- Que les règles ont été correctement copiées (sans erreurs de syntaxe)
- Qu'il n'y a pas d'erreurs dans la console Firebase après publication 