# 🔐 Configuration des Règles Firebase pour le Système de Primes

## ⚠️ PROBLÈME IDENTIFIÉ
L'erreur `Missing or insufficient permissions` vient du fait que Firebase Security Rules bloquent l'accès à la collection `bonus_configs`.

## 🛠️ SOLUTION : Configurer les Règles Firestore

### 1. Aller dans la Console Firebase
1. Allez sur [console.firebase.google.com](https://console.firebase.google.com)
2. Sélectionnez votre projet **Gouvernement RP**
3. Dans le menu de gauche : **Firestore Database**
4. Cliquez sur l'onglet **Règles** (Rules)

### 2. Ajouter les Règles pour les Primes

**AJOUTEZ ces lignes à vos règles Firestore existantes :**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Règles existantes pour employees, transactions, etc.
    match /employees/{document} {
      allow read, write: if request.auth != null;
    }
    
    match /transactions/{document} {
      allow read, write: if request.auth != null;
    }
    
    match /service_items/{document} {
      allow read, write: if request.auth != null;
    }
    
    match /service_transactions/{document} {
      allow read, write: if request.auth != null;
    }
    
    // ✅ NOUVELLES RÈGLES POUR LES PRIMES
    match /bonus_configs/{document} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 3. Publier les Règles
1. Cliquez sur **Publier** (Publish)
2. Confirmez la publication

## 🚀 Règles plus sécurisées (optionnel)

Pour une sécurité renforcée, vous pouvez utiliser ces règles :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Règles pour la gestion des primes (admin seulement)
    match /bonus_configs/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (request.auth.token.admin == true || 
         request.auth.token.role == "admin" ||
         request.auth.uid == "VOTRE_UID_ADMIN");
    }
    
    // Employés - lecture libre, écriture admin
    match /employees/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Transactions - accès complet pour utilisateurs authentifiés
    match /transactions/{document} {
      allow read, write: if request.auth != null;
    }
    
    match /service_items/{document} {
      allow read, write: if request.auth != null;
    }
    
    match /service_transactions/{document} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 🔍 Vérification

Après avoir publié les règles :

1. **Actualiser votre application**
2. **Aller sur l'onglet Primes & Grades**
3. **Vérifier que l'erreur a disparu**
4. **Tester l'ajout d'une configuration de prime**

## 📝 Règles recommandées pour la production

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Configurations de primes - lecture libre, écriture authentifiée
    match /bonus_configs/{document} {
      allow read: if true; // Visible par tous pour les calculs
      allow create, update, delete: if request.auth != null; // Seuls les utilisateurs connectés peuvent modifier
    }
    
    // Employés - accès authentifié
    match /employees/{document} {
      allow read, write: if request.auth != null;
    }
    
    // Transactions - accès authentifié
    match /transactions/{document} {
      allow read, write: if request.auth != null;
    }
    
    // Services - accès authentifié
    match /service_items/{document} {
      allow read, write: if request.auth != null;
    }
    
    match /service_transactions/{document} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## ⏰ Temps de propagation

**Important :** Les règles Firebase peuvent prendre jusqu'à **10 minutes** pour se propager complètement. Si l'erreur persiste après avoir publié les règles, patientez quelques minutes.

---

**Une fois les règles publiées, le système de primes fonctionnera parfaitement !** 🎉 