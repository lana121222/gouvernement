import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
admin.initializeApp();

const db = admin.firestore();
const auth = admin.auth();

/**
 * Cloud Function pour supprimer complètement un utilisateur
 * - Supprime le compte Firebase Authentication
 * - Supprime tous les documents Firestore liés à l'utilisateur
 * - Supprime le profil utilisateur
 */
export const deleteUserCompletely = functions.https.onCall(async (data, context) => {
  // Vérifier que l'utilisateur est authentifié et est admin
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'L\'utilisateur doit être connecté.');
  }

  // Vérifier les permissions admin
  const adminUid = context.auth.uid;
  const adminUser = await db.collection('users').doc(adminUid).get();
  
  if (!adminUser.exists || adminUser.data()?.role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Seuls les administrateurs peuvent supprimer des utilisateurs.');
  }

  const { userId } = data;
  if (!userId) {
    throw new functions.https.HttpsError('invalid-argument', 'L\'ID utilisateur est requis.');
  }

  try {
    console.log(`🗑️ Début de la suppression complète de l'utilisateur ${userId}`);

    // 1. Supprimer de Firebase Authentication
    try {
      await auth.deleteUser(userId);
      console.log(`✅ Compte Firebase Auth supprimé pour ${userId}`);
    } catch (authError: any) {
      if (authError.code !== 'auth/user-not-found') {
        console.error(`❌ Erreur lors de la suppression du compte Auth:`, authError);
        throw authError;
      }
      console.log(`ℹ️ Compte Auth inexistant pour ${userId}`);
    }

    // 2. Supprimer de la collection "users"
    try {
      await db.collection('users').doc(userId).delete();
      console.log(`✅ Document users supprimé pour ${userId}`);
    } catch (error) {
      console.error(`❌ Erreur lors de la suppression du document users:`, error);
    }

    // 3. Supprimer de la collection "profiles"
    try {
      await db.collection('profiles').doc(userId).delete();
      console.log(`✅ Document profiles supprimé pour ${userId}`);
    } catch (error) {
      console.error(`❌ Erreur lors de la suppression du document profiles:`, error);
    }

    // 4. Supprimer de la collection "employees" (si l'utilisateur était un employé)
    try {
      const employeeQuery = await db.collection('employees')
        .where('user_id', '==', userId)
        .get();
      
      const deletionPromises = employeeQuery.docs.map(doc => doc.ref.delete());
      await Promise.all(deletionPromises);
      
      if (employeeQuery.docs.length > 0) {
        console.log(`✅ ${employeeQuery.docs.length} document(s) employees supprimé(s) pour ${userId}`);
      }
    } catch (error) {
      console.error(`❌ Erreur lors de la suppression des documents employees:`, error);
    }

    // 5. Supprimer les transactions créées par cet utilisateur
    try {
      const transactionsQuery = await db.collection('transactions')
        .where('created_by', '==', userId)
        .get();
      
      const deletionPromises = transactionsQuery.docs.map(doc => doc.ref.delete());
      await Promise.all(deletionPromises);
      
      if (transactionsQuery.docs.length > 0) {
        console.log(`✅ ${transactionsQuery.docs.length} transaction(s) supprimée(s) pour ${userId}`);
      }
    } catch (error) {
      console.error(`❌ Erreur lors de la suppression des transactions:`, error);
    }

    // 6. Supprimer les transactions de services créées par cet utilisateur
    try {
      const serviceTransactionsQuery = await db.collection('service_transactions')
        .where('created_by', '==', userId)
        .get();
      
      const deletionPromises = serviceTransactionsQuery.docs.map(doc => doc.ref.delete());
      await Promise.all(deletionPromises);
      
      if (serviceTransactionsQuery.docs.length > 0) {
        console.log(`✅ ${serviceTransactionsQuery.docs.length} transaction(s) de service supprimée(s) pour ${userId}`);
      }
    } catch (error) {
      console.error(`❌ Erreur lors de la suppression des transactions de service:`, error);
    }

    // 7. Supprimer les sauvegardes créées par cet utilisateur
    try {
      const backupsQuery = await db.collection('backups')
        .where('created_by', '==', userId)
        .get();
      
      const deletionPromises = backupsQuery.docs.map(doc => doc.ref.delete());
      await Promise.all(deletionPromises);
      
      if (backupsQuery.docs.length > 0) {
        console.log(`✅ ${backupsQuery.docs.length} sauvegarde(s) supprimée(s) pour ${userId}`);
      }
    } catch (error) {
      console.error(`❌ Erreur lors de la suppression des sauvegardes:`, error);
    }

    console.log(`🎉 Suppression complète terminée avec succès pour ${userId}`);

    return {
      success: true,
      message: `Utilisateur ${userId} supprimé complètement avec succès. Le compte Firebase Auth et toutes les données associées ont été supprimés.`,
      userId: userId
    };

  } catch (error: any) {
    console.error(`💥 Erreur lors de la suppression complète de l'utilisateur ${userId}:`, error);
    throw new functions.https.HttpsError('internal', `Erreur lors de la suppression de l'utilisateur: ${error.message}`);
  }
});

/**
 * Fonction de nettoyage automatique des utilisateurs
 * Se déclenche automatiquement quand un utilisateur supprime son compte
 */
export const cleanupUserData = functions.auth.user().onDelete(async (user) => {
  const userId = user.uid;
  console.log(`🧹 Nettoyage automatique des données pour l'utilisateur supprimé ${userId}`);

  try {
    // Supprimer de la collection "users"
    await db.collection('users').doc(userId).delete();
    console.log(`✅ Document users supprimé automatiquement pour ${userId}`);

    // Supprimer de la collection "profiles"
    await db.collection('profiles').doc(userId).delete();
    console.log(`✅ Document profiles supprimé automatiquement pour ${userId}`);

    // Supprimer les employés liés
    const employeeQuery = await db.collection('employees')
      .where('user_id', '==', userId)
      .get();
    
    const deletionPromises = employeeQuery.docs.map(doc => doc.ref.delete());
    await Promise.all(deletionPromises);
    
    if (employeeQuery.docs.length > 0) {
      console.log(`✅ ${employeeQuery.docs.length} document(s) employees supprimé(s) automatiquement pour ${userId}`);
    }

  } catch (error) {
    console.error(`❌ Erreur lors du nettoyage automatique pour ${userId}:`, error);
  }
});

/**
 * Fonction pour vérifier l'existence d'un utilisateur
 */
export const checkUserExists = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'L\'utilisateur doit être connecté.');
  }

  const { userId } = data;
  if (!userId) {
    throw new functions.https.HttpsError('invalid-argument', 'L\'ID utilisateur est requis.');
  }

  try {
    // Vérifier dans Firebase Auth
    let authExists = false;
    try {
      await auth.getUser(userId);
      authExists = true;
    } catch (error: any) {
      if (error.code !== 'auth/user-not-found') {
        throw error;
      }
    }

    // Vérifier dans Firestore
    const userDoc = await db.collection('users').doc(userId).get();
    const profileDoc = await db.collection('profiles').doc(userId).get();

    return {
      authExists,
      userDocExists: userDoc.exists,
      profileDocExists: profileDoc.exists,
      userData: userDoc.exists ? userDoc.data() : null,
      profileData: profileDoc.exists ? profileDoc.data() : null
    };

  } catch (error: any) {
    console.error('Erreur lors de la vérification de l\'utilisateur:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
}); 