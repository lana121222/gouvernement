// 🔥 Script automatique pour créer les profils utilisateur Firebase
import { initializeApp } from 'firebase/app'
import { getFirestore, doc, setDoc } from 'firebase/firestore'
import { config } from 'dotenv'

// Charger les variables d'environnement
config()

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
}

// Initialiser Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

// Configuration des utilisateurs
const userProfiles = {
  'admin@gouvernement-rp.com': {
    role: 'admin',
    permissions: ['accounting', 'users', 'employees', 'transactions']
  },
  'manager@gouvernement-rp.com': {
    role: 'manager',
    permissions: ['accounting', 'employees']
  },
  'comptable@gouvernement-rp.com': {
    role: 'employee',
    permissions: ['accounting']
  }
}

async function createUserProfiles() {
  try {
    console.log('🔥 Création automatique des profils utilisateur...')
    
    for (const [email, profile] of Object.entries(userProfiles)) {
      console.log(`📝 Création du profil pour ${email}...`)
      
      // Créer un ID temporaire basé sur l'email
      const tempId = email.replace('@', '_').replace('.', '_').replace('-', '_')
      
      const userProfile = {
        email: email,
        role: profile.role,
        permissions: profile.permissions,
        created_at: new Date().toISOString(),
        temp_id: true, // Marquer comme temporaire
        instructions: `Remplacez cet ID par l'UID réel de ${email} depuis Authentication`
      }
      
      await setDoc(doc(db, 'users', tempId), userProfile)
      console.log(`✅ Profil créé pour ${email} avec ID temporaire: ${tempId}`)
    }
    
    console.log('\n🎉 Profils utilisateur créés avec succès !')
    console.log('\n📋 ÉTAPES SUIVANTES :')
    console.log('1. Allez dans Firebase Console → Authentication → Users')
    console.log('2. Copiez l\'UID de chaque utilisateur')
    console.log('3. Allez dans Firestore → Collection "users"')
    console.log('4. Pour chaque document :')
    console.log('   - Cliquez sur les 3 points → "Dupliquer le document"')
    console.log('   - Utilisez l\'UID comme nouvel ID')
    console.log('   - Supprimez les champs "temp_id" et "instructions"')
    console.log('   - Supprimez l\'ancien document temporaire')
    
    console.log('\n🔥 Ou utilisez cette méthode plus rapide :')
    console.log('1. Copiez les UID depuis Authentication')
    console.log('2. Modifiez directement les IDs des documents dans Firestore')
    
  } catch (error) {
    console.error('❌ Erreur lors de la création des profils:', error)
    console.error('Détails:', error.message)
  }
}

// Exécuter le script
createUserProfiles() 