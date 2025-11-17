import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
// Photo upload disabled - Firebase Storage not enabled
// import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db } from '../config/firebase';
// import { storage } from '../config/firebase'; // Storage disabled

/**
 * Add a new medication
 * Note: Photo upload disabled (Firebase Storage not enabled)
 */
export const addMedication = async (userId, medicationData, photoFile = null) => {
  try {
    // Photo upload disabled - Firebase Storage not enabled
    // let photoUrl = null;
    // if (photoFile) {
    //   const photoRef = ref(storage, `medications/${userId}/${Date.now()}_${photoFile.name}`);
    //   await uploadBytes(photoRef, photoFile);
    //   photoUrl = await getDownloadURL(photoRef);
    // }

    const medRef = await addDoc(collection(db, 'medications'), {
      userId,
      name: medicationData.name,
      strength: medicationData.strength || '',
      form: medicationData.form || 'tablet',
      photoUrl: null, // Always null when storage disabled
      notes: medicationData.notes || '',
      pillsRemaining: medicationData.pillsRemaining || null,
      createdAt: serverTimestamp(),
    });

    return medRef.id;
  } catch (error) {
    console.error('Error adding medication:', error);
    throw error;
  }
};

/**
 * Update a medication
 * Note: Photo upload disabled (Firebase Storage not enabled)
 */
export const updateMedication = async (medId, updates, photoFile = null) => {
  try {
    const medRef = doc(db, 'medications', medId);
    const medSnap = await getDoc(medRef);

    if (!medSnap.exists()) {
      throw new Error('Medication not found');
    }

    // Photo upload disabled - Firebase Storage not enabled
    // let photoUrl = medSnap.data().photoUrl;
    // if (photoFile) {
    //   if (photoUrl) {
    //     try {
    //       const oldPhotoRef = ref(storage, photoUrl);
    //       await deleteObject(oldPhotoRef);
    //     } catch (err) {
    //       console.warn('Could not delete old photo:', err);
    //     }
    //   }
    //   const photoRef = ref(storage, `medications/${medSnap.data().userId}/${Date.now()}_${photoFile.name}`);
    //   await uploadBytes(photoRef, photoFile);
    //   photoUrl = await getDownloadURL(photoRef);
    // }

    await updateDoc(medRef, {
      ...updates,
      // Photo field not updated when storage disabled
    });

    return medId;
  } catch (error) {
    console.error('Error updating medication:', error);
    throw error;
  }
};

/**
 * Delete a medication
 * Note: Photo deletion disabled (Firebase Storage not enabled)
 */
export const deleteMedication = async (medId) => {
  try {
    const medRef = doc(db, 'medications', medId);
    const medSnap = await getDoc(medRef);

    if (!medSnap.exists()) {
      throw new Error('Medication not found');
    }

    // Photo deletion disabled - Firebase Storage not enabled
    // const photoUrl = medSnap.data().photoUrl;
    // if (photoUrl) {
    //   try {
    //     const photoRef = ref(storage, photoUrl);
    //     await deleteObject(photoRef);
    //   } catch (err) {
    //     console.warn('Could not delete photo:', err);
    //   }
    // }

    // Delete associated schedules
    const schedulesQuery = query(
      collection(db, 'schedules'),
      where('medId', '==', medId)
    );
    const schedulesSnap = await getDocs(schedulesQuery);
    const deletePromises = schedulesSnap.docs.map((doc) => deleteDoc(doc.ref));
    await Promise.all(deletePromises);

    // Delete medication
    await deleteDoc(medRef);

    return true;
  } catch (error) {
    console.error('Error deleting medication:', error);
    throw error;
  }
};

/**
 * Get all medications for a user
 */
export const getUserMedications = async (userId) => {
  try {
    const medsQuery = query(
      collection(db, 'medications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(medsQuery);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error getting medications:', error);
    throw error;
  }
};

/**
 * Get a single medication
 */
export const getMedication = async (medId) => {
  try {
    const medRef = doc(db, 'medications', medId);
    const medSnap = await getDoc(medRef);

    if (!medSnap.exists()) {
      throw new Error('Medication not found');
    }

    return {
      id: medSnap.id,
      ...medSnap.data(),
    };
  } catch (error) {
    console.error('Error getting medication:', error);
    throw error;
  }
};

/**
 * Update pills remaining count
 */
export const updatePillsRemaining = async (medId, count) => {
  try {
    const medRef = doc(db, 'medications', medId);
    await updateDoc(medRef, {
      pillsRemaining: count,
    });
    return true;
  } catch (error) {
    console.error('Error updating pills remaining:', error);
    throw error;
  }
};

/**
 * Decrement pills remaining (when dose is taken)
 */
export const decrementPillsRemaining = async (medId) => {
  try {
    const medRef = doc(db, 'medications', medId);
    const medSnap = await getDoc(medRef);

    if (!medSnap.exists()) {
      throw new Error('Medication not found');
    }

    const currentCount = medSnap.data().pillsRemaining;
    if (currentCount !== null && currentCount > 0) {
      await updateDoc(medRef, {
        pillsRemaining: currentCount - 1,
      });
    }

    return true;
  } catch (error) {
    console.error('Error decrementing pills:', error);
    throw error;
  }
};

