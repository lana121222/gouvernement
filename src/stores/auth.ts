import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase, type User } from '@/lib/supabase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isManager = computed(() => user.value?.role === 'manager' || user.value?.role === 'admin')
  const canAccessAccounting = computed(() => 
    user.value?.permissions.includes('accounting') || user.value?.role === 'admin'
  )

  async function signIn(email: string, password: string) {
    loading.value = true
    error.value = null
    
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (authError) throw authError
      
      if (data.user) {
        // Récupérer les informations utilisateur depuis la base de données
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single()
        
        if (userError) throw userError
        user.value = userData
      }
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  async function signOut() {
    loading.value = true
    try {
      await supabase.auth.signOut()
      user.value = null
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  async function checkAuth() {
    loading.value = true
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (authUser) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single()
        
        if (!userError) {
          user.value = userData
        }
      }
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    isManager,
    canAccessAccounting,
    signIn,
    signOut,
    checkAuth
  }
}) 