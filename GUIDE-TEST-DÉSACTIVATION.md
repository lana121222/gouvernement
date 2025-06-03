# 🧪 Guide de Test - Désactivation des Utilisateurs

## 🎯 **Objectif**

Valider que la nouvelle fonctionnalité de désactivation des utilisateurs fonctionne correctement et résout le problème initial.

## ✅ **Fonctionnalités Implémentées**

1. **Désactivation au lieu de suppression** : Les utilisateurs sont marqués `is_deleted: true`
2. **Vérification lors de la connexion** : Empêche les utilisateurs désactivés de se connecter
3. **Filtrage des listes** : Les utilisateurs désactivés n'apparaissent plus dans l'interface admin
4. **Réactivation possible** : Fonction pour rétablir un utilisateur désactivé

## 🧪 **Plan de Test**

### **Test 1 : Désactivation d'un Utilisateur**

**Étapes :**
1. Connectez-vous en tant qu'administrateur
2. Allez dans "🔧 Administration - Gestion des utilisateurs"
3. Sélectionnez un utilisateur de test
4. Cliquez sur "Supprimer l'utilisateur"

**Résultat attendu :**
- ✅ L'utilisateur disparaît de la liste
- ✅ Message de confirmation affiché
- ✅ Dans Firebase Console, vérifier que `is_deleted: true` est ajouté

### **Test 2 : Tentative de Connexion Utilisateur Désactivé**

**Étapes :**
1. Déconnectez-vous de l'interface admin
2. Essayez de vous connecter avec les identifiants de l'utilisateur désactivé

**Résultat attendu :**
- ❌ Connexion refusée
- 📱 Message : "Votre compte a été désactivé. Contactez un administrateur."
- ❌ Utilisateur automatiquement déconnecté

### **Test 3 : Vérification Base de Données**

**Vérifier dans Firebase Console :**

```json
// Document utilisateur désactivé dans collection 'users'
{
  "id": "user123",
  "email": "test@example.com",
  "role": "employee",
  "is_deleted": true,
  "deleted_at": "2024-01-15T10:30:00.000Z",
  "deleted_by": "admin-id",
  "last_token_revocation": 1705312200000
}

// Document profil désactivé dans collection 'profiles'
{
  "user_id": "user123",
  "is_deleted": true,
  "deleted_at": "2024-01-15T10:30:00.000Z"
}
```

### **Test 4 : Filtrage des Utilisateurs Actifs**

**Étapes :**
1. Rechargez la page d'administration
2. Vérifiez la liste des utilisateurs

**Résultat attendu :**
- ✅ L'utilisateur désactivé n'apparaît plus dans la liste
- ✅ Seuls les utilisateurs actifs sont visibles
- ✅ Le compteur d'utilisateurs est mis à jour

### **Test 5 : Réactivation d'un Utilisateur (Bonus)**

**Étapes :**
1. Exécutez la fonction `reactivateUser()` depuis la console
2. Ou ajoutez un bouton "Réactiver" dans l'interface

**Code de test :**
```javascript
// Dans la console du navigateur
import { useUserStore } from '@/stores/users'
const userStore = useUserStore()
await userStore.reactivateUser('user-id-désactivé')
```

**Résultat attendu :**
- ✅ L'utilisateur réapparaît dans la liste
- ✅ Il peut se reconnecter normalement
- ✅ Champs `is_deleted`, `deleted_at`, `deleted_by` remis à `null/false`

## 🚨 **Scénarios d'Erreur à Tester**

### **Test 6 : Utilisateur Désactivé Déjà Connecté**

**Étapes :**
1. Connectez un utilisateur sur un autre navigateur/onglet
2. Désactivez-le depuis l'interface admin
3. L'utilisateur désactivé navigue dans l'app

**Résultat attendu :**
- ❌ Déconnexion automatique à la prochaine vérification
- 📱 Message d'erreur approprié

### **Test 7 : Gestion des Permissions**

**Étapes :**
1. Essayez de désactiver un utilisateur sans être admin

**Résultat attendu :**
- ❌ Erreur de permissions
- 📱 Message "Permissions insuffisantes"

## 📊 **Checklist de Validation**

| Test | Description | Status | Notes |
|------|-------------|---------|-------|
| ✅ | Désactivation via interface admin | ⬜ | |
| ✅ | Connexion refusée utilisateur désactivé | ⬜ | |
| ✅ | Filtrage liste utilisateurs actifs | ⬜ | |
| ✅ | Base de données correctement mise à jour | ⬜ | |
| ✅ | Messages d'erreur appropriés | ⬜ | |
| ✅ | Réactivation fonctionne | ⬜ | |
| ✅ | Déconnexion automatique | ⬜ | |

## 🔧 **Debug et Logs**

### **Logs à Surveiller :**

```javascript
// Console navigateur - Désactivation réussie
"✅ Utilisateur désactivé avec succès"

// Console navigateur - Connexion refusée
"Erreur d'authentification: Ce compte a été désactivé. Contactez un administrateur."

// Console navigateur - Filtrage des utilisateurs
"Récupération des utilisateurs actifs uniquement"
```

### **Vérification Network Tab :**
- Requête Firestore avec filtre `where('is_deleted', '!=', true)`
- Pas d'appel vers Cloud Functions
- Mise à jour document avec `updateDoc()`

## ⚡ **Performance**

**Avantages de cette approche :**
- ✅ **Plus rapide** : Pas d'appel Cloud Functions
- ✅ **Moins cher** : Évite le plan Blaze Firebase
- ✅ **Plus simple** : Logique dans le frontend uniquement
- ✅ **Réversible** : Possibilité de réactiver

## 🎉 **Résultat Final Attendu**

Après tous les tests :

1. **✅ Problème résolu** : L'utilisateur désactivé ne peut plus se connecter
2. **✅ Interface nettoyée** : Plus d'utilisateurs fantômes dans l'admin
3. **✅ Sécurité** : Déconnexion automatique des sessions actives
4. **✅ Flexibilité** : Possibilité de réactiver si nécessaire

⚠️ **Note importante** : L'adresse email reste "réservée" dans Firebase Authentication. Pour permettre une nouvelle inscription avec la même adresse, il faudrait supprimer manuellement le compte dans Firebase Auth Console.

## 🔄 **Prochaines Améliorations Possibles**

1. **Interface de réactivation** : Bouton dans l'admin pour réactiver
2. **Liste des utilisateurs supprimés** : Page dédiée pour voir les désactivés
3. **Logs d'audit** : Historique des désactivations/réactivations
4. **Notification email** : Prévenir l'utilisateur de la désactivation 