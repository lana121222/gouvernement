import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { db, type Employee, type Transaction } from '@/lib/firebase'
import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  where 
} from 'firebase/firestore'

export const useAccountingStore = defineStore('accounting', () => {
  const employees = ref<Employee[]>([])
  const transactions = ref<Transaction[]>([])
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
    try {
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

      const updatedData = { 
        ...updates, 
        updated_at: new Date().toISOString() 
      }
      
      await updateDoc(doc(db, 'employees', id), updatedData)
      
      const index = employees.value.findIndex(emp => emp.id === id)
      if (index !== -1) {
        employees.value[index] = { ...employees.value[index], ...updatedData }
      }
    } catch (err: any) {
      error.value = err.message
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

  return {
    employees,
    transactions,
    loading,
    error,
    activeEmployees,
    formerEmployees,
    totalIncome,
    totalExpenses,
    balance,
    totalPayroll,
    fetchEmployees,
    addEmployee,
    updateEmployee,
    payEmployee,
    moveToFormer,
    deleteEmployee,
    fetchTransactions,
    addTransaction,
    deleteTransaction,
    resetAccounting
  }
}) 