"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkUserExists = exports.cleanupUserData = exports.deleteUserCompletely = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
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
exports.deleteUserCompletely = functions.https.onCall(async (data, context) => {
    var _a;
    // Vérifier que l'utilisateur est authentifié et est admin
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'L\'utilisateur doit être connecté.');
    }
    // Vérifier les permissions admin
    const adminUid = context.auth.uid;
    const adminUser = await db.collection('users').doc(adminUid).get();
    if (!adminUser.exists || ((_a = adminUser.data()) === null || _a === void 0 ? void 0 : _a.role) !== 'admin') {
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
        }
        catch (authError) {
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
        }
        catch (error) {
            console.error(`❌ Erreur lors de la suppression du document users:`, error);
        }
        // 3. Supprimer de la collection "profiles"
        try {
            await db.collection('profiles').doc(userId).delete();
            console.log(`✅ Document profiles supprimé pour ${userId}`);
        }
        catch (error) {
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
        }
        catch (error) {
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
        }
        catch (error) {
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
        }
        catch (error) {
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
        }
        catch (error) {
            console.error(`❌ Erreur lors de la suppression des sauvegardes:`, error);
        }
        console.log(`🎉 Suppression complète terminée avec succès pour ${userId}`);
        return {
            success: true,
            message: `Utilisateur ${userId} supprimé complètement avec succès. Le compte Firebase Auth et toutes les données associées ont été supprimés.`,
            userId: userId
        };
    }
    catch (error) {
        console.error(`💥 Erreur lors de la suppression complète de l'utilisateur ${userId}:`, error);
        throw new functions.https.HttpsError('internal', `Erreur lors de la suppression de l'utilisateur: ${error.message}`);
    }
});
/**
 * Fonction de nettoyage automatique des utilisateurs
 * Se déclenche automatiquement quand un utilisateur supprime son compte
 */
exports.cleanupUserData = functions.auth.user().onDelete(async (user) => {
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
    }
    catch (error) {
        console.error(`❌ Erreur lors du nettoyage automatique pour ${userId}:`, error);
    }
});
/**
 * Fonction pour vérifier l'existence d'un utilisateur
 */
exports.checkUserExists = functions.https.onCall(async (data, context) => {
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
        }
        catch (error) {
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
    }
    catch (error) {
        console.error('Erreur lors de la vérification de l\'utilisateur:', error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});
//# sourceMappingURL=index.js.map