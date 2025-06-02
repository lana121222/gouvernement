-- 🚀 SCRIPT AUTOMATIQUE DE CONFIGURATION COMPLÈTE
-- Exécutez ce script dans l'éditeur SQL de Supabase pour tout configurer automatiquement

-- ========================================
-- 1. CRÉATION DES TABLES
-- ========================================

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'manager', 'employee', 'viewer')),
  permissions TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des employés
CREATE TABLE IF NOT EXISTS employees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  position TEXT NOT NULL,
  hourly_rate DECIMAL(10,2) NOT NULL DEFAULT 0,
  hours_worked DECIMAL(10,2) NOT NULL DEFAULT 0,
  bonus_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_earnings DECIMAL(10,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_former BOOLEAN NOT NULL DEFAULT false,
  termination_date TIMESTAMP WITH TIME ZONE,
  termination_reason TEXT,
  is_blacklisted BOOLEAN NOT NULL DEFAULT false
);

-- Table des transactions
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  employee_id UUID REFERENCES employees(id)
);

-- ========================================
-- 2. FONCTIONS ET TRIGGERS
-- ========================================

-- Fonction pour créer automatiquement un profil utilisateur
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role, permissions)
  VALUES (NEW.id, NEW.email, 'viewer', '{}');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer automatiquement le profil
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ========================================
-- 3. POLITIQUES DE SÉCURITÉ (RLS)
-- ========================================

-- Activer RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Admins and managers can view employees" ON employees;
DROP POLICY IF EXISTS "Admins and managers can view transactions" ON transactions;

-- Politique pour les utilisateurs
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Politique pour les employés
CREATE POLICY "Admins and managers can view employees" ON employees
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND (users.role IN ('admin', 'manager') OR 'accounting' = ANY(users.permissions))
    )
  );

-- Politique pour les transactions
CREATE POLICY "Admins and managers can view transactions" ON transactions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND (users.role IN ('admin', 'manager') OR 'accounting' = ANY(users.permissions))
    )
  );

-- ========================================
-- 4. CRÉATION AUTOMATIQUE DES COMPTES ADMIN
-- ========================================

-- Variables pour les comptes (modifiez si nécessaire)
DO $$
DECLARE
    admin_user_id UUID;
    manager_user_id UUID;
    comptable_user_id UUID;
BEGIN
    -- Créer le compte administrateur principal
    INSERT INTO auth.users (
        id,
        instance_id,
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
        gen_random_uuid(),
        '00000000-0000-0000-0000-000000000000',
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
    ) ON CONFLICT (email) DO NOTHING
    RETURNING id INTO admin_user_id;

    -- Créer le compte manager
    INSERT INTO auth.users (
        id,
        instance_id,
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
        gen_random_uuid(),
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        'manager@gouvernement-rp.com',
        crypt('ManagerGouv2024!', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '',
        '',
        '',
        ''
    ) ON CONFLICT (email) DO NOTHING
    RETURNING id INTO manager_user_id;

    -- Créer le compte comptable
    INSERT INTO auth.users (
        id,
        instance_id,
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
        gen_random_uuid(),
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        'comptable@gouvernement-rp.com',
        crypt('ComptaGouv2024!', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '',
        '',
        '',
        ''
    ) ON CONFLICT (email) DO NOTHING
    RETURNING id INTO comptable_user_id;

    -- Attendre un peu pour que les triggers se déclenchent
    PERFORM pg_sleep(1);

    -- Mettre à jour les rôles et permissions
    UPDATE users 
    SET 
        role = 'admin',
        permissions = ARRAY['accounting', 'users', 'employees', 'transactions']
    WHERE email = 'admin@gouvernement-rp.com';

    UPDATE users 
    SET 
        role = 'manager',
        permissions = ARRAY['accounting', 'employees']
    WHERE email = 'manager@gouvernement-rp.com';

    UPDATE users 
    SET 
        role = 'employee',
        permissions = ARRAY['accounting']
    WHERE email = 'comptable@gouvernement-rp.com';

    -- Afficher un message de confirmation
    RAISE NOTICE '✅ Configuration terminée avec succès !';
    RAISE NOTICE '📧 Comptes créés :';
    RAISE NOTICE '   - admin@gouvernement-rp.com (mot de passe: AdminGouv2024!)';
    RAISE NOTICE '   - manager@gouvernement-rp.com (mot de passe: ManagerGouv2024!)';
    RAISE NOTICE '   - comptable@gouvernement-rp.com (mot de passe: ComptaGouv2024!)';
    RAISE NOTICE '🚀 Votre application est prête à être utilisée !';

END $$;

-- ========================================
-- 5. DONNÉES DE TEST (OPTIONNEL)
-- ========================================

-- Insérer quelques employés de test
INSERT INTO employees (first_name, last_name, email, position, hourly_rate, hours_worked, total_earnings) VALUES
('Jean', 'Dupont', 'jean.dupont@gouvernement-rp.com', 'Commissaire de Police', 25.00, 160, 4000.00),
('Marie', 'Martin', 'marie.martin@gouvernement-rp.com', 'Juge', 30.00, 140, 4200.00),
('Pierre', 'Durand', 'pierre.durand@gouvernement-rp.com', 'Administrateur', 20.00, 150, 3000.00)
ON CONFLICT (email) DO NOTHING;

-- Insérer quelques transactions de test
INSERT INTO transactions (type, amount, description, category) VALUES
('income', 50000.00, 'Budget mensuel gouvernement', 'Budget'),
('expense', 15000.00, 'Salaires employés', 'Salaires'),
('expense', 2500.00, 'Équipement bureau', 'Matériel'),
('income', 8000.00, 'Amendes et contraventions', 'Revenus')
ON CONFLICT DO NOTHING;

-- Message final
SELECT '🎉 CONFIGURATION AUTOMATIQUE TERMINÉE ! 🎉' as message;
SELECT 'Vous pouvez maintenant vous connecter avec les comptes créés.' as instruction; 