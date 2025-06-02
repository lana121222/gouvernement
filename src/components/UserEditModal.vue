<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
      <div class="mt-3">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900">
            Modifier l'utilisateur
          </h3>
          <button
            @click="$emit('close')"
            class="text-gray-400 hover:text-gray-600"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div class="mb-4">
          <div class="flex items-center mb-3">
            <div class="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center mr-3">
              <span class="text-lg font-medium text-primary-600">
                {{ user?.email.charAt(0).toUpperCase() }}
              </span>
            </div>
            <div>
              <div class="text-sm font-medium text-gray-900">{{ user?.email }}</div>
              <div class="text-xs text-gray-500">ID: {{ user?.id.substring(0, 12) }}...</div>
            </div>
          </div>
        </div>

        <form @submit.prevent="handleSubmit">
          <!-- Sélection du rôle -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Rôle
            </label>
            <select
              v-model="formData.role"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            >
              <option value="viewer">Viewer (Lecture seule)</option>
              <option value="employee">Employé (Comptabilité)</option>
              <option value="manager">Manager (Gestion + Comptabilité)</option>
              <option value="admin">Administrateur (Accès complet)</option>
            </select>
          </div>

          <!-- Permissions personnalisées -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Permissions spécifiques
            </label>
            <div class="space-y-2">
              <label 
                v-for="permission in availablePermissions" 
                :key="permission.key"
                class="flex items-center"
              >
                <input
                  type="checkbox"
                  :value="permission.key"
                  v-model="formData.permissions"
                  class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                >
                <span class="ml-2 text-sm text-gray-700">{{ permission.label }}</span>
              </label>
            </div>
            <p class="text-xs text-gray-500 mt-2">
              Les permissions sont automatiquement définies selon le rôle, mais vous pouvez les personnaliser.
            </p>
          </div>

          <!-- Aperçu des permissions -->
          <div class="mb-6 p-3 bg-gray-50 rounded-md">
            <h4 class="text-sm font-medium text-gray-700 mb-2">Aperçu des permissions :</h4>
            <div class="flex flex-wrap gap-1">
              <span 
                v-for="permission in formData.permissions" 
                :key="permission"
                class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800"
              >
                {{ getPermissionLabel(permission) }}
              </span>
              <span v-if="formData.permissions.length === 0" class="text-xs text-gray-400 italic">
                Aucune permission
              </span>
            </div>
          </div>

          <!-- Boutons d'action -->
          <div class="flex justify-end space-x-3">
            <button
              type="button"
              @click="$emit('close')"
              class="btn-secondary"
            >
              Annuler
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="btn-primary"
            >
              <span v-if="saving">Sauvegarde...</span>
              <span v-else>Sauvegarder</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import type { User } from '@/lib/firebase'

interface Props {
  user: User | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  save: [userData: Partial<User>]
}>()

const saving = ref(false)

const availablePermissions = [
  { key: 'read_users', label: 'Voir les utilisateurs' },
  { key: 'manage_users', label: 'Gérer les utilisateurs' },
  { key: 'read_accounting', label: 'Voir la comptabilité' },
  { key: 'write_accounting', label: 'Modifier la comptabilité' },
  { key: 'manage_employees', label: 'Gérer les employés' },
  { key: 'view_reports', label: 'Voir les rapports' },
  { key: 'system_admin', label: 'Administration système' }
]

const formData = reactive({
  role: props.user?.role || 'viewer',
  permissions: [...(props.user?.permissions || [])]
})

// Définir les permissions par défaut selon le rôle
const getDefaultPermissions = (role: string): string[] => {
  switch (role) {
    case 'admin':
      return ['read_users', 'manage_users', 'read_accounting', 'write_accounting', 'manage_employees', 'view_reports', 'system_admin']
    case 'manager':
      return ['read_users', 'read_accounting', 'write_accounting', 'manage_employees', 'view_reports']
    case 'employee':
      return ['read_accounting', 'write_accounting']
    case 'viewer':
    default:
      return ['read_users']
  }
}

const getPermissionLabel = (key: string): string => {
  return availablePermissions.find(p => p.key === key)?.label || key
}

// Mettre à jour les permissions quand le rôle change
watch(() => formData.role, (newRole) => {
  formData.permissions = getDefaultPermissions(newRole)
})

const handleSubmit = async () => {
  if (!props.user) return
  
  saving.value = true
  try {
    await emit('save', {
      role: formData.role,
      permissions: formData.permissions
    })
  } finally {
    saving.value = false
  }
}
</script> 