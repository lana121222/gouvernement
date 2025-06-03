# Guide de Résolution - Problème d'Ajout de Services

## 🔍 Diagnostic du Problème

Le problème que vous rencontrez (services qui ne s'ajoutent pas) peut avoir plusieurs causes. Voici comment diagnostiquer et résoudre le problème étape par étape.

## 📋 Étapes de Diagnostic

### 1. Vérifier l'Authentification

**Problème le plus probable** : Vous n'êtes pas connecté ou vous n'avez pas les bonnes permissions.

**Comment vérifier :**
1. Ouvrez votre navigateur et allez sur votre application
2. Ouvrez les **Outils de Développement** (F12)
3. Allez dans l'onglet **Console**
4. Essayez d'ajouter un service et regardez les logs

**Logs à chercher :**
```
[PRICING] authStore.isAuthenticated: false
[PRICING] ERREUR: Utilisateur non authentifié!
```

**Solution :**
- Connectez-vous avec un compte qui a les permissions `accounting`
- Utilisez l'un de ces comptes (si configurés) :
  - `admin@gouvernement-rp.com`
  - `manager@gouvernement-rp.com`
  - `comptable@gouvernement-rp.com`

### 2. Vérifier les Permissions

**Comment vérifier :**
Regardez dans la console :
```
[PRICING] authStore.canAccessAccounting: false
[PRICING] ERREUR: Permissions insuffisantes!
```

**Solution :**
1. Allez dans la console Firebase → Authentication → Users
2. Trouvez votre utilisateur
3. Vérifiez que dans la collection `users` de Firestore, votre utilisateur a :
   - `role: "admin"` ou `role: "manager"`
   - OU `permissions: ["accounting"]`

### 3. Vérifier les Règles Firestore

**Erreur typique :**
```
[PRICING] Code d'erreur Firebase: permission-denied
[PRICING] ERREUR DE PERMISSION FIREBASE!
```

**Solution :**
1. Allez dans la console Firebase → Firestore Database → Rules
2. Vérifiez que les règles pour `serviceItems` sont correctes :

```javascript
// 🛠️ SERVICE ITEMS COLLECTION (prix et services)
match /serviceItems/{serviceItemId} {
  allow read, write: if request.auth != null && 
    exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
    (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'manager'] ||
     'accounting' in get(/databases/$(database)/documents/users/$(request.auth.uid)).data.permissions);
}
```

### 4. Vérifier la Configuration Firebase

**Comment vérifier :**
1. Ouvrez `src/lib/firebase.ts`
2. Vérifiez que toutes les variables d'environnement sont définies :

```typescript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  // ...
}
```

3. Vérifiez votre fichier `.env` :
```env
VITE_FIREBASE_API_KEY=votre_clé_api
VITE_FIREBASE_AUTH_DOMAIN=votre_projet.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=votre_projet_id
# ...
```

## 🛠️ Solutions Étape par Étape

### Solution 1: Créer un Utilisateur Admin

Si vous n'avez pas d'utilisateur avec les bonnes permissions :

1. **Créer un compte admin dans Firebase Authentication :**
   ```bash
   npm run dev
   ```
   - Allez sur `/register`
   - Créez un compte avec `admin@gouvernement-rp.com`

2. **Ajouter les permissions dans Firestore :**
   - Allez dans la console Firebase → Firestore
   - Collection `users` → Document avec votre UID
   - Ajoutez ces champs :
   ```json
   {
     "email": "admin@gouvernement-rp.com",
     "role": "admin",
     "permissions": ["accounting", "users", "employees", "transactions"],
     "created_at": "2024-01-01T00:00:00.000Z"
   }
   ```

### Solution 2: Utiliser le Script de Test

1. **Modifiez `test-firebase.html` :**
   - Remplacez la configuration Firebase par la vôtre
   - Ouvrez le fichier dans votre navigateur

2. **Testez étape par étape :**
   1. Cliquez sur "Test Login Admin"
   2. Cliquez sur "Test Permissions"
   3. Cliquez sur "Test Ajouter Service"

### Solution 3: Règles Firestore Temporaires (DÉVELOPPEMENT UNIQUEMENT)

**⚠️ NE PAS UTILISER EN PRODUCTION !**

Temporairement, pour tester, vous pouvez utiliser ces règles :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**N'oubliez pas de remettre les vraies règles après !**

## 🔧 Script de Diagnostic Automatique

Ajoutez ce script dans la console de votre navigateur pour un diagnostic complet :

```javascript
// Diagnostic automatique
async function diagnosticComplet() {
    console.log('🔍 DIAGNOSTIC AUTOMATIQUE');
    
    // 1. Vérifier l'authentification
    const { auth } = await import('./src/lib/firebase.js');
    console.log('1. Auth currentUser:', auth.currentUser);
    
    // 2. Vérifier le store auth
    const authStore = window.app?.$store?.state?.auth;
    console.log('2. AuthStore:', authStore);
    
    // 3. Tenter d'ajouter un service test
    try {
        const { db } = await import('./src/lib/firebase.js');
        const { addDoc, collection } = await import('firebase/firestore');
        
        const docRef = await addDoc(collection(db, 'serviceItems'), {
            name: 'Test Diagnostic',
            category: 'vente',
            price: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        });
        console.log('3. ✅ Test d\'ajout réussi:', docRef.id);
    } catch (error) {
        console.log('3. ❌ Erreur d\'ajout:', error);
    }
}

diagnosticComplet();
```

## 📞 Derniers Recours

Si rien ne fonctionne :

1. **Vérifiez les logs détaillés** dans la console de votre navigateur
2. **Vérifiez la console Firebase** pour des erreurs côté serveur
3. **Redémarrez votre serveur de développement** (`npm run dev`)
4. **Effacez le cache du navigateur** (Ctrl+Shift+R)

## ✅ Checklist de Vérification

- [ ] Utilisateur connecté avec un compte valide
- [ ] Utilisateur a le rôle `admin` ou `manager` OU permission `accounting`
- [ ] Document utilisateur existe dans la collection `users` de Firestore
- [ ] Règles Firestore configurées correctement
- [ ] Configuration Firebase valide (fichier `.env`)
- [ ] Pas d'erreurs dans la console du navigateur
- [ ] Application redémarrée après changements

---

**Si le problème persiste après avoir suivi ce guide, partagez les logs de la console pour un diagnostic plus poussé.** 