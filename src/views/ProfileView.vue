<template>
  <AppLayout>
    <div class="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- En-tête -->
      <div class="px-4 py-6 sm:px-0">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Mon Profil</h1>
            <p class="mt-2 text-gray-600">
              Gestion de mes informations personnelles et documents RP
            </p>
          </div>
          <router-link to="/dashboard" class="btn-secondary">
            Retour au Dashboard
          </router-link>
        </div>
      </div>

      <!-- Formulaire de profil -->
      <div class="card">
        <form @submit.prevent="saveProfile" class="space-y-8">
          <!-- Informations personnelles -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-4">
              🧑‍💼 Informations personnelles RP
            </h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label for="first_name" class="block text-sm font-medium text-gray-700">Prénom</label>
                <input
                  id="first_name"
                  v-model="profile.first_name"
                  type="text"
                  class="input-field mt-1"
                  placeholder="Jean"
                />
              </div>
              
              <div>
                <label for="last_name" class="block text-sm font-medium text-gray-700">Nom de famille</label>
                <input
                  id="last_name"
                  v-model="profile.last_name"
                  type="text"
                  class="input-field mt-1"
                  placeholder="Dupont"
                />
              </div>
              
              <div>
                <label for="phone_number" class="block text-sm font-medium text-gray-700">Numéro de téléphone RP</label>
                <input
                  id="phone_number"
                  v-model="profile.phone_number"
                  type="tel"
                  class="input-field mt-1"
                  placeholder="555-0123 (numéro RP)"
                />
              </div>
              
              <div>
                <label for="birth_date" class="block text-sm font-medium text-gray-700">Date de naissance RP</label>
                <input
                  id="birth_date"
                  v-model="profile.birth_date"
                  type="date"
                  class="input-field mt-1"
                />
              </div>
              
              <div class="md:col-span-2">
                <label for="postal_address" class="block text-sm font-medium text-gray-700">Adresse postale RP</label>
                <textarea
                  id="postal_address"
                  v-model="profile.postal_address"
                  rows="3"
                  class="input-field mt-1"
                  placeholder="123 Rue de la République, Los Santos, San Andreas"
                ></textarea>
              </div>
              
              <div>
                <label for="discord_username" class="block text-sm font-medium text-gray-700">Discord</label>
                <input
                  id="discord_username"
                  v-model="profile.discord_username"
                  type="text"
                  class="input-field mt-1"
                  placeholder="MonPseudo#1234"
                />
              </div>
            </div>
          </div>

          <!-- Documents officiels -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-4">
              📄 Documents officiels RP
            </h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Permis de conduire -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Permis de conduire
                </label>
                <div class="space-y-3">
                  <div v-if="profile.driving_license_url" class="relative">
                    <img 
                      :src="profile.driving_license_url" 
                      alt="Permis de conduire"
                      class="w-full h-32 object-cover rounded-lg border cursor-pointer hover:opacity-90 transition-opacity"
                      @click="openImageModal(profile.driving_license_url, 'Permis de conduire')"
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
                        {{ profile.driving_license_url ? 'Changer' : 'Ajouter' }} le permis
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              <!-- PPA -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  PPA (Port d'Arme)
                </label>
                <div class="space-y-3">
                  <div v-if="profile.ppa_url" class="relative">
                    <img 
                      :src="profile.ppa_url" 
                      alt="PPA"
                      class="w-full h-32 object-cover rounded-lg border cursor-pointer hover:opacity-90 transition-opacity"
                      @click="openImageModal(profile.ppa_url, 'PPA (Port d\'Arme)')"
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
                        {{ profile.ppa_url ? 'Changer' : 'Ajouter' }} le PPA
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              <!-- Carte d'identité -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Carte d'identité
                </label>
                <div class="space-y-3">
                  <div v-if="profile.identity_card_url" class="relative">
                    <img 
                      :src="profile.identity_card_url" 
                      alt="Carte d'identité"
                      class="w-full h-32 object-cover rounded-lg border cursor-pointer hover:opacity-90 transition-opacity"
                      @click="openImageModal(profile.identity_card_url, 'Carte d\'identité')"
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
                        {{ profile.identity_card_url ? 'Changer' : 'Ajouter' }} la carte d'identité
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Boutons d'action -->
          <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <router-link to="/dashboard" class="btn-secondary">
              Annuler
            </router-link>
            <button
              type="submit"
              :disabled="loading"
              class="btn-primary disabled:opacity-50"
            >
              {{ loading ? 'Enregistrement...' : 'Sauvegarder' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Informations d'aide -->
      <div class="mt-8 bg-blue-50 border border-blue-200 rounded-md p-4">
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
                <li>• <strong>Formats acceptés :</strong> Images (JPG, PNG) et fichiers PDF</li>
                <li>• <strong>Limite de taille :</strong> Les images sont automatiquement compressées (max 5MB)</li>
                <li>• <strong>Cliquez sur une image</strong> pour la voir en grand</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Message d'erreur permissions si nécessaire -->
      <div v-if="showPermissionError" class="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
        <div class="flex">
          <svg class="h-5 w-5 text-red-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L2.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">
              Problème de permissions Firebase
            </h3>
            <div class="mt-2 text-sm text-red-700">
              <p>Les règles Firestore doivent être mises à jour dans la console Firebase pour permettre l'accès aux profils.</p>
              <p class="mt-1"><strong>Solution :</strong> Contactez l'administrateur pour mettre à jour les règles de sécurité.</p>
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
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { db, type UserProfile } from '@/lib/firebase'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import AppLayout from '@/components/AppLayout.vue'

const authStore = useAuthStore()
const loading = ref(false)
const showPermissionError = ref(false)
const showImageModal = ref(false)
const modalImage = ref({ url: '', title: '' })

// Refs pour les inputs de fichiers
const drivingLicenseInput = ref<HTMLInputElement>()
const ppaInput = ref<HTMLInputElement>()
const identityCardInput = ref<HTMLInputElement>()

// État du profil
const profile = ref<Partial<UserProfile>>({
  first_name: '',
  last_name: '',
  phone_number: '',
  birth_date: '',
  postal_address: '',
  discord_username: '',
  driving_license_url: '',
  ppa_url: '',
  identity_card_url: '',
  other_documents: []
})

// Charger le profil existant
const loadProfile = async () => {
  if (!authStore.user?.id) return
  
  loading.value = true
  try {
    console.log('Chargement du profil pour:', authStore.user.id)
    const profileDoc = await getDoc(doc(db, 'profiles', authStore.user.id))
    if (profileDoc.exists()) {
      const profileData = profileDoc.data() as UserProfile
      profile.value = { ...profileData }
      console.log('Profil chargé avec succès')
    } else {
      console.log('Aucun profil existant trouvé')
    }
  } catch (error: any) {
    console.error('Erreur lors du chargement du profil:', error)
    if (error.code === 'permission-denied') {
      showPermissionError.value = true
      alert('⚠️ Problème de permissions Firebase\n\nLes règles Firestore doivent être mises à jour dans la console Firebase.\nVeuillez contacter l\'administrateur.')
    } else {
      alert('Erreur lors du chargement du profil: ' + error.message)
    }
  } finally {
    loading.value = false
  }
}

// Sauvegarder le profil
const saveProfile = async () => {
  if (!authStore.user?.id) return
  
  loading.value = true
  try {
    console.log('Sauvegarde du profil pour:', authStore.user.id)
    
    const profileData = {
      ...profile.value,
      user_id: authStore.user.id,
      updated_at: new Date().toISOString()
    }

    const profileRef = doc(db, 'profiles', authStore.user.id)
    const profileDoc = await getDoc(profileRef)

    if (profileDoc.exists()) {
      await updateDoc(profileRef, profileData)
    } else {
      await setDoc(profileRef, {
        ...profileData,
        id: authStore.user.id,
        created_at: new Date().toISOString()
      })
    }

    alert('✅ Profil sauvegardé avec succès !')
    console.log('Profil sauvegardé avec succès')
  } catch (error: any) {
    console.error('Erreur lors de la sauvegarde:', error)
    if (error.code === 'permission-denied') {
      showPermissionError.value = true
      alert('⚠️ Problème de permissions Firebase\n\nLes règles Firestore doivent être mises à jour dans la console Firebase.\nVeuillez contacter l\'administrateur.')
    } else if (error.message.includes('longer than')) {
      alert('❌ Image trop volumineuse\n\nVeuillez choisir une image plus petite ou de meilleure qualité.')
    } else {
      alert('Erreur lors de la sauvegarde: ' + error.message)
    }
  } finally {
    loading.value = false
  }
}

// Fonctions pour déclencher l'upload de fichiers
const triggerFileUpload = (inputType: string) => {
  switch (inputType) {
    case 'driving_license':
      drivingLicenseInput.value?.click()
      break
    case 'ppa':
      ppaInput.value?.click()
      break
    case 'identity_card':
      identityCardInput.value?.click()
      break
  }
}

// Fonction pour compresser une image
const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      // Calculer les nouvelles dimensions (max 800px de largeur)
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
      
      // Redimensionner l'image
      canvas.width = width
      canvas.height = height
      ctx?.drawImage(img, 0, 0, width, height)
      
      // Compresser en JPEG avec qualité 0.7
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
        alert('Le fichier est trop volumineux. Veuillez choisir un fichier de moins de 5MB.')
        return
      }

      console.log(`Traitement du fichier ${file.name}...`)
      
      let fileDataUrl: string
      
      // Si c'est un PDF, le lire directement
      if (file.type === 'application/pdf') {
        const reader = new FileReader()
        fileDataUrl = await new Promise((resolve, reject) => {
          reader.onload = (e) => resolve(e.target?.result as string)
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
      } else if (file.type.startsWith('image/')) {
        // Si c'est une image, la compresser
        fileDataUrl = await compressImage(file)
      } else {
        alert('Format de fichier non supporté. Veuillez choisir une image (JPG, PNG) ou un fichier PDF.')
        return
      }
      
      // Vérifier la taille après traitement (base64)
      const sizeInBytes = fileDataUrl.length * 0.75 // Approximation taille base64
      if (sizeInBytes > 1000000) { // 1MB limite Firestore
        alert('Le fichier est encore trop volumineux après traitement. Veuillez choisir un fichier plus petit.')
        return
      }
      
      // Assigner à la bonne propriété
      switch (documentType) {
        case 'driving_license':
          profile.value.driving_license_url = fileDataUrl
          break
        case 'ppa':
          profile.value.ppa_url = fileDataUrl
          break
        case 'identity_card':
          profile.value.identity_card_url = fileDataUrl
          break
      }
      
      console.log(`Fichier ${file.name} traité avec succès`)
    } catch (error) {
      console.error('Erreur lors du traitement du fichier:', error)
      alert('Erreur lors du traitement du fichier. Veuillez réessayer.')
    }
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

// Supprimer un document
const removeDocument = (documentType: string) => {
  switch (documentType) {
    case 'driving_license':
      profile.value.driving_license_url = ''
      break
    case 'ppa':
      profile.value.ppa_url = ''
      break
    case 'identity_card':
      profile.value.identity_card_url = ''
      break
  }
}

onMounted(() => {
  loadProfile()
})
</script> 
