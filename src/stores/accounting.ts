import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { db, type Employee, type Transaction, type ServiceItem, type ServiceTransaction } from '@/lib/firebase'
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
      if (updates.hours_worked !== undefined || updates.hourly_rate !== undefined || updates.bonus_amount !== undefined) {
        const employee = employees.value.find(emp => emp.id === id)
        if (employee) {
          const hours = updates.hours_worked ?? employee.hours_worked
          const rate = updates.hourly_rate ?? employee.hourly_rate
          const bonus = updates.bonus_amount ?? employee.bonus_amount
          updates.total_earnings = (hours * rate) + bonus
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

    // Ajouter une transaction pour le paiement
    await addTransaction({
      type: 'expense',
      amount: employee.total_earnings,
      description: `Salaire - ${employee.first_name} ${employee.last_name}`,
      category: 'Salaire',
      employee_id: id
    })

    // Remettre à zéro les heures et bonus
    await updateEmployee(id, {
      hours_worked: 0,
      bonus_amount: 0,
      total_earnings: 0
    })
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
    try {
      const q = query(collection(db, 'serviceItems'), orderBy('category'), orderBy('name'))
      const querySnapshot = await getDocs(q)
      
      serviceItems.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ServiceItem[]
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  // Ajouter un service/prestation
  async function addServiceItem(itemData: Omit<ServiceItem, 'id' | 'created_at' | 'updated_at'>) {
    loading.value = true
    try {
      const newItem = {
        ...itemData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      const docRef = await addDoc(collection(db, 'serviceItems'), newItem)
      const itemWithId = { id: docRef.id, ...newItem }
      serviceItems.value.push(itemWithId)
      
      // Trier après ajout
      serviceItems.value.sort((a, b) => {
        if (a.category !== b.category) {
          return a.category.localeCompare(b.category)
        }
        return a.name.localeCompare(b.name)
      })
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
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
    try {
      const serviceTransaction = {
        type: type,
        employee_id: employeeId,
        employee_name: employeeName,
        service_item_id: serviceItemId,
        service_name: serviceName,
        amount: amount,
        custom_description: customDescription,
        created_at: new Date().toISOString()
      }
      
      const docRef = await addDoc(collection(db, 'serviceTransactions'), serviceTransaction)
      serviceTransactions.value.unshift({ id: docRef.id, ...serviceTransaction })
      
      // Ajouter aussi comme transaction revenue
      await addTransaction({
        type: 'income',
        amount: amount,
        description: `${type === 'vente' ? 'Vente' : 'Prestation'}: ${serviceName} (${employeeName})`,
        category: type === 'vente' ? 'Ventes' : 'Prestations',
        employee_id: employeeId
      })
      
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  // Vérifier si un employé est en service
  function isEmployeeOnDuty(employeeId: string): boolean {
    return activeShifts.value.has(employeeId)
  }

  // Obtenir la durée du service actuel
  function getCurrentShiftDuration(employeeId: string): number {
    const startTime = activeShifts.value.get(employeeId)
    if (!startTime) return 0
    
    return Math.round((new Date().getTime() - startTime.getTime()) / (1000 * 60))
  }

  // Services par catégorie
  const servicesByCategory = computed(() => {
    const grouped: Record<string, ServiceItem[]> = {}
    
    serviceItems.value.forEach(item => {
      if (!grouped[item.category]) {
        grouped[item.category] = []
      }
      grouped[item.category].push(item)
    })
    
    return grouped
  })

  // Fonctions d'initialisation mise à jour
  async function initializeServiceStore() {
    await Promise.all([
      fetchServiceItems(),
      fetchServiceTransactions()
    ])
    
    // Reconstruire les services actifs basés sur l'historique
    reconstructActiveShifts()
  }

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

  return {
    employees,
    transactions,
    serviceItems,
    serviceTransactions,
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
    isEmployeeOnDuty,
    getCurrentShiftDuration,
    initializeServiceStore
  }
}) 