import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { db, type Employee, type Transaction, type ServiceItem, type ServiceTransaction, type BonusConfig } from '@/lib/firebase'
import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  deleteField,
  query, 
  orderBy, 
  where 
} from 'firebase/firestore'

export const useAccountingStore = defineStore('accounting', () => {
  const employees = ref<Employee[]>([])
  const transactions = ref<Transaction[]>([])
  const serviceItems = ref<ServiceItem[]>([])
  const serviceTransactions = ref<ServiceTransaction[]>([])
  const bonusConfigs = ref<BonusConfig[]>([])
  const activeShifts = ref<Map<string, Date>>(new Map()) // employee_id -> start_time
  const loading = ref(false)
  const error = ref<string | null>(null)

  const activeEmployees = computed(() => 
    employees.value.filter(emp => emp.is_active && !emp.is_former)
  )
  
  const formerEmployees = computed(() => 
    employees.value.filter(emp => emp.is_former)
  )

  const totalIncome = computed(() => 
    transactions.value
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
  )

  const totalExpenses = computed(() => 
    transactions.value
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
  )

  const balance = computed(() => totalIncome.value - totalExpenses.value)

  const totalPayroll = computed(() => 
    activeEmployees.value.reduce((sum, emp) => sum + emp.total_earnings, 0)
  )

  // Gestion des employés
  async function fetchEmployees() {
    loading.value = true
    try {
      const q = query(collection(db, 'employees'), orderBy('created_at', 'desc'))
      const querySnapshot = await getDocs(q)
      
      employees.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Employee[]
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  async function addEmployee(employeeData: Omit<Employee, 'id' | 'created_at' | 'updated_at'>) {
    loading.value = true
    try {
      const newEmployee = {
        ...employeeData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        total_earnings: (employeeData.hours_worked * employeeData.hourly_rate) + employeeData.bonus_amount
      }
      
      const docRef = await addDoc(collection(db, 'employees'), newEmployee)
      const employeeWithId = { id: docRef.id, ...newEmployee }
      employees.value.unshift(employeeWithId)
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  async function updateEmployee(id: string, updates: Partial<Employee>) {
    loading.value = true
    error.value = null
    try {
      console.log('Mise à jour employé:', id, updates)
      
      // Recalculer les gains totaux si nécessaire
      if (updates.hours_worked !== undefined || updates.hourly_rate !== undefined || updates.bonus_amount !== undefined || updates.grade !== undefined) {
        const employee = employees.value.find(emp => emp.id === id)
        if (employee) {
          const hours = updates.hours_worked ?? employee.hours_worked
          const rate = updates.hourly_rate ?? employee.hourly_rate
          const manualBonus = updates.bonus_amount ?? employee.bonus_amount
          
          // Calculer les primes automatiques basées sur le grade (actuel ou nouveau)
          const grade = updates.grade ?? employee.grade
          const automaticBonuses = calculateEmployeeBonuses(id)
          
          // Total des gains = (heures × taux) + prime manuelle + primes automatiques
          updates.total_earnings = (hours * rate) + manualBonus + automaticBonuses.total
          
          console.log(`[UPDATE] Recalcul gains pour ${employee.first_name} ${employee.last_name}:`, {
            hours,
            rate,
            manualBonus,
            automaticBonuses: automaticBonuses.total,
            totalEarnings: updates.total_earnings
          })
        }
      }

      // Préparer les données en gérant les valeurs undefined
      const updatedData: any = { 
        updated_at: new Date().toISOString() 
      }

      // Ajouter seulement les champs qui ne sont pas undefined
      Object.keys(updates).forEach(key => {
        const value = updates[key as keyof Employee]
        if (value !== undefined) {
          updatedData[key] = value
        } else {
          // Pour les champs qui doivent être supprimés (undefined), utiliser deleteField
          if (key === 'termination_date' || key === 'termination_reason') {
            updatedData[key] = deleteField()
          }
        }
      })
      
      console.log('Données à mettre à jour:', updatedData)
      
      await updateDoc(doc(db, 'employees', id), updatedData)
      
      const index = employees.value.findIndex(emp => emp.id === id)
      if (index !== -1) {
        // Pour la mise à jour locale, on supprime les champs qui étaient undefined
        const localUpdate = { ...updates }
        if (updates.termination_date === undefined) {
          delete (employees.value[index] as any).termination_date
          delete localUpdate.termination_date
        }
        if (updates.termination_reason === undefined) {
          delete (employees.value[index] as any).termination_reason
          delete localUpdate.termination_reason
        }
        
        employees.value[index] = { 
          ...employees.value[index], 
          ...localUpdate,
          updated_at: new Date().toISOString()
        }
        console.log('Employé mis à jour localement:', employees.value[index])
      } else {
        console.warn('Employé non trouvé dans la liste locale:', id)
      }
      
      console.log('Mise à jour réussie!')
      
    } catch (err: any) {
      console.error('Erreur lors de la mise à jour:', err)
      error.value = err.message
      throw err // Relancer l'erreur pour que les composants puissent la gérer
    } finally {
      loading.value = false
    }
  }

  async function payEmployee(id: string) {
    const employee = employees.value.find(emp => emp.id === id)
    if (!employee) return

    // 1. Calculer les primes automatiques basées sur les ventes/prestations
    const automaticBonuses = calculateEmployeeBonuses(id)
    
    // 2. Calculer les gains de service actuels (si en service)
    let serviceEarnings = 0
    if (isEmployeeOnDuty(id)) {
      const totalSeconds = getCurrentShiftDurationInSeconds(id)
      const hours = totalSeconds / 3600 // Conversion en heures décimales
      serviceEarnings = hours * employee.hourly_rate
    }
    
    // 3. Calculer le total à payer
    const manualEarnings = employee.hours_worked * employee.hourly_rate
    const manualBonus = employee.bonus_amount
    const totalAutomaticBonuses = automaticBonuses.total
    const totalAmount = serviceEarnings + manualEarnings + manualBonus + totalAutomaticBonuses

    console.log(`[PAIEMENT] Détail pour ${employee.first_name} ${employee.last_name}:`, {
      serviceEarnings,
      manualEarnings,
      manualBonus,
      automaticBonuses: {
        sales: automaticBonuses.salesBonus,
        service: automaticBonuses.serviceBonus,
        total: totalAutomaticBonuses
      },
      totalAmount
    })

    // 4. Créer les transactions de paiement
    const transactions = []

    // Transaction principale (salaire + primes manuelles)
    const baseSalary = serviceEarnings + manualEarnings + manualBonus
    if (baseSalary > 0) {
      transactions.push({
        type: 'expense' as const,
        amount: baseSalary,
        description: `Salaire ${serviceEarnings > 0 ? '(service + heures)' : '(heures)'} - ${employee.first_name} ${employee.last_name}`,
        category: 'Salaire',
        employee_id: id
      })
    }

    // Transaction pour primes automatiques sur ventes
    if (automaticBonuses.salesBonus > 0) {
      transactions.push({
        type: 'expense' as const,
        amount: automaticBonuses.salesBonus,
        description: `Prime ventes (${formatGradeName(employee.grade || 'debutant')}) - ${employee.first_name} ${employee.last_name}`,
        category: 'Prime Ventes',
        employee_id: id
      })
    }

    // Transaction pour primes automatiques sur prestations
    if (automaticBonuses.serviceBonus > 0) {
      transactions.push({
        type: 'expense' as const,
        amount: automaticBonuses.serviceBonus,
        description: `Prime prestations (${formatGradeName(employee.grade || 'debutant')}) - ${employee.first_name} ${employee.last_name}`,
        category: 'Prime Prestations',
        employee_id: id
      })
    }

    // 5. Enregistrer toutes les transactions
    for (const transaction of transactions) {
      await addTransaction(transaction)
    }

    // 6. Terminer le service si l'employé est en service
    if (isEmployeeOnDuty(id)) {
      await endShift(id, `${employee.first_name} ${employee.last_name}`)
    }

    // 7. Remettre à zéro les heures et bonus manuels
    await updateEmployee(id, {
      hours_worked: 0,
      bonus_amount: 0,
      total_earnings: 0
    })

    console.log(`[PAIEMENT] ✅ Paiement effectué: ${transactions.length} transaction(s) pour un total de $${totalAmount.toFixed(2)}`)
  }

  // Fonction helper pour formater le nom du grade
  function formatGradeName(grade: string) {
    const names = {
      'debutant': 'Débutant',
      'junior': 'Junior', 
      'senior': 'Senior',
      'expert': 'Expert',
      'manager': 'Manager',
      'directeur': 'Directeur'
    }
    return names[grade as keyof typeof names] || 'Débutant'
  }

  async function moveToFormer(id: string, reason: string, isBlacklisted: boolean = false) {
    await updateEmployee(id, {
      is_active: false,
      is_former: true,
      termination_date: new Date().toISOString(),
      termination_reason: reason,
      is_blacklisted: isBlacklisted
    })
  }

  async function deleteEmployee(id: string) {
    loading.value = true
    try {
      // Supprimer toutes les transactions liées
      const q = query(collection(db, 'transactions'), where('employee_id', '==', id))
      const querySnapshot = await getDocs(q)
      
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref))
      await Promise.all(deletePromises)

      // Supprimer l'employé
      await deleteDoc(doc(db, 'employees', id))
      
      employees.value = employees.value.filter(emp => emp.id !== id)
      transactions.value = transactions.value.filter(t => t.employee_id !== id)
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  // Gestion des transactions
  async function fetchTransactions() {
    loading.value = true
    try {
      const q = query(collection(db, 'transactions'), orderBy('created_at', 'desc'))
      const querySnapshot = await getDocs(q)
      
      transactions.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Transaction[]
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  async function addTransaction(transactionData: Omit<Transaction, 'id' | 'created_at'>) {
    loading.value = true
    try {
      const newTransaction = {
        ...transactionData,
        created_at: new Date().toISOString()
      }
      
      const docRef = await addDoc(collection(db, 'transactions'), newTransaction)
      const transactionWithId = { id: docRef.id, ...newTransaction }
      transactions.value.unshift(transactionWithId)
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  async function deleteTransaction(id: string) {
    loading.value = true
    try {
      await deleteDoc(doc(db, 'transactions', id))
      transactions.value = transactions.value.filter(t => t.id !== id)
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  async function resetAccounting() {
    loading.value = true
    try {
      // Créer une sauvegarde avant de reset
      const backupData = {
        employees: employees.value,
        transactions: transactions.value,
        date: new Date().toISOString()
      }

      // Sauvegarder dans une collection d'historique
      await addDoc(collection(db, 'accounting_backups'), {
        backup_data: backupData,
        created_at: new Date().toISOString()
      })

      // Supprimer toutes les transactions
      const transactionsQuery = query(collection(db, 'transactions'))
      const transactionsSnapshot = await getDocs(transactionsQuery)
      
      const deletePromises = transactionsSnapshot.docs.map(doc => deleteDoc(doc.ref))
      await Promise.all(deletePromises)
      
      // Remettre à zéro les heures et gains des employés actifs
      for (const employee of activeEmployees.value) {
        await updateEmployee(employee.id, {
          hours_worked: 0,
          bonus_amount: 0,
          total_earnings: 0
        })
      }

      transactions.value = []
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  // Fonctions d'initialisation
  async function initializeStore() {
    await Promise.all([
      fetchEmployees(),
      fetchTransactions()
    ])
  }

  // === GESTION DES SERVICES ET PRESTATIONS ===
  
  // Charger les services/prestations
  async function fetchServiceItems() {
    loading.value = true
    console.log('[STORE] ========== DEBUT fetchServiceItems ==========')
    
    try {
      console.log('[STORE] Requête Firestore vers collection serviceItems...')
      // CORRECTION: Simplifier la requête pour éviter l'index composite
      const q = query(collection(db, 'serviceItems'), orderBy('created_at', 'desc'))
      const querySnapshot = await getDocs(q)
      
      console.log('[STORE] ✅ Requête réussie! Documents trouvés:', querySnapshot.docs.length)
      
      serviceItems.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ServiceItem[]
      
      // Trier côté client pour éviter l'index Firebase
      serviceItems.value.sort((a, b) => {
        if (a.category !== b.category) {
          return a.category.localeCompare(b.category)
        }
        return a.name.localeCompare(b.name)
      })
      
      console.log('[STORE] Services chargés et triés:', serviceItems.value.length)
      console.log('[STORE] Détail des services:', serviceItems.value.map(s => ({ id: s.id, name: s.name, category: s.category })))
      
    } catch (err: any) {
      console.error('[STORE] ❌ ERREUR dans fetchServiceItems:', err)
      console.error('[STORE] Code d\'erreur:', err.code)
      console.error('[STORE] Message d\'erreur:', err.message)
      error.value = err.message
    } finally {
      loading.value = false
      console.log('[STORE] ========== FIN fetchServiceItems ==========')
    }
  }

  // Ajouter un service/prestation
  async function addServiceItem(itemData: Omit<ServiceItem, 'id' | 'created_at' | 'updated_at'>) {
    loading.value = true
    console.log('[STORE] ========== DEBUT addServiceItem ==========')
    console.log('[STORE] Données reçues:', itemData)
    console.log('[STORE] Services actuels avant ajout:', serviceItems.value.length)
    
    try {
      // CORRECTION: Filtrer les valeurs undefined pour Firebase
      const newItem: any = {
        name: itemData.name,
        category: itemData.category,
        price: itemData.price,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      // Ajouter description seulement si elle n'est pas undefined ou vide
      if (itemData.description && itemData.description.trim()) {
        newItem.description = itemData.description.trim()
      }
      
      console.log('[STORE] Données à ajouter à Firebase (sans undefined):', newItem)
      console.log('[STORE] Tentative d\'ajout dans collection serviceItems...')
      
      const docRef = await addDoc(collection(db, 'serviceItems'), newItem)
      console.log('[STORE] ✅ Document ajouté avec succès! ID:', docRef.id)
      
      const itemWithId = { id: docRef.id, ...newItem }
      console.log('[STORE] Item avec ID généré:', itemWithId)
      
      console.log('[STORE] Ajout au tableau local...')
      serviceItems.value.push(itemWithId)
      console.log('[STORE] Services après ajout local:', serviceItems.value.length)
      
      // Trier après ajout
      console.log('[STORE] Tri des services...')
      serviceItems.value.sort((a, b) => {
        if (a.category !== b.category) {
          return a.category.localeCompare(b.category)
        }
        return a.name.localeCompare(b.name)
      })
      
      console.log('[STORE] ✅ Service ajouté et trié avec succès')
      console.log('[STORE] Services finaux:', serviceItems.value.map(s => ({ id: s.id, name: s.name, category: s.category })))
      
    } catch (err: any) {
      console.error('[STORE] ❌ ERREUR dans addServiceItem:', err)
      console.error('[STORE] Code d\'erreur:', err.code)
      console.error('[STORE] Message d\'erreur:', err.message)
      error.value = err.message
      throw err // Re-lancer l'erreur pour que le composant la détecte
    } finally {
      loading.value = false
      console.log('[STORE] ========== FIN addServiceItem ==========')
    }
  }

  // Modifier un service/prestation
  async function updateServiceItem(id: string, updates: Partial<ServiceItem>) {
    loading.value = true
    try {
      const updatedData = {
        ...updates,
        updated_at: new Date().toISOString()
      }
      
      await updateDoc(doc(db, 'serviceItems', id), updatedData)
      
      const index = serviceItems.value.findIndex(item => item.id === id)
      if (index !== -1) {
        serviceItems.value[index] = {
          ...serviceItems.value[index],
          ...updatedData
        }
      }
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  // Supprimer un service/prestation
  async function deleteServiceItem(id: string) {
    loading.value = true
    try {
      await deleteDoc(doc(db, 'serviceItems', id))
      serviceItems.value = serviceItems.value.filter(item => item.id !== id)
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  // Charger les transactions de service
  async function fetchServiceTransactions() {
    loading.value = true
    try {
      const q = query(collection(db, 'serviceTransactions'), orderBy('created_at', 'desc'))
      const querySnapshot = await getDocs(q)
      
      serviceTransactions.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ServiceTransaction[]
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  // Prise de service
  async function startShift(employeeId: string, employeeName: string) {
    loading.value = true
    console.log(`[STORE] Début startShift pour ${employeeName} (${employeeId})`)
    
    try {
      const now = new Date()
      const serviceTransaction = {
        type: 'prise_service' as const,
        employee_id: employeeId,
        employee_name: employeeName,
        service_name: 'Prise de service',
        amount: 0,
        created_at: now.toISOString()
      }
      
      console.log('[STORE] Création transaction Firebase...', serviceTransaction)
      const docRef = await addDoc(collection(db, 'serviceTransactions'), serviceTransaction)
      console.log('[STORE] Transaction créée avec ID:', docRef.id)
      
      serviceTransactions.value.unshift({ id: docRef.id, ...serviceTransaction })
      
      // Marquer comme en service
      activeShifts.value.set(employeeId, now)
      console.log(`[STORE] Employé ${employeeId} ajouté aux services actifs`)
      console.log('[STORE] Services actifs actuels:', Array.from(activeShifts.value.keys()))
      
    } catch (err: any) {
      console.error('[STORE] Erreur dans startShift:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Fin de service
  async function endShift(employeeId: string, employeeName: string) {
    loading.value = true
    console.log(`[STORE] Début endShift pour ${employeeName} (${employeeId})`)
    
    try {
      const startTime = activeShifts.value.get(employeeId)
      const endTime = new Date()
      const shiftDuration = startTime ? Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60)) : 0
      
      console.log(`[STORE] Durée calculée: ${shiftDuration} minutes`)
      
      // *** NOUVEAU: Convertir les heures de service et les ajouter à l'employé ***
      if (shiftDuration > 0 && startTime) {
        const employee = employees.value.find(emp => emp.id === employeeId)
        if (employee) {
          // Convertir les minutes en heures décimales
          const shiftHours = shiftDuration / 60
          const newTotalHours = employee.hours_worked + shiftHours
          
          // Calculer les nouveaux gains incluant les primes automatiques
          const automaticBonuses = calculateEmployeeBonuses(employeeId)
          const manualEarnings = newTotalHours * employee.hourly_rate
          const manualBonus = employee.bonus_amount
          const newTotalEarnings = manualEarnings + manualBonus + automaticBonuses.total
          
          console.log(`[STORE] Mise à jour employé ${employeeName}:`, {
            oldHours: employee.hours_worked,
            shiftHours,
            newTotalHours,
            manualEarnings,
            automaticBonuses: automaticBonuses.total,
            newTotalEarnings
          })
          
          // Mettre à jour l'employé avec les nouvelles heures et gains
          await updateEmployee(employeeId, {
            hours_worked: newTotalHours,
            total_earnings: newTotalEarnings
          })
        }
      }
      
      const serviceTransaction = {
        type: 'fin_service' as const,
        employee_id: employeeId,
        employee_name: employeeName,
        service_name: 'Fin de service',
        amount: 0,
        shift_duration: shiftDuration,
        created_at: endTime.toISOString()
      }
      
      console.log('[STORE] Création transaction Firebase...', serviceTransaction)
      const docRef = await addDoc(collection(db, 'serviceTransactions'), serviceTransaction)
      console.log('[STORE] Transaction créée avec ID:', docRef.id)
      
      serviceTransactions.value.unshift({ id: docRef.id, ...serviceTransaction })
      
      // Retirer du service actif
      activeShifts.value.delete(employeeId)
      console.log(`[STORE] Employé ${employeeId} retiré des services actifs`)
      console.log('[STORE] Services actifs actuels:', Array.from(activeShifts.value.keys()))
      
    } catch (err: any) {
      console.error('[STORE] Erreur dans endShift:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Ajouter une vente/prestation
  async function addServiceSale(
    employeeId: string, 
    employeeName: string, 
    serviceItemId: string | undefined, 
    serviceName: string, 
    amount: number, 
    type: 'vente' | 'prestation',
    customDescription?: string
  ) {
    loading.value = true
    console.log('[STORE] Début addServiceSale:', {
      employeeId,
      employeeName,
      serviceItemId,
      serviceName,
      amount,
      type,
      customDescription
    })
    
    try {
      // Filtrer les valeurs undefined avant d'envoyer à Firebase
      const serviceTransaction: any = {
        type: type,
        employee_id: employeeId,
        employee_name: employeeName,
        service_name: serviceName,
        amount: amount,
        created_at: new Date().toISOString()
      }
      
      // Ajouter conditionnellement les champs optionnels
      if (serviceItemId) {
        serviceTransaction.service_item_id = serviceItemId
      }
      if (customDescription) {
        serviceTransaction.custom_description = customDescription
      }
      
      console.log('[STORE] Données à envoyer à Firebase:', serviceTransaction)
      
      const docRef = await addDoc(collection(db, 'serviceTransactions'), serviceTransaction)
      console.log('[STORE] Transaction vente/prestation créée avec ID:', docRef.id)
      
      const newTransaction = { id: docRef.id, ...serviceTransaction }
      serviceTransactions.value.unshift(newTransaction)
      console.log('[STORE] Transaction ajoutée au store local, total transactions:', serviceTransactions.value.length)
      console.log('[STORE] Nouvelles transactions vente/prestation:', 
        serviceTransactions.value.filter(t => t.type === 'vente' || t.type === 'prestation').slice(0, 5)
      )
      
      // Ajouter aussi comme transaction revenue
      console.log('[STORE] Ajout de la transaction revenue...')
      await addTransaction({
        type: 'income',
        amount: amount,
        description: `${type === 'vente' ? 'Vente' : 'Prestation'}: ${serviceName} (${employeeName})`,
        category: type === 'vente' ? 'Ventes' : 'Prestations',
        employee_id: employeeId
      })
      console.log('[STORE] Transaction revenue ajoutée avec succès')
      
      // 🎯 NOUVEAU: Recalculer automatiquement les primes de l'employé
      console.log('[STORE] Recalcul des primes pour l\'employé...')
      await recalculateEmployeeBonuses(employeeId)
      console.log('[STORE] ✅ Primes recalculées automatiquement')
      
    } catch (err: any) {
      console.error('[STORE] Erreur dans addServiceSale:', err)
      error.value = err.message
      throw err // Important: propager l'erreur
    } finally {
      loading.value = false
    }
  }

  // 🎯 NOUVELLE FONCTION: Recalculer les primes d'un employé
  async function recalculateEmployeeBonuses(employeeId: string) {
    const employee = employees.value.find(emp => emp.id === employeeId)
    if (!employee) {
      console.warn(`[STORE] Employé ${employeeId} non trouvé pour recalcul primes`)
      return
    }

    // Calculer les nouvelles primes automatiques
    const newBonuses = calculateEmployeeBonuses(employeeId)
    
    console.log(`[STORE] Primes recalculées pour ${employee.first_name} ${employee.last_name}:`, {
      sales: newBonuses.salesBonus,
      service: newBonuses.serviceBonus,
      total: newBonuses.total
    })

    // Mettre à jour le total_earnings de l'employé (ce qui déclenchera le recalcul dans updateEmployee)
    const currentHours = employee.hours_worked
    const currentRate = employee.hourly_rate
    const currentManualBonus = employee.bonus_amount
    const newTotalEarnings = (currentHours * currentRate) + currentManualBonus + newBonuses.total

    // Mise à jour silencieuse (juste le total_earnings, sans déclencher de recalcul)
    const index = employees.value.findIndex(emp => emp.id === employeeId)
    if (index !== -1) {
      employees.value[index] = {
        ...employees.value[index],
        total_earnings: newTotalEarnings,
        updated_at: new Date().toISOString()
      }
    }

    console.log(`[STORE] ✅ total_earnings mis à jour: $${newTotalEarnings.toFixed(2)} (dont primes auto: $${newBonuses.total.toFixed(2)})`)
  }

  // Vérifier si un employé est en service
  function isEmployeeOnDuty(employeeId: string): boolean {
    return activeShifts.value.has(employeeId)
  }

  // Obtenir la durée du service actuel
  function getCurrentShiftDuration(employeeId: string): number {
    const startTime = activeShifts.value.get(employeeId)
    if (!startTime) return 0
    
    // Retourner les minutes avec plus de précision
    return Math.floor((new Date().getTime() - startTime.getTime()) / (1000 * 60))
  }

  // Obtenir la durée du service actuel en secondes (pour affichage temps réel)
  function getCurrentShiftDurationInSeconds(employeeId: string): number {
    const startTime = activeShifts.value.get(employeeId)
    if (!startTime) return 0
    
    return Math.floor((new Date().getTime() - startTime.getTime()) / 1000)
  }

  // Obtenir le nom complet d'un employé par son ID
  function getEmployeeName(employeeId: string): string {
    const employee = employees.value.find(emp => emp.id === employeeId)
    return employee ? `${employee.first_name} ${employee.last_name}` : 'Employé inconnu'
  }

  // Services par catégorie
  const servicesByCategory = computed(() => {
    console.log('[STORE] Calcul servicesByCategory, services disponibles:', serviceItems.value.length)
    const grouped: Record<string, ServiceItem[]> = {}
    
    serviceItems.value.forEach(item => {
      console.log('[STORE] Traitement service:', item.name, 'catégorie:', item.category)
      if (!grouped[item.category]) {
        grouped[item.category] = []
      }
      grouped[item.category].push(item)
    })
    
    console.log('[STORE] Résultat servicesByCategory:', Object.keys(grouped).map(cat => `${cat}: ${grouped[cat].length} items`))
    return grouped
  })

  // Reconstruire les services actifs basés sur l'historique
  function reconstructActiveShifts() {
    activeShifts.value.clear()
    
    // Grouper les transactions par employé
    const shiftsByEmployee = new Map<string, ServiceTransaction[]>()
    
    serviceTransactions.value
      .filter(t => t.type === 'prise_service' || t.type === 'fin_service')
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .forEach(transaction => {
        const employeeId = transaction.employee_id
        if (!shiftsByEmployee.has(employeeId)) {
          shiftsByEmployee.set(employeeId, [])
        }
        shiftsByEmployee.get(employeeId)!.push(transaction)
      })
    
    // Pour chaque employé, vérifier s'il est actuellement en service
    shiftsByEmployee.forEach((transactions, employeeId) => {
      let isOnDuty = false
      let lastStartTime: Date | null = null
      
      for (const transaction of transactions) {
        if (transaction.type === 'prise_service') {
          isOnDuty = true
          lastStartTime = new Date(transaction.created_at)
        } else if (transaction.type === 'fin_service') {
          isOnDuty = false
          lastStartTime = null
        }
      }
      
      // Si l'employé est en service, l'ajouter à activeShifts
      if (isOnDuty && lastStartTime) {
        activeShifts.value.set(employeeId, lastStartTime)
        console.log(`Employé ${employeeId} reconstruit comme en service depuis ${lastStartTime.toLocaleTimeString()}`)
      }
    })
    
    console.log(`Services actifs reconstruits: ${activeShifts.value.size} employé(s) en service`)
  }

  // Sauvegarder l'état des services actifs avant fermeture
  function saveActiveShiftsState() {
    const activeShiftsData = Array.from(activeShifts.value.entries()).map(([employeeId, startTime]) => ({
      employeeId,
      startTime: startTime.toISOString(),
      employeeName: employees.value.find(emp => emp.id === employeeId)?.first_name + ' ' + 
                    employees.value.find(emp => emp.id === employeeId)?.last_name || 'Employé inconnu'
    }))
    
    localStorage.setItem('activeShifts', JSON.stringify(activeShiftsData))
    console.log('[STORE] État des services sauvegardé:', activeShiftsData)
  }

  // Restaurer l'état des services actifs au démarrage
  function restoreActiveShiftsState() {
    try {
      const savedState = localStorage.getItem('activeShifts')
      if (savedState) {
        const activeShiftsData = JSON.parse(savedState)
        
        // Vérifier si les données ne sont pas trop anciennes (plus de 24h)
        const maxAge = 24 * 60 * 60 * 1000 // 24 heures en millisecondes
        const now = new Date().getTime()
        
        activeShiftsData.forEach((shift: any) => {
          const startTime = new Date(shift.startTime)
          const age = now - startTime.getTime()
          
          if (age < maxAge) {
            activeShifts.value.set(shift.employeeId, startTime)
            console.log(`[STORE] Service restauré pour ${shift.employeeName} depuis ${startTime.toLocaleTimeString()}`)
          } else {
            console.log(`[STORE] Service trop ancien ignoré pour ${shift.employeeName}`)
          }
        })
        
        // Nettoyer le localStorage après restauration
        localStorage.removeItem('activeShifts')
        console.log(`[STORE] ${activeShifts.value.size} service(s) restauré(s)`)
      }
    } catch (error) {
      console.error('[STORE] Erreur lors de la restauration des services:', error)
    }
  }

  // Terminer automatiquement tous les services actifs
  async function endAllActiveShifts() {
    console.log('[STORE] Terminaison automatique de tous les services actifs...')
    
    const shiftsToEnd = Array.from(activeShifts.value.entries())
    
    for (const [employeeId, startTime] of shiftsToEnd) {
      try {
        const employee = employees.value.find(emp => emp.id === employeeId)
        const employeeName = employee ? `${employee.first_name} ${employee.last_name}` : 'Employé inconnu'
        
        console.log(`[STORE] Terminaison automatique du service pour ${employeeName}`)
        await endShift(employeeId, employeeName)
      } catch (error) {
        console.error(`[STORE] Erreur lors de la terminaison automatique pour ${employeeId}:`, error)
      }
    }
    
    console.log('[STORE] Terminaison automatique terminée')
  }

  // Gérer les événements de fermeture du navigateur
  function setupAutoEndShifts() {
    // Événement beforeunload - sauvegarde avant fermeture
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (activeShifts.value.size > 0) {
        saveActiveShiftsState()
        
        // Optionnel: demander confirmation si des services sont actifs
        const message = `${activeShifts.value.size} employé(s) en service seront automatiquement mis hors service.`
        event.returnValue = message
        return message
      }
    }

    // Événement unload - terminaison automatique (ne fonctionne pas toujours)
    const handleUnload = () => {
      if (activeShifts.value.size > 0) {
        // Tentative de terminaison synchrone (limitée par les navigateurs)
        endAllActiveShifts()
      }
    }

    // Événement visibilitychange - gestion des onglets cachés
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && activeShifts.value.size > 0) {
        saveActiveShiftsState()
      }
    }

    // Enregistrer les événements
    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('unload', handleUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Retourner une fonction de nettoyage
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('unload', handleUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }

  // Fonctions d'initialisation mise à jour
  async function initializeServiceStore() {
    await Promise.all([
      fetchServiceItems(),
      fetchServiceTransactions()
    ])
    
    // D'abord restaurer l'état sauvegardé
    restoreActiveShiftsState()
    
    // Puis reconstruire basé sur l'historique (pour les nouveaux services)
    reconstructActiveShifts()
    
    // Configurer la gestion automatique des fermetures
    setupAutoEndShifts()
  }

  // === GESTION DES PRIMES ET GRADES ===
  
  // Charger les configurations de primes
  async function fetchBonusConfigs() {
    loading.value = true
    try {
      const q = query(collection(db, 'bonus_configs'), orderBy('created_at', 'desc'))
      const querySnapshot = await getDocs(q)
      
      bonusConfigs.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as BonusConfig[]
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  // Ajouter une configuration de prime
  async function addBonusConfig(configData: Omit<BonusConfig, 'id' | 'created_at' | 'updated_at'>) {
    loading.value = true
    try {
      const newConfig = {
        ...configData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      const docRef = await addDoc(collection(db, 'bonus_configs'), newConfig)
      bonusConfigs.value.unshift({ id: docRef.id, ...newConfig })
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Modifier une configuration de prime
  async function updateBonusConfig(id: string, updates: Partial<BonusConfig>) {
    loading.value = true
    try {
      const updatedData = {
        ...updates,
        updated_at: new Date().toISOString()
      }
      
      await updateDoc(doc(db, 'bonus_configs', id), updatedData)
      
      const index = bonusConfigs.value.findIndex(config => config.id === id)
      if (index !== -1) {
        bonusConfigs.value[index] = {
          ...bonusConfigs.value[index],
          ...updatedData
        }
      }
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Supprimer une configuration de prime
  async function deleteBonusConfig(id: string) {
    loading.value = true
    try {
      await deleteDoc(doc(db, 'bonus_configs', id))
      bonusConfigs.value = bonusConfigs.value.filter(config => config.id !== id)
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Calculer les primes d'un employé pour une période
  function calculateEmployeeBonuses(employeeId: string, startDate?: Date, endDate?: Date) {
    const employee = employees.value.find(emp => emp.id === employeeId)
    if (!employee || !employee.grade) return { salesBonus: 0, serviceBonus: 0, total: 0 }

    const config = bonusConfigs.value.find(c => c.grade === employee.grade && c.is_active)
    if (!config) return { salesBonus: 0, serviceBonus: 0, total: 0 }

    let filteredTransactions = serviceTransactions.value.filter(t => 
      t.employee_id === employeeId && 
      (t.type === 'vente' || t.type === 'prestation') &&
      t.amount >= config.min_amount_threshold
    )

    // Filtrer par date si spécifié
    if (startDate || endDate) {
      filteredTransactions = filteredTransactions.filter(t => {
        const transactionDate = new Date(t.created_at)
        if (startDate && transactionDate < startDate) return false
        if (endDate && transactionDate > endDate) return false
        return true
      })
    }

    const salesBonus = filteredTransactions
      .filter(t => t.type === 'vente')
      .reduce((total, t) => total + (t.amount * config.vente_percentage / 100), 0)

    const serviceBonus = filteredTransactions
      .filter(t => t.type === 'prestation')
      .reduce((total, t) => total + (t.amount * config.prestation_percentage / 100), 0)

    return {
      salesBonus,
      serviceBonus,
      total: salesBonus + serviceBonus
    }
  }

  // Migration: Ajouter un grade par défaut aux employés existants
  async function migrateEmployeeGrades() {
    console.log('[STORE] Migration des grades des employés...')
    
    const employeesWithoutGrade = employees.value.filter(emp => !emp.grade)
    console.log(`[STORE] ${employeesWithoutGrade.length} employés sans grade trouvés`)
    
    for (const employee of employeesWithoutGrade) {
      try {
        console.log(`[STORE] Attribution du grade 'debutant' à ${employee.first_name} ${employee.last_name}`)
        await updateEmployee(employee.id, { grade: 'debutant' })
      } catch (error) {
        console.error(`[STORE] Erreur lors de la migration du grade pour ${employee.id}:`, error)
      }
    }
    
    console.log('[STORE] Migration des grades terminée')
  }

  // Créer les configurations de primes par défaut
  async function createDefaultBonusConfigs() {
    console.log('[STORE] Création des configurations de primes par défaut...')
    
    const defaultConfigs = [
      {
        grade: 'debutant' as const,
        vente_percentage: 2,
        prestation_percentage: 1.5,
        min_amount_threshold: 50,
        is_active: true
      },
      {
        grade: 'junior' as const,
        vente_percentage: 3,
        prestation_percentage: 2,
        min_amount_threshold: 50,
        is_active: true
      },
      {
        grade: 'senior' as const,
        vente_percentage: 4,
        prestation_percentage: 3,
        min_amount_threshold: 30,
        is_active: true
      },
      {
        grade: 'expert' as const,
        vente_percentage: 5,
        prestation_percentage: 4,
        min_amount_threshold: 30,
        is_active: true
      },
      {
        grade: 'manager' as const,
        vente_percentage: 6,
        prestation_percentage: 5,
        min_amount_threshold: 20,
        is_active: true
      },
      {
        grade: 'directeur' as const,
        vente_percentage: 8,
        prestation_percentage: 6,
        min_amount_threshold: 10,
        is_active: true
      }
    ]

    try {
      // Créer les configurations par défaut si elles n'existent pas
      for (const config of defaultConfigs) {
        console.log('[STORE] Création config pour grade:', config.grade)
        
        // Vérifier si la config existe déjà
        const existingQuery = query(
          collection(db, 'bonus_configs'), 
          where('grade', '==', config.grade)
        )
        const existingDocs = await getDocs(existingQuery)
        
        if (existingDocs.empty) {
          const configData = {
            ...config,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
          
          await addDoc(collection(db, 'bonus_configs'), configData)
        }
      }
      
      // Recharger les configurations
      await fetchBonusConfigs()
      
    } catch (err: any) {
      console.error('[STORE] Erreur lors de la création des configs par défaut:', err)
      
      if (err.code === 'permission-denied') {
        console.warn('[STORE] ⚠️ Permissions insuffisantes pour créer les configurations de primes.')
        console.warn('[STORE] 📝 Veuillez configurer les règles Firebase Security Rules pour la collection "bonus_configs"')
        console.warn('[STORE] 🔗 Guide: Consultez GUIDE-REGLES-FIREBASE-PRIMES.md')
        
        // Ne pas bloquer l'application, juste afficher un avertissement
        error.value = 'Permissions insuffisantes pour initialiser les configurations de primes. Consultez le guide de configuration des règles Firebase.'
      } else {
        error.value = err.message
        throw err
      }
    }
  }

  // Initialisation complète avec migrations
  async function initializeBonusSystem() {
    console.log('[STORE] Initialisation du système de primes...')
    
    // 1. Charger les employés et configs existantes
    await Promise.all([
      fetchEmployees(),
      fetchBonusConfigs()
    ])
    
    // 2. Migrer les employés sans grade
    await migrateEmployeeGrades()
    
    // 3. Créer les configs par défaut si nécessaire
    await createDefaultBonusConfigs()
    
    console.log('[STORE] Système de primes initialisé')
  }

  // Réactiver un ancien employé
  async function reactivateEmployee(id: string) {
    loading.value = true
    try {
      await updateEmployee(id, {
        is_active: true,
        is_former: false,
        termination_date: undefined,
        termination_reason: undefined
      })
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Remettre à zéro les heures de tous les employés actifs
  async function resetAllHours() {
    loading.value = true
    try {
      for (const employee of activeEmployees.value) {
        await updateEmployee(employee.id, {
          hours_worked: 0,
          bonus_amount: 0
        })
      }
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    employees,
    transactions,
    serviceItems,
    serviceTransactions,
    bonusConfigs,
    activeShifts,
    loading,
    error,
    activeEmployees,
    formerEmployees,
    totalIncome,
    totalExpenses,
    balance,
    totalPayroll,
    servicesByCategory,
    fetchEmployees,
    addEmployee,
    updateEmployee,
    payEmployee,
    moveToFormer,
    deleteEmployee,
    fetchTransactions,
    addTransaction,
    deleteTransaction,
    resetAccounting,
    initializeStore,
    fetchServiceItems,
    addServiceItem,
    updateServiceItem,
    deleteServiceItem,
    fetchServiceTransactions,
    startShift,
    endShift,
    addServiceSale,
    recalculateEmployeeBonuses,
    isEmployeeOnDuty,
    getCurrentShiftDuration,
    getCurrentShiftDurationInSeconds,
    initializeServiceStore,
    endAllActiveShifts,
    saveActiveShiftsState,
    restoreActiveShiftsState,
    setupAutoEndShifts,
    getEmployeeName,
    fetchBonusConfigs,
    addBonusConfig,
    updateBonusConfig,
    deleteBonusConfig,
    calculateEmployeeBonuses,
    migrateEmployeeGrades,
    createDefaultBonusConfigs,
    initializeBonusSystem,
    reactivateEmployee,
    resetAllHours
  }
}) 