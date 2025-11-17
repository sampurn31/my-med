import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
  limit,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { decrementPillsRemaining } from './medications';

/**
 * Get today's dose logs for a user
 */
export const getTodayDoseLogs = async (userId) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const logsQuery = query(
      collection(db, 'doseLogs'),
      where('userId', '==', userId),
      where('scheduledAt', '>=', Timestamp.fromDate(today)),
      where('scheduledAt', '<', Timestamp.fromDate(tomorrow)),
      orderBy('scheduledAt', 'asc')
    );

    const snapshot = await getDocs(logsQuery);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error getting today dose logs:', error);
    throw error;
  }
};

/**
 * Get upcoming dose logs (next 24 hours)
 */
export const getUpcomingDoseLogs = async (userId) => {
  try {
    const now = new Date();
    const next24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const logsQuery = query(
      collection(db, 'doseLogs'),
      where('userId', '==', userId),
      where('scheduledAt', '>=', Timestamp.fromDate(now)),
      where('scheduledAt', '<=', Timestamp.fromDate(next24h)),
      where('status', '==', 'scheduled'),
      orderBy('scheduledAt', 'asc'),
      limit(20)
    );

    const snapshot = await getDocs(logsQuery);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error getting upcoming dose logs:', error);
    throw error;
  }
};

/**
 * Get dose logs for a specific schedule
 */
export const getScheduleDoseLogs = async (scheduleId, limitCount = 30) => {
  try {
    const logsQuery = query(
      collection(db, 'doseLogs'),
      where('scheduleId', '==', scheduleId),
      orderBy('scheduledAt', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(logsQuery);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error getting schedule dose logs:', error);
    throw error;
  }
};

/**
 * Mark a dose as taken
 */
export const markDoseAsTaken = async (logId) => {
  try {
    const logRef = doc(db, 'doseLogs', logId);
    const logSnap = await getDoc(logRef);

    if (!logSnap.exists()) {
      throw new Error('Dose log not found');
    }

    const logData = logSnap.data();

    // Update dose log
    await updateDoc(logRef, {
      status: 'taken',
      takenAt: serverTimestamp(),
      snoozedUntil: null,
    });

    // Decrement pills remaining if applicable
    if (logData.medId) {
      await decrementPillsRemaining(logData.medId);
    }

    return true;
  } catch (error) {
    console.error('Error marking dose as taken:', error);
    throw error;
  }
};

/**
 * Snooze a dose
 */
export const snoozeDose = async (logId, snoozeMinutes = 10) => {
  try {
    const logRef = doc(db, 'doseLogs', logId);
    const snoozedUntil = new Date(Date.now() + snoozeMinutes * 60 * 1000);

    await updateDoc(logRef, {
      snoozedUntil: Timestamp.fromDate(snoozedUntil),
    });

    return true;
  } catch (error) {
    console.error('Error snoozing dose:', error);
    throw error;
  }
};

/**
 * Skip a dose
 */
export const skipDose = async (logId) => {
  try {
    const logRef = doc(db, 'doseLogs', logId);

    await updateDoc(logRef, {
      status: 'skipped',
      snoozedUntil: null,
    });

    return true;
  } catch (error) {
    console.error('Error skipping dose:', error);
    throw error;
  }
};

/**
 * Get dose history for a user (last 30 days)
 */
export const getDoseHistory = async (userId, days = 30) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const logsQuery = query(
      collection(db, 'doseLogs'),
      where('userId', '==', userId),
      where('scheduledAt', '>=', Timestamp.fromDate(startDate)),
      orderBy('scheduledAt', 'desc')
    );

    const snapshot = await getDocs(logsQuery);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error getting dose history:', error);
    throw error;
  }
};

/**
 * Create a manual dose log (for missed doses or manual entries)
 */
export const createDoseLog = async (userId, scheduleId, medId, scheduledAt) => {
  try {
    const logRef = await addDoc(collection(db, 'doseLogs'), {
      userId,
      scheduleId,
      medId,
      scheduledAt: Timestamp.fromDate(new Date(scheduledAt)),
      takenAt: null,
      status: 'scheduled',
      snoozedUntil: null,
    });

    return logRef.id;
  } catch (error) {
    console.error('Error creating dose log:', error);
    throw error;
  }
};

