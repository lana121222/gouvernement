# 🎯 Guide de Test - Système de Primes Automatiques

## ✅ SYSTÈME INTÉGRÉ ET FONCTIONNEL

Le système de primes automatiques est maintenant **entièrement intégré** avec l'onglet Employés actifs !

## 🧪 TESTS À EFFECTUER

### 1. 📋 **Vérifier l'Interface des Employés**

#### Onglet "Employés" :
1. **Allez sur** `/employees` 
2. **Vérifiez la nouvelle colonne "Poste & Grade"** - chaque employé doit avoir son emoji de grade
3. **Vérifiez la colonne "Primes"** - elle doit maintenant afficher :
   - ✅ **Primes Automatiques** (calculées en temps réel)
   - ✅ **Prime Manuelle** (champ de saisie)
   - ✅ **Total des primes**

#### Nouvelles statistiques en bas :
- ✅ **Primes automatiques totales** (en violet)
- ✅ **Primes manuelles totales** (en bleu)
- ✅ **Masse salariale totale** (incluant toutes les primes)

### 2. 🛒 **Tester le Calcul Automatique des Primes**

#### Pré-requis :
1. **Avoir au moins 1 employé** avec un grade défini
2. **Avoir des configurations de primes** (créées automatiquement)

#### Test Ventes :
1. **Allez sur** l'onglet "Services & Ventes"
2. **Enregistrez une vente** pour un employé (ex: $100)
3. **Retournez sur** l'onglet "Employés"
4. **Vérifiez** que la prime automatique s'affiche dans la colonne "Primes"

#### Test Prestations :
1. **Enregistrez une prestation** pour le même employé (ex: $80)
2. **Vérifiez** que la prime augmente automatiquement
3. **Les deux primes** (ventes + prestations) doivent être visibles

### 3. 💰 **Tester le Paiement Complet**

#### Processus de paiement :
1. **Sélectionnez un employé** avec des primes automatiques
2. **Cliquez sur "Payer"**
3. **Vérifiez** que le paiement inclut :
   - ✅ Salaire de base (heures × taux)
   - ✅ Prime manuelle 
   - ✅ Prime ventes automatique
   - ✅ Prime prestations automatique

#### Vérification transactions :
4. **Allez sur** l'onglet "Transactions récentes"
5. **Vérifiez** qu'il y a plusieurs transactions :
   - ✅ **Salaire** (montant de base)
   - ✅ **Prime Ventes** (si applicable) 
   - ✅ **Prime Prestations** (si applicable)

### 4. 🎯 **Tester l'Onglet Primes & Grades**

#### Configuration des primes :
1. **Allez sur** l'onglet "🎯 Primes & Grades"
2. **Vérifiez** les configurations par défaut
3. **Modifiez un pourcentage** (ex: Débutant → 3% ventes)
4. **Retournez sur Employés** → les primes doivent se recalculer

#### Changement de grade :
1. **Changez le grade d'un employé** (ex: Débutant → Junior)
2. **Vérifiez** que les primes se recalculent automatiquement
3. **Les nouveaux pourcentages** doivent s'appliquer

### 5. ⚡ **Tests en Temps Réel**

#### Mise à jour automatique :
1. **Ayez l'onglet Employés ouvert**
2. **Dans un autre onglet**, ajoutez une vente pour un employé
3. **Retournez sur Employés** → la prime doit être mise à jour
4. **Pas besoin de recharger** la page

## 📊 EXEMPLES DE CALCULS

### Employé Débutant (2% ventes, 1.5% prestations) :
- **Vente de $100** → Prime : $2.00
- **Prestation de $80** → Prime : $1.20
- **Total primes auto** : $3.20

### Employé Senior (4% ventes, 3% prestations) :
- **Vente de $100** → Prime : $4.00  
- **Prestation de $80** → Prime : $2.40
- **Total primes auto** : $6.40

## 🔍 DÉBOGAGE

### Si les primes ne s'affichent pas :
1. **Vérifiez la console** (`F12` → Console)
2. **Recherchez** `[STORE] Primes recalculées pour`
3. **Vérifiez** que l'employé a un grade défini

### Si les configurations sont vides :
1. **Allez sur Primes & Grades**
2. **Vérifiez** que les configs par défaut sont créées
3. **Sinon**, créez-les manuellement

### Si les règles Firebase bloquent :
1. **Consultez** `GUIDE-APPLICATION-REGLES-FIREBASE.md`
2. **Appliquez** les nouvelles règles Firebase
3. **Attendez** 5 minutes pour la propagation

## 🎉 RÉSULTAT ATTENDU

**Système entièrement automatisé** :
- ✅ **Primes calculées** automatiquement après chaque vente/prestation
- ✅ **Interface unifiée** dans l'onglet Employés
- ✅ **Paiements complets** incluant toutes les primes  
- ✅ **Transparence totale** avec détail des calculs
- ✅ **Temps réel** sans rechargement de page
- ✅ **Grades flexibles** avec pourcentages configurables

---

**Le système de primes est maintenant pleinement opérationnel et intégré ! 🚀** 