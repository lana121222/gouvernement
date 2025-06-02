import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase, type Employee, type Transaction } from '@/lib/supabase'

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
      const { data, error: fetchError } = await supabase
        .from('employees')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (fetchError) throw fetchError
      employees.value = data || []
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  async function addEmployee(employeeData: Omit<Employee, 'id' | 'created_at' | 'updated_at'>) {
    loading.value = true
    try {
      const { data, error: insertError } = await supabase
        .from('employees')
        .insert([{
          ...employeeData,
          total_earnings: (employeeData.hours_worked * employeeData.hourly_rate) + employeeData.bonus_amount
        }])
        .select()
        .single()
      
      if (insertError) throw insertError
      employees.value.unshift(data)
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

      const { data, error: updateError } = await supabase
        .from('employees')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      
      if (updateError) throw updateError
      
      const index = employees.value.findIndex(emp => emp.id === id)
      if (index !== -1) {
        employees.value[index] = data
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
      await supabase
        .from('transactions')
        .delete()
        .eq('employee_id', id)

      // Supprimer l'employé
      const { error: deleteError } = await supabase
        .from('employees')
        .delete()
        .eq('id', id)
      
      if (deleteError) throw deleteError
      
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
      const { data, error: fetchError } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (fetchError) throw fetchError
      transactions.value = data || []
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  async function addTransaction(transactionData: Omit<Transaction, 'id' | 'created_at'>) {
    loading.value = true
    try {
      const { data, error: insertError } = await supabase
        .from('transactions')
        .insert([transactionData])
        .select()
        .single()
      
      if (insertError) throw insertError
      transactions.value.unshift(data)
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  async function deleteTransaction(id: string) {
    loading.value = true
    try {
      const { error: deleteError } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
      
      if (deleteError) throw deleteError
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

      // Sauvegarder dans une table d'historique
      await supabase
        .from('accounting_backups')
        .insert([{
          backup_data: backupData,
          created_at: new Date().toISOString()
        }])

      // Supprimer toutes les transactions
      await supabase.from('transactions').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      
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