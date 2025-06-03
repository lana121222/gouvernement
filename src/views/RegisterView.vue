<template>
  <AppLayout>
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl w-full space-y-8">
        <!-- En-tête -->
        <div class="text-center">
          <h1 class="text-3xl font-bold text-gray-900">
            🏛️ Inscription Gouvernement RP
          </h1>
          <p class="mt-2 text-gray-600">
            Créez votre compte pour accéder aux services gouvernementaux
          </p>
        </div>

        <!-- Formulaire d'inscription -->
        <div class="bg-white shadow-lg rounded-lg p-8">
          <form @submit.prevent="handleRegister" class="space-y-8">
            
            <!-- === ÉTAPE 1: AUTHENTIFICATION === -->
            <div class="border-b border-gray-200 pb-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">
                🔐 Authentification
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label for="email" class="block text-sm font-medium text-gray-700">
                    Email <span class="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    v-model="formData.email"
                    type="email"
                    required
                    class="input-field mt-1"
                    placeholder="votre@email.com"
                  />
                </div>
                <div>
                  <label for="password" class="block text-sm font-medium text-gray-700">
                    Mot de passe <span class="text-red-500">*</span>
                  </label>
                  <input
                    id="password"
                    v-model="formData.password"
                    type="password"
                    required
                    minlength="6"
                    class="input-field mt-1"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <!-- === ÉTAPE 2: INFORMATIONS RP === -->
            <div class="border-b border-gray-200 pb-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">
                🧑‍💼 Informations personnelles RP
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label for="first_name" class="block text-sm font-medium text-gray-700">
                    Prénom RP <span class="text-red-500">*</span>
                  </label>
                  <input
                    id="first_name"
                    v-model="formData.first_name"
                    type="text"
                    required
                    class="input-field mt-1"
                    placeholder="Jean"
                  />
                </div>
                
                <div>
                  <label for="last_name" class="block text-sm font-medium text-gray-700">
                    Nom de famille RP <span class="text-red-500">*</span>
                  </label>
                  <input
                    id="last_name"
                    v-model="formData.last_name"
                    type="text"
                    required
                    class="input-field mt-1"
                    placeholder="Dupont"
                  />
                </div>
                
                <div>
                  <label for="phone_number" class="block text-sm font-medium text-gray-700">
                    Numéro de téléphone RP <span class="text-red-500">*</span>
                  </label>
                  <input
                    id="phone_number"
                    v-model="formData.phone_number"
                    type="tel"
                    required
                    class="input-field mt-1"
                    placeholder="555-0123"
                  />
                </div>
                
                <div>
                  <label for="birth_date" class="block text-sm font-medium text-gray-700">
                    Date de naissance RP <span class="text-red-500">*</span>
                  </label>
                  <input
                    id="birth_date"
                    v-model="formData.birth_date"
                    type="date"
                    required
                    class="input-field mt-1"
                  />
                </div>
                
                <div class="md:col-span-2">
                  <label for="postal_address" class="block text-sm font-medium text-gray-700">
                    Adresse postale RP <span class="text-red-500">*</span>
                  </label>
                  <textarea
                    id="postal_address"
                    v-model="formData.postal_address"
                    rows="3"
                    required
                    class="input-field mt-1"
                    placeholder="123 Rue de la République, Los Santos, San Andreas"
                  ></textarea>
                </div>
                
                <div>
                  <label for="discord_username" class="block text-sm font-medium text-gray-700">
                    Discord <span class="text-red-500">*</span>
                  </label>
                  <input
                    id="discord_username"
                    v-model="formData.discord_username"
                    type="text"
                    required
                    class="input-field mt-1"
                    placeholder="MonPseudo#1234"
                  />
                </div>
              </div>
            </div>

            <!-- === ÉTAPE 3: DOCUMENTS OFFICIELS === -->
            <div class="pb-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">
                📄 Documents officiels RP
              </h3>
              <p class="text-sm text-gray-600 mb-6">
                Veuillez uploader vos documents RP. Formats acceptés : Images (JPG, PNG) et PDF (max 5MB par fichier)
              </p>
              
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- Carte d'identité -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Carte d'identité <span class="text-red-500">*</span>
                  </label>
                  <div class="space-y-3">
                    <div v-if="formData.identity_card_url" class="relative">
                      <img 
                        :src="formData.identity_card_url" 
                        alt="Carte d'identité"
                        class="w-full h-32 object-cover rounded-lg border cursor-pointer hover:opacity-90 transition-opacity"
                        @click="openImageModal(formData.identity_card_url, 'Carte d\'identité')"
                      />
                      <button
                        type="button"
                        @click="removeDocument('identity_card')"
                        class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                      </button>
                    </div>
                    <input
                      ref="identityCardInput"
                      type="file"
                      accept="image/*,.pdf"
                      class="hidden"
                      @change="handleFileUpload('identity_card', $event)"
                    />
                    <button
                      type="button"
                      @click="triggerFileUpload('identity_card')"
                      class="w-full flex justify-center px-4 py-2 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 text-sm"
                    >
                      <div class="text-center">
                        <svg class="mx-auto h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                        </svg>
                        <span class="text-gray-600">
                          {{ formData.identity_card_url ? 'Changer' : 'Ajouter' }} carte d'identité
                        </span>
                      </div>
                    </button>
                  </div>
                </div>

                <!-- PPA (Port d'Arme) -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    PPA (Port d'Arme)
                  </label>
                  <div class="space-y-3">
                    <div v-if="formData.ppa_url" class="relative">
                      <img 
                        :src="formData.ppa_url" 
                        alt="PPA"
                        class="w-full h-32 object-cover rounded-lg border cursor-pointer hover:opacity-90 transition-opacity"
                        @click="openImageModal(formData.ppa_url, 'PPA (Port d\'Arme)')"
                      />
                      <button
                        type="button"
                        @click="removeDocument('ppa')"
                        class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                      </button>
                    </div>
                    <input
                      ref="ppaInput"
                      type="file"
                      accept="image/*,.pdf"
                      class="hidden"
                      @change="handleFileUpload('ppa', $event)"
                    />
                    <button
                      type="button"
                      @click="triggerFileUpload('ppa')"
                      class="w-full flex justify-center px-4 py-2 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 text-sm"
                    >
                      <div class="text-center">
                        <svg class="mx-auto h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                        </svg>
                        <span class="text-gray-600">
                          {{ formData.ppa_url ? 'Changer' : 'Ajouter' }} PPA
                        </span>
                      </div>
                    </button>
                  </div>
                </div>

                <!-- Permis de conduire -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Permis de conduire
                  </label>
                  <div class="space-y-3">
                    <div v-if="formData.driving_license_url" class="relative">
                      <img 
                        :src="formData.driving_license_url" 
                        alt="Permis de conduire"
                        class="w-full h-32 object-cover rounded-lg border cursor-pointer hover:opacity-90 transition-opacity"
                        @click="openImageModal(formData.driving_license_url, 'Permis de conduire')"
                      />
                      <button
                        type="button"
                        @click="removeDocument('driving_license')"
                        class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                      </button>
                    </div>
                    <input
                      ref="drivingLicenseInput"
                      type="file"
                      accept="image/*,.pdf"
                      class="hidden"
                      @change="handleFileUpload('driving_license', $event)"
                    />
                    <button
                      type="button"
                      @click="triggerFileUpload('driving_license')"
                      class="w-full flex justify-center px-4 py-2 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 text-sm"
                    >
                      <div class="text-center">
                        <svg class="mx-auto h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                        </svg>
                        <span class="text-gray-600">
                          {{ formData.driving_license_url ? 'Changer' : 'Ajouter' }} permis
                        </span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Boutons d'action -->
            <div class="flex justify-between items-center pt-6 border-t border-gray-200">
              <router-link 
                to="/login" 
                class="text-sm text-gray-600 hover:text-gray-500"
              >
                ← Retour à la connexion
              </router-link>
              
              <div class="flex space-x-3">
                <router-link to="/login" class="btn-secondary">
                  Annuler
                </router-link>
                <button
                  type="submit"
                  :disabled="loading || !isFormValid"
                  class="btn-primary disabled:opacity-50"
                >
                  {{ loading ? 'Création du compte...' : 'Créer mon compte RP' }}
                </button>
              </div>
            </div>
          </form>
        </div>

        <!-- Informations d'aide -->
        <div class="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div class="flex">
            <svg class="h-5 w-5 text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-blue-800">
                Informations importantes
              </h3>
              <div class="mt-2 text-sm text-blue-700">
                <ul class="space-y-1">
                  <li>• Toutes ces informations sont fictives et destinées au roleplay uniquement</li>
                  <li>• Utilisez des adresses et numéros fictifs (ex: Los Santos, San Andreas)</li>
                  <li>• Les documents uploadés doivent être des créations RP, pas de vrais documents</li>
                  <li>• Votre Discord peut être réel pour les communications OOC</li>
                  <li>• La carte d'identité est obligatoire pour l'inscription</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal d'affichage d'image -->
      <div v-if="showImageModal" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" @click="closeImageModal">
        <div class="relative max-w-4xl max-h-[90vh] m-4">
          <button
            @click="closeImageModal"
            class="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 z-10"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
          <img 
            :src="modalImage.url" 
            :alt="modalImage.title"
            class="max-w-full max-h-full object-contain rounded-lg"
            @click.stop
          />
          <div class="absolute bottom-4 left-4 right-4 text-center">
            <p class="text-white bg-black bg-opacity-50 rounded px-3 py-1 inline-block">
              {{ modalImage.title }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notifications'
import { db, type UserProfile } from '@/lib/firebase'
import { doc, setDoc } from 'firebase/firestore'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import AppLayout from '@/components/AppLayout.vue'

const router = useRouter()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

const loading = ref(false)
const showImageModal = ref(false)
const modalImage = ref({ url: '', title: '' })

// Refs pour les inputs de fichiers
const identityCardInput = ref<HTMLInputElement>()
const ppaInput = ref<HTMLInputElement>()
const drivingLicenseInput = ref<HTMLInputElement>()

// Données du formulaire
const formData = ref({
  // Authentification
  email: '',
  password: '',
  
  // Informations RP
  first_name: '',
  last_name: '',
  phone_number: '',
  birth_date: '',
  postal_address: '',
  discord_username: '',
  
  // Documents
  identity_card_url: '',
  ppa_url: '',
  driving_license_url: ''
})

// Validation du formulaire
const isFormValid = computed(() => {
  return formData.value.email &&
         formData.value.password &&
         formData.value.first_name &&
         formData.value.last_name &&
         formData.value.phone_number &&
         formData.value.birth_date &&
         formData.value.postal_address &&
         formData.value.discord_username &&
         formData.value.identity_card_url // Carte d'identité obligatoire
})

// Fonction pour déclencher l'upload de fichiers
const triggerFileUpload = (inputType: string) => {
  switch (inputType) {
    case 'identity_card':
      identityCardInput.value?.click()
      break
    case 'ppa':
      ppaInput.value?.click()
      break
    case 'driving_license':
      drivingLicenseInput.value?.click()
      break
  }
}

// Fonction pour compresser une image (réutilisée de ProfileView)
const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      const maxWidth = 800
      const maxHeight = 600
      let { width, height } = img
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height
        height = maxHeight
      }
      
      canvas.width = width
      canvas.height = height
      ctx?.drawImage(img, 0, 0, width, height)
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const reader = new FileReader()
            reader.onload = (e) => resolve(e.target?.result as string)
            reader.onerror = reject
            reader.readAsDataURL(blob)
          } else {
            reject(new Error('Erreur de compression'))
          }
        },
        'image/jpeg',
        0.7
      )
    }
    
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

// Gérer l'upload de fichiers avec compression
const handleFileUpload = async (documentType: string, event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file) {
    try {
      // Vérifier la taille du fichier (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        notificationStore.warning(
          'Fichier trop volumineux',
          'Veuillez choisir un fichier de moins de 5MB.'
        )
        return
      }

      console.log(`Traitement du fichier ${file.name}...`)
      
      let fileDataUrl: string
      
      if (file.type === 'application/pdf') {
        const reader = new FileReader()
        fileDataUrl = await new Promise((resolve, reject) => {
          reader.onload = (e) => resolve(e.target?.result as string)
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
      } else if (file.type.startsWith('image/')) {
        fileDataUrl = await compressImage(file)
      } else {
        notificationStore.warning(
          'Format non supporté',
          'Veuillez choisir une image (JPG, PNG) ou un fichier PDF.'
        )
        return
      }
      
      // Vérifier la taille après traitement
      const sizeInBytes = fileDataUrl.length * 0.75
      if (sizeInBytes > 1000000) {
        notificationStore.warning(
          'Fichier encore trop volumineux',
          'Le fichier est encore trop volumineux après traitement. Veuillez choisir un fichier plus petit.'
        )
        return
      }
      
      // Assigner à la bonne propriété
      switch (documentType) {
        case 'identity_card':
          formData.value.identity_card_url = fileDataUrl
          break
        case 'ppa':
          formData.value.ppa_url = fileDataUrl
          break
        case 'driving_license':
          formData.value.driving_license_url = fileDataUrl
          break
      }
      
      console.log(`Fichier ${file.name} traité avec succès`)
      
    } catch (error) {
      console.error('Erreur lors du traitement du fichier:', error)
      notificationStore.error(
        'Erreur de traitement',
        'Erreur lors du traitement du fichier. Veuillez réessayer.'
      )
    }
  }
}

// Supprimer un document
const removeDocument = (documentType: string) => {
  switch (documentType) {
    case 'identity_card':
      formData.value.identity_card_url = ''
      break
    case 'ppa':
      formData.value.ppa_url = ''
      break
    case 'driving_license':
      formData.value.driving_license_url = ''
      break
  }
}

// Ouvrir le modal d'image
const openImageModal = (imageUrl: string, title: string) => {
  modalImage.value = { url: imageUrl, title }
  showImageModal.value = true
}

// Fermer le modal d'image
const closeImageModal = () => {
  showImageModal.value = false
  modalImage.value = { url: '', title: '' }
}

// Gérer l'inscription
const handleRegister = async () => {
  if (!isFormValid.value) {
    notificationStore.warning('Formulaire incomplet', 'Veuillez remplir tous les champs obligatoires.')
    return
  }

  loading.value = true
  
  try {
    // 1. Créer le compte Firebase Auth
    console.log('Création du compte Firebase Auth...')
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      formData.value.email, 
      formData.value.password
    )
    
    const user = userCredential.user
    console.log('Compte créé avec UID:', user.uid)

    // 2. Créer le profil utilisateur avec toutes les informations RP
    console.log('Création du profil utilisateur...')
    const profileData: UserProfile = {
      id: user.uid,
      user_id: user.uid,
      first_name: formData.value.first_name,
      last_name: formData.value.last_name,
      phone_number: formData.value.phone_number,
      birth_date: formData.value.birth_date,
      postal_address: formData.value.postal_address,
      discord_username: formData.value.discord_username,
      identity_card_url: formData.value.identity_card_url,
      ppa_url: formData.value.ppa_url,
      driving_license_url: formData.value.driving_license_url,
      other_documents: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // 3. Sauvegarder le profil dans Firestore
    await setDoc(doc(db, 'profiles', user.uid), profileData)
    console.log('Profil sauvegardé dans Firestore')

    // 4. Créer l'entrée utilisateur pour les permissions
    await setDoc(doc(db, 'users', user.uid), {
      id: user.uid,
      email: formData.value.email,
      role: 'employee', // Rôle par défaut
      permissions: [], // Aucune permission spéciale par défaut
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    console.log('Entrée utilisateur créée')

    // 5. Connecter automatiquement l'utilisateur
    await authStore.checkAuth()

    // 6. Notification de succès et redirection
    notificationStore.success(
      'Compte créé avec succès !',
      `Bienvenue ${formData.value.first_name} ${formData.value.last_name} ! Votre compte RP est prêt.`
    )

    // Rediriger vers le dashboard
    router.push('/dashboard')

  } catch (error: any) {
    console.error('Erreur lors de l\'inscription:', error)
    
    let errorMessage = 'Une erreur est survenue lors de la création du compte.'
    
    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage = 'Cette adresse email est déjà utilisée.'
        break
      case 'auth/invalid-email':
        errorMessage = 'Adresse email invalide.'
        break
      case 'auth/weak-password':
        errorMessage = 'Le mot de passe doit contenir au moins 6 caractères.'
        break
      case 'permission-denied':
        errorMessage = 'Permissions insuffisantes. Contactez l\'administrateur.'
        break
    }

    notificationStore.error('Erreur d\'inscription', errorMessage)
    
  } finally {
    loading.value = false
  }
}
</script> 