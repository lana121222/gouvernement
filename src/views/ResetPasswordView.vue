<template>
  <AppLayout>
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <!-- En-tête -->
        <div class="text-center">
          <div class="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-orange-100">
            <svg class="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-3c0-.265.105-.52.293-.707L10.293 9.293A1 1 0 0111 9h2a6 6 0 015.707-3.707z"></path>
            </svg>
          </div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            🔐 Réinitialiser votre mot de passe
          </h2>
          <p class="mt-2 text-center text-sm text-gray-600">
            Entrez votre adresse email pour recevoir un lien de réinitialisation
          </p>
        </div>

        <!-- Formulaire de réinitialisation -->
        <div v-if="!emailSent" class="mt-8 space-y-6">
          <form @submit.prevent="handleResetPassword" class="space-y-6">
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                Adresse email
              </label>
              <input
                id="email"
                v-model="form.email"
                name="email"
                type="email"
                autocomplete="email"
                required
                class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="votre@email.com"
              />
              <p class="mt-1 text-xs text-gray-500">
                L'email doit correspondre à votre compte existant
              </p>
            </div>

            <div>
              <button
                type="submit"
                :disabled="loading || !form.email"
                class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span class="absolute left-0 inset-y-0 flex items-center pl-3">
                  <svg v-if="!loading" class="h-5 w-5 text-orange-500 group-hover:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                  <div v-else class="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500"></div>
                </span>
                {{ loading ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation' }}
              </button>
            </div>
          </form>

          <!-- Liens de retour -->
          <div class="text-center space-y-2">
            <router-link 
              to="/login" 
              class="text-sm text-gray-600 hover:text-gray-500"
            >
              ← Retour à la connexion
            </router-link>
          </div>
        </div>

        <!-- Confirmation d'envoi -->
        <div v-else class="mt-8 space-y-6">
          <div class="text-center">
            <div class="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-green-100 mb-4">
              <svg class="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">
              ✅ Email envoyé !
            </h3>
            <p class="text-sm text-gray-600 mb-4">
              Nous avons envoyé un lien de réinitialisation à :
            </p>
            <p class="text-sm font-medium text-gray-900 bg-gray-50 px-3 py-2 rounded-md mb-6">
              {{ form.email }}
            </p>
          </div>

          <!-- Instructions détaillées -->
          <div class="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div class="flex">
              <svg class="h-5 w-5 text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-blue-800">
                  Instructions
                </h3>
                <div class="mt-2 text-sm text-blue-700">
                  <ol class="list-decimal list-inside space-y-1">
                    <li>Vérifiez votre boîte de réception (et spam/indésirables)</li>
                    <li>Cliquez sur le lien dans l'email reçu</li>
                    <li>Suivez les instructions pour créer un nouveau mot de passe</li>
                    <li>Reconnectez-vous avec votre nouveau mot de passe</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>

          <!-- Actions après envoi -->
          <div class="space-y-3">
            <button
              @click="handleResendEmail"
              :disabled="loading || cooldownActive"
              class="w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="!cooldownActive">
                📧 Renvoyer l'email
              </span>
              <span v-else>
                ⏱️ Attendre {{ cooldownTime }}s avant de renvoyer
              </span>
            </button>

            <div class="text-center space-y-2">
              <router-link 
                to="/login" 
                class="block text-sm text-primary-600 hover:text-primary-500"
              >
                ← Retour à la connexion
              </router-link>
              <button
                @click="resetForm"
                class="block w-full text-sm text-gray-600 hover:text-gray-500"
              >
                Utiliser une autre adresse email
              </button>
            </div>
          </div>
        </div>

        <!-- Aide et support -->
        <div class="bg-gray-50 border border-gray-200 rounded-md p-4">
          <div class="flex">
            <svg class="h-5 w-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-gray-800">
                Besoin d'aide ?
              </h3>
              <div class="mt-2 text-sm text-gray-600">
                <p>• Vérifiez que l'email existe dans notre système</p>
                <p>• L'email peut prendre quelques minutes à arriver</p>
                <p>• Contactez un administrateur si le problème persiste</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '@/stores/notifications'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import AppLayout from '@/components/AppLayout.vue'

const router = useRouter()
const notificationStore = useNotificationStore()

const loading = ref(false)
const emailSent = ref(false)
const cooldownActive = ref(false)
const cooldownTime = ref(0)

const form = ref({
  email: ''
})

let cooldownInterval: number | null = null

// Gérer la réinitialisation de mot de passe
const handleResetPassword = async () => {
  if (!form.value.email.trim()) {
    notificationStore.warning('Email requis', 'Veuillez entrer votre adresse email.')
    return
  }

  loading.value = true

  try {
    console.log('Envoi de l\'email de réinitialisation à:', form.value.email)
    
    await sendPasswordResetEmail(auth, form.value.email.trim())

    console.log('Email de réinitialisation envoyé avec succès')
    
    emailSent.value = true
    startCooldown()

    notificationStore.success(
      'Email envoyé !',
      `Un lien de réinitialisation a été envoyé à ${form.value.email}`
    )

  } catch (error: any) {
    console.error('Erreur lors de l\'envoi de l\'email:', error)
    
    let errorMessage = 'Une erreur est survenue lors de l\'envoi de l\'email.'
    
    switch (error.code) {
      case 'auth/user-not-found':
        errorMessage = 'Aucun compte trouvé avec cette adresse email.'
        break
      case 'auth/invalid-email':
        errorMessage = 'Adresse email invalide.'
        break
      case 'auth/too-many-requests':
        errorMessage = 'Trop de demandes. Veuillez patienter avant de réessayer.'
        break
      case 'auth/network-request-failed':
        errorMessage = 'Erreur de connexion. Vérifiez votre connexion internet.'
        break
    }

    notificationStore.error('Erreur d\'envoi', errorMessage)
  } finally {
    loading.value = false
  }
}

// Renvoyer l'email (avec cooldown)
const handleResendEmail = async () => {
  if (cooldownActive.value) return
  
  await handleResetPassword()
}

// Démarrer le cooldown de 60 secondes
const startCooldown = () => {
  cooldownActive.value = true
  cooldownTime.value = 60

  cooldownInterval = setInterval(() => {
    cooldownTime.value--
    
    if (cooldownTime.value <= 0) {
      cooldownActive.value = false
      if (cooldownInterval) {
        clearInterval(cooldownInterval)
        cooldownInterval = null
      }
    }
  }, 1000)
}

// Réinitialiser le formulaire
const resetForm = () => {
  emailSent.value = false
  form.value.email = ''
  
  if (cooldownInterval) {
    clearInterval(cooldownInterval)
    cooldownInterval = null
  }
  cooldownActive.value = false
  cooldownTime.value = 0
}

// Nettoyer les intervals à la destruction du composant
onBeforeUnmount(() => {
  if (cooldownInterval) {
    clearInterval(cooldownInterval)
  }
})
</script> 