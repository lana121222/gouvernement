# Configuration des comptes administrateur

## 📋 **Étapes pour créer les comptes administrateur :**

### **1. Exécuter le script SQL**
1. Allez sur [supabase.com](https://supabase.com) → Votre projet
2. Onglet **SQL Editor**
3. Copiez et exécutez le contenu du fichier `supabase-setup.sql`

### **2. Créer un compte administrateur**

#### **Option A : Via l'interface Supabase (Recommandé)**
1. Onglet **Authentication** → **Users**
2. Cliquez **Add user**
3. Remplissez :
   - **Email** : `admin@gouvernement-rp.com`
   - **Password** : `AdminGouv2024!`
   - **Email Confirm** : ✅ (coché)
4. Cliquez **Create user**

#### **Option B : Via SQL**
```sql
-- Créer l'utilisateur dans auth.users
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@gouvernement-rp.com',
  crypt('AdminGouv2024!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);
```

### **3. Promouvoir en administrateur**
Après création du compte, exécutez cette requête SQL :

```sql
-- Mettre à jour le rôle en admin avec toutes les permissions
UPDATE users 
SET 
  role = 'admin',
  permissions = ARRAY['accounting', 'users', 'employees', 'transactions']
WHERE email = 'admin@gouvernement-rp.com';
```

### **4. Comptes suggérés**

| Email | Mot de passe | Rôle | Permissions |
|-------|-------------|------|-------------|
| `admin@gouvernement-rp.com` | `AdminGouv2024!` | admin | Toutes |
| `manager@gouvernement-rp.com` | `ManagerGouv2024!` | manager | accounting |
| `comptable@gouvernement-rp.com` | `ComptaGouv2024!` | employee | accounting |

### **5. Vérification**
1. Allez sur votre application déployée
2. Cliquez **Connexion**
3. Utilisez les identifiants créés
4. Vérifiez l'accès aux sections **Dashboard** et **Comptabilité**

## 🔐 **Sécurité**
- ⚠️ **Changez les mots de passe par défaut** après la première connexion
- ✅ Utilisez des mots de passe forts en production
- ✅ Activez l'authentification à deux facteurs si nécessaire

## 🚀 **Accès aux fonctionnalités**

### **Administrateur (`admin`)**
- ✅ Toutes les fonctionnalités
- ✅ Gestion des employés
- ✅ Comptabilité complète
- ✅ Gestion des utilisateurs

### **Manager (`manager`)**
- ✅ Dashboard
- ✅ Comptabilité (si permission `accounting`)
- ❌ Gestion des utilisateurs système

### **Employé (`employee`)**
- ✅ Dashboard
- ✅ Fonctionnalités selon permissions assignées

### **Visiteur (`viewer`)**
- ✅ Pages publiques seulement
- ❌ Pas d'accès aux sections privées 