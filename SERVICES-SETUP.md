# Configuration des Services - Gouvernement RP

## Vue d'ensemble
Le système de services et prestations comprend :

### 🎯 Fonctionnalités principales
1. **Prise/Fin de service** - Suivi des horaires des employés
2. **Ventes & Prestations** - Enregistrement des revenus avec menu déroulant
3. **Gestion des prix** - Administration des services et tarifs

### 📁 Nouveaux fichiers créés
- `src/components/ServicesManagement.vue` - Gestion prise/fin de service
- `src/components/SalesManagement.vue` - Formulaire ventes/prestations
- `src/components/PricingManagement.vue` - Administration des prix

### 🔧 Types ajoutés
```typescript
ServiceItem {
  id: string
  name: string
  price: number
  category: 'vente' | 'prestation' | 'service'
  description?: string
  created_at: string
  updated_at: string
}

ServiceTransaction {
  id: string
  type: 'prise_service' | 'fin_service' | 'vente' | 'prestation'
  employee_id: string
  employee_name: string
  service_item_id?: string
  service_name: string
  amount: number
  custom_description?: string
  shift_duration?: number
}
```

## 🚀 Premiers services à configurer

### Ventes (exemples)
1. **Essence** - $50.00
2. **Réparation pneu** - $25.00
3. **Vidange** - $75.00
4. **Diagnostic** - $40.00

### Prestations (exemples)
1. **Consultation juridique** - $100.00
2. **Assistance administrative** - $60.00
3. **Formation** - $120.00
4. **Expertise technique** - $200.00

## 🎮 Utilisation pour les joueurs

### Employés
1. **Prise de service** - Bouton dans l'onglet "Services"
2. **Enregistrer vente** - Formulaire dans "Ventes & Prestations"
3. **Option "Autre"** - Prix et description personnalisés
4. **Fin de service** - Calcul automatique de la durée

### Administrateurs
1. **Gestion des prix** - Ajouter/modifier/supprimer services
2. **Historique** - Suivi de toutes les activités
3. **Revenus** - Intégration automatique dans la comptabilité

## 🔥 Collections Firestore requises

### `serviceItems`
```javascript
{
  name: "Essence",
  price: 50.00,
  category: "vente",
  description: "Carburant pour véhicules",
  created_at: "2024-01-20T10:00:00.000Z",
  updated_at: "2024-01-20T10:00:00.000Z"
}
```

### `serviceTransactions`
```javascript
{
  type: "vente",
  employee_id: "employee123",
  employee_name: "Jean Dupont",
  service_item_id: "service456",
  service_name: "Essence",
  amount: 50.00,
  created_at: "2024-01-20T14:30:00.000Z"
}
```

## ✅ Tests recommandés
1. Créer quelques services via "Gestion des prix"
2. Tester prise de service d'un employé
3. Enregistrer une vente avec service prédéfini
4. Enregistrer une prestation "Autre" avec prix custom
5. Vérifier fin de service et calcul de durée
6. Contrôler l'intégration dans les transactions

## 🎨 Interface utilisateur
- **Onglets intuitifs** dans la comptabilité
- **Formulaires guidés** avec validation
- **Historique en temps réel**
- **Statistiques visuelles**
- **Responsive design** mobile/desktop

Le système est maintenant opérationnel ! 🎉 