import {
  collection,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Send family invite (add to family array)
 */
export const inviteFamilyMember = async (userId, inviteeEmail) => {
  try {
    // Validate inputs
    if (!userId) {
      throw new Error('User ID is required');
    }
    if (!inviteeEmail || !inviteeEmail.includes('@')) {
      throw new Error('Valid email address is required');
    }

    // Find user by email
    const usersQuery = query(
      collection(db, 'users'),
      where('email', '==', inviteeEmail.toLowerCase().trim())
    );
    
    const snapshot = await getDocs(usersQuery);
    
    if (snapshot.empty) {
      throw new Error('No user found with this email. They need to create an account first.');
    }
    
    const inviteeId = snapshot.docs[0].id;
    const inviteeData = snapshot.docs[0].data();
    
    if (inviteeId === userId) {
      throw new Error('Cannot add yourself as a family member');
    }

    // Check if already family members
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      throw new Error('User document not found');
    }

    const currentFamily = userSnap.data().family || [];
    if (currentFamily.includes(inviteeId)) {
      throw new Error('This person is already in your family');
    }
    
    // Add invitee to user's family
    await updateDoc(userRef, {
      family: arrayUnion(inviteeId),
    });
    
    // Add user to invitee's family (bidirectional)
    const inviteeRef = doc(db, 'users', inviteeId);
    await updateDoc(inviteeRef, {
      family: arrayUnion(userId),
    });
    
    console.log(`✅ Added ${inviteeEmail} as family member`);
    
    return {
      success: true,
      inviteeId,
      inviteeName: inviteeData.name || inviteeEmail,
    };
  } catch (error) {
    console.error('Error inviting family member:', error);
    throw error;
  }
};

/**
 * Remove family member
 */
export const removeFamilyMember = async (userId, memberId) => {
  try {
    // Remove member from user's family
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      family: arrayRemove(memberId),
    });
    
    // Remove user from member's family (bidirectional)
    const memberRef = doc(db, 'users', memberId);
    await updateDoc(memberRef, {
      family: arrayRemove(userId),
    });
    
    return true;
  } catch (error) {
    console.error('Error removing family member:', error);
    throw error;
  }
};

/**
 * Get family members details
 */
export const getFamilyMembers = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      throw new Error('User not found');
    }
    
    const familyIds = userSnap.data().family || [];
    
    if (familyIds.length === 0) {
      return [];
    }
    
    // Get details for each family member
    const familyMembers = await Promise.all(
      familyIds.map(async (memberId) => {
        const memberRef = doc(db, 'users', memberId);
        const memberSnap = await getDoc(memberRef);
        
        if (memberSnap.exists()) {
          return {
            id: memberSnap.id,
            name: memberSnap.data().name,
            email: memberSnap.data().email,
          };
        }
        return null;
      })
    );
    
    return familyMembers.filter(member => member !== null);
  } catch (error) {
    console.error('Error getting family members:', error);
    throw error;
  }
};

/**
 * Check if user is a caregiver for another user
 */
export const isCaregiver = async (caregiverId, patientId) => {
  try {
    const patientRef = doc(db, 'users', patientId);
    const patientSnap = await getDoc(patientRef);
    
    if (!patientSnap.exists()) {
      return false;
    }
    
    const familyIds = patientSnap.data().family || [];
    return familyIds.includes(caregiverId);
  } catch (error) {
    console.error('Error checking caregiver status:', error);
    return false;
  }
};

/**
 * Get patients for a caregiver (people who added this user as family)
 */
export const getCaregiverPatients = async (caregiverId) => {
  try {
    const userRef = doc(db, 'users', caregiverId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      return [];
    }
    
    const familyIds = userSnap.data().family || [];
    
    if (familyIds.length === 0) {
      return [];
    }
    
    // Get details for each patient
    const patients = await Promise.all(
      familyIds.map(async (patientId) => {
        const patientRef = doc(db, 'users', patientId);
        const patientSnap = await getDoc(patientRef);
        
        if (patientSnap.exists()) {
          return {
            id: patientSnap.id,
            name: patientSnap.data().name,
            email: patientSnap.data().email,
          };
        }
        return null;
      })
    );
    
    return patients.filter(patient => patient !== null);
  } catch (error) {
    console.error('Error getting caregiver patients:', error);
    throw error;
  }
};

