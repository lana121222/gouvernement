<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
      <div class="mt-3">
        <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
          {{ employee ? 'Modifier l\'employé' : 'Ajouter un employé' }}
        </h3>
        
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="first_name" class="block text-sm font-medium text-gray-700">Prénom</label>
              <input
                id="first_name"
                v-model="form.first_name"
                type="text"
                required
                class="input-field mt-1"
                placeholder="Prénom"
              />
            </div>
            <div>
              <label for="last_name" class="block text-sm font-medium text-gray-700">Nom</label>
              <input
                id="last_name"
                v-model="form.last_name"
                type="text"
                required
                class="input-field mt-1"
                placeholder="Nom"
              />
            </div>
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              class="input-field mt-1"
              placeholder="email@exemple.com"
            />
          </div>

          <div>
            <label for="position" class="block text-sm font-medium text-gray-700">Poste</label>
            <input
              id="position"
              v-model="form.position"
              type="text"
              required
              class="input-field mt-1"
              placeholder="Poste occupé"
            />
          </div>

          <div>
            <label for="hourly_rate" class="block text-sm font-medium text-gray-700">Taux horaire ($)</label>
            <input
              id="hourly_rate"
              v-model.number="form.hourly_rate"
              type="number"
              min="0"
              step="0.01"
              required
              class="input-field mt-1"
              placeholder="0.00"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="hours_worked" class="block text-sm font-medium text-gray-700">Heures travaillées</label>
              <input
                id="hours_worked"
                v-model.number="form.hours_worked"
                type="number"
                min="0"
                step="0.5"
                class="input-field mt-1"
                placeholder="0"
              />
            </div>
            <div>
              <label for="bonus_amount" class="block text-sm font-medium text-gray-700">Prime ($)</label>
              <input
                id="bonus_amount"
                v-model.number="form.bonus_amount"
                type="number"
                min="0"
                step="0.01"
                class="input-field mt-1"
                placeholder="0.00"
              />
            </div>
          </div>

          <div class="bg-gray-50 p-3 rounded-md">
            <div class="text-sm text-gray-600">
              <strong>Total à payer: ${{ formatCurrency(totalEarnings) }}</strong>
            </div>
          </div>

          <div class="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              @click="$emit('close')"
              class="btn-secondary"
            >
              Annuler
            </button>
            <button
              type="submit"
              :disabled="loading"
              class="btn-primary disabled:opacity-50"
            >
              {{ loading ? 'Enregistrement...' : (employee ? 'Modifier' : 'Ajouter') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Employee } from '@/lib/firebase'

interface Props {
  employee?: Employee | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  save: [data: Omit<Employee, 'id' | 'created_at' | 'updated_at'> | Partial<Employee>]
}>()

const loading = ref(false)

const form = ref({
  first_name: '',
  last_name: '',
  email: '',
  position: '',
  hourly_rate: 0,
  hours_worked: 0,
  bonus_amount: 0,
  is_active: true,
  is_former: false,
  is_blacklisted: false
})

const totalEarnings = computed(() => {
  return (form.value.hours_worked * form.value.hourly_rate) + form.value.bonus_amount
})

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

const handleSubmit = async () => {
  loading.value = true
  try {
    const data = {
      ...form.value,
      total_earnings: totalEarnings.value
    }
    
    emit('save', data)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (props.employee) {
    form.value = {
      first_name: props.employee.first_name,
      last_name: props.employee.last_name,
      email: props.employee.email,
      position: props.employee.position,
      hourly_rate: props.employee.hourly_rate,
      hours_worked: props.employee.hours_worked,
      bonus_amount: props.employee.bonus_amount,
      is_active: props.employee.is_active,
      is_former: props.employee.is_former,
      is_blacklisted: props.employee.is_blacklisted
    }
  }
})
</script> 