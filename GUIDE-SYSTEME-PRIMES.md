# 🎯 Guide du Système de Primes & Grades

## Vue d'ensemble

Le système de primes et grades permet de :
- **Définir des grades** pour les employés (Débutant à Directeur)
- **Configurer des pourcentages de primes** selon les grades
- **Calculer automatiquement les primes** basées sur les ventes et prestations
- **Suivre les performances** et récompenser la progression

## Structure des Grades

### 🌱 Débutant
- **Description** : Niveau d'entrée
- **Prime par défaut** : 2% ventes, 1.5% prestations
- **Seuil minimum** : $50

### 📈 Junior  
- **Description** : Expérience limitée
- **Prime par défaut** : 3% ventes, 2% prestations
- **Seuil minimum** : $50

### ⭐ Senior
- **Description** : Expérience confirmée
- **Prime par défaut** : 4% ventes, 3% prestations
- **Seuil minimum** : $30

### 🎓 Expert
- **Description** : Très expérimenté
- **Prime par défaut** : 5% ventes, 4% prestations
- **Seuil minimum** : $30

### 👔 Manager
- **Description** : Responsable d'équipe
- **Prime par défaut** : 6% ventes, 5% prestations
- **Seuil minimum** : $20

### 👑 Directeur
- **Description** : Direction générale
- **Prime par défaut** : 8% ventes, 6% prestations
- **Seuil minimum** : $10

## Fonctionnement

### Attribution des Primes

1. **Seuil minimum** : Seules les transactions dépassant le seuil déclenchent une prime
2. **Pourcentage variable** : Selon le grade de l'employé
3. **Types différenciés** : Ventes et prestations ont des taux distincts
4. **Calcul automatique** : Les primes sont calculées en temps réel

### Exemple de Calcul

**Employé Senior** fait une vente de $100 :
- Seuil minimum : $30 ✅ (dépassé)
- Pourcentage vente : 4%
- **Prime générée** : $100 × 4% = $4

### Configuration

Dans l'onglet **"🎯 Primes & Grades"** :

1. **Gestion des grades** : Ajouter/modifier les configurations
2. **Pourcentages personnalisés** : Ajuster selon vos besoins
3. **Seuils modulables** : Définir le montant minimum
4. **Activation/désactivation** : Contrôler les configs actives

### Attribution des Grades

1. **Nouveau employé** : Grade "Débutant" par défaut
2. **Modification manuelle** : Dans la liste des employés
3. **Modal dédiée** : Interface simple pour changer le grade

## Statistiques

Le système calcule automatiquement :
- **Total primes ventes** : Somme de toutes les primes sur ventes
- **Total primes prestations** : Somme de toutes les primes sur prestations
- **Total général** : Vue d'ensemble des primes générées
- **Nombre de transactions** : Volume d'activité

## Migration Automatique

Au premier lancement :
- **Employés existants** reçoivent le grade "Débutant"
- **Configurations par défaut** sont créées automatiquement
- **Aucune intervention manuelle** requise

## Bonnes Pratiques

### Attribution des Grades
1. **Basée sur l'expérience** : Ancienneté et compétences
2. **Progression logique** : Débutant → Junior → Senior → Expert
3. **Rôle management** : Manager et Directeur pour les postes de responsabilité

### Configuration des Primes
1. **Cohérence** : Progression croissante avec les grades
2. **Équilibre** : Primes motivantes mais durables
3. **Seuils réalistes** : Adaptés à votre modèle économique

### Suivi des Performances
1. **Révision régulière** : Ajuster les pourcentages si nécessaire
2. **Analyse des tendances** : Utiliser les statistiques
3. **Feedback employés** : Écouter les retours

## Support Technique

En cas de problème :
1. **Logs console** : Vérifier les erreurs dans F12
2. **Réinitialisation** : Fonction de reset disponible
3. **Migration manuelle** : Possibilité d'ajustement des grades

---

*Ce système est conçu pour être flexible et évolutif selon vos besoins !* 🚀 