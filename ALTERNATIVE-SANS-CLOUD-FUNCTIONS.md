# 🔄 Alternative Sans Cloud Functions - Désactivation des Utilisateurs

## 🎯 **Solution Alternative : Désactivation au lieu de Suppression**

Au lieu de supprimer complètement les utilisateurs (qui nécessite des Cloud Functions), nous pouvons les **désactiver**. Cette approche est plus simple et tout aussi efficace.

## ✅ **Avantages de cette Approche**

1. **Pas de Cloud Functions** : Évite la complexité et les coûts
2. **Contrôle total depuis le frontend** : Modification simple dans le store
3. **Réversible** : Possibilité de réactiver un utilisateur
4. **Audit trail** : Conservation des données pour traçabilité
5. **Plus rapide** : Pas de déploiement backend nécessaire

## 🔧 **Implémentation**

### **1. Modifier le Store Users**

```typescript
// src/stores/users.ts
const deleteUser = async (userId: string) => {
  loading.value = true
  error.value = null
  
  try {
    // Marquer l'utilisateur comme supprimé
    const userRef = doc(db, 'users', userId)
    await updateDoc(userRef, {
      is_deleted: true,
      deleted_at: new Date().toISOString(),
      deleted_by: authStore.user?.id,
      // Révoquer tous les tokens
      last_token_revocation: Date.now()
    })
    
    // Marquer le profil comme supprimé aussi
    try {
      const profileRef = doc(db, 'profiles', userId)
      await updateDoc(profileRef, {
        is_deleted: true,
        deleted_at: new Date().toISOString()
      })
    } catch (profileError) {
      console.log('Aucun profil à désactiver pour cet utilisateur')
    }
    
    // Supprimer localement de la liste
    users.value = users.value.filter(u => u.id !== userId)
    
    console.log('✅ Utilisateur désactivé avec succès')
  } catch (err: any) {
    console.error('Erreur lors de la désactivation de l\'utilisateur:', err)
    error.value = 'Impossible de désactiver l\'utilisateur'
    throw err
  } finally {
    loading.value = false
  }
}
```

### **2. Modifier l'Interface User**

```typescript
// src/lib/firebase.ts - Ajouter les champs de désactivation
export interface User {
  id: string
  email: string
  role: 'admin' | 'manager' | 'employee' | 'viewer'
  permissions: string[]
  created_at: string
  // Nouveaux champs pour la désactivation
  is_deleted?: boolean
  deleted_at?: string
  deleted_by?: string
  last_token_revocation?: number
}
```

### **3. Logique de Connexion**

```typescript
// src/stores/auth.ts - Vérifier si l'utilisateur est désactivé lors du login
const checkUserStatus = async (userId: string) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId))
    
    if (userDoc.exists()) {
      const userData = userDoc.data()
      
      // Si l'utilisateur est marqué comme supprimé
      if (userData.is_deleted) {
        // Déconnecter immédiatement
        await signOut(auth)
        throw new Error('Ce compte a été désactivé. Contactez un administrateur.')
      }
      
      return userData
    }
    
    throw new Error('Utilisateur non trouvé')
  } catch (error) {
    console.error('Erreur lors de la vérification du statut utilisateur:', error)
    throw error
  }
}

// Appeler cette fonction après chaque connexion
const login = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const user = userCredential.user
    
    // Vérifier le statut de l'utilisateur
    const userData = await checkUserStatus(user.uid)
    
    // Continuer la connexion normalement...
  } catch (error) {
    // Gérer les erreurs de connexion
    throw error
  }
}
```

### **4. Filtrage dans les Requêtes**

```typescript
// src/stores/users.ts - Filtrer les utilisateurs supprimés
const fetchUsers = async (): Promise<User[]> => {
  loading.value = true
  error.value = null
  
  try {
    const usersRef = collection(db, 'users')
    // Filtrer pour ne récupérer que les utilisateurs actifs
    const q = query(
      usersRef, 
      where('is_deleted', '!=', true),
      orderBy('created_at', 'desc')
    )
    
    const querySnapshot = await getDocs(q)
    
    const fetchedUsers: User[] = []
    querySnapshot.forEach((doc) => {
      fetchedUsers.push({
        id: doc.id,
        ...doc.data()
      } as User)
    })
    
    users.value = fetchedUsers
    return fetchedUsers
  } catch (err) {
    console.error('Erreur lors de la récupération des utilisateurs:', err)
    error.value = 'Impossible de charger les utilisateurs'
    throw err
  } finally {
    loading.value = false
  }
}
```

## 🔄 **Fonctionnalités Bonus**

### **1. Réactivation d'Utilisateurs**

```typescript
const reactivateUser = async (userId: string) => {
  try {
    const userRef = doc(db, 'users', userId)
    await updateDoc(userRef, {
      is_deleted: false,
      deleted_at: null,
      deleted_by: null,
      reactivated_at: new Date().toISOString(),
      reactivated_by: authStore.user?.id
    })
    
    console.log('✅ Utilisateur réactivé avec succès')
  } catch (error) {
    console.error('Erreur lors de la réactivation:', error)
    throw error
  }
}
```

### **2. Liste des Utilisateurs Supprimés**

```typescript
const fetchDeletedUsers = async (): Promise<User[]> => {
  try {
    const usersRef = collection(db, 'users')
    const q = query(
      usersRef, 
      where('is_deleted', '==', true),
      orderBy('deleted_at', 'desc')
    )
    
    const querySnapshot = await getDocs(q)
    const deletedUsers: User[] = []
    
    querySnapshot.forEach((doc) => {
      deletedUsers.push({
        id: doc.id,
        ...doc.data()
      } as User)
    })
    
    return deletedUsers
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs supprimés:', error)
    throw error
  }
}
```

## 🧪 **Test de la Solution**

### **Test 1 : Désactivation**
1. Supprimer un utilisateur via l'interface admin
2. L'utilisateur essaie de se connecter
3. **Résultat** : Message "Compte désactivé" et déconnexion automatique

### **Test 2 : Nouvelle Inscription**
1. L'utilisateur désactivé essaie de créer un nouveau compte avec la même adresse
2. **Résultat** : Firebase Auth dira "Email déjà utilisé"
3. **Solution** : L'admin peut réactiver l'ancien compte ou supprimer manuellement de Firebase Auth

## 🎯 **Comparaison des Solutions**

| Critère | Cloud Functions | Désactivation | Firestore-only |
|---------|----------------|---------------|----------------|
| Complexité | ⭐⭐⭐ | ⭐ | ⭐⭐⭐⭐ |
| Coût | €€€ | € | €€ |
| Sécurité | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| Réversibilité | ❌ | ✅ | ✅ |
| Réutilisation email | ✅ | ❌* | ✅ |
| Temps d'implémentation | 2h | 30min | 8h+ |

*Possible avec suppression manuelle dans Firebase Auth Console

## 📝 **Instructions de Migration**

Si vous choisissez cette solution :

1. **Remplacez le code** dans `src/stores/users.ts` avec la nouvelle fonction `deleteUser`
2. **Ajoutez les nouveaux champs** dans l'interface `User`
3. **Modifiez les requêtes** pour filtrer les utilisateurs supprimés
4. **Testez** avec un utilisateur de test

Cette solution est **beaucoup plus simple** et évite complètement les Cloud Functions !

## 🎉 **Résultat**

✅ L'utilisateur ne peut plus se connecter  
✅ Pas de Cloud Functions nécessaires  
✅ Solution réversible  
✅ Implémentation en 30 minutes  
⚠️ L'adresse email reste "réservée" dans Firebase Auth 