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
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Create dose logs for today's schedule times
 */
const createTodayDoseLogs = async (userId, scheduleId, medId, times) => {
  try {
    const today = new Date();
    const todayStart = new Date(today);
    todayStart.setHours(0, 0, 0, 0);

    for (const timeStr of times) {
      // Parse time (format: "HH:mm")
      const [hours, minutes] = timeStr.split(':').map(Number);
      
      // Create scheduled datetime for today
      const scheduledTime = new Date();
      scheduledTime.setHours(hours, minutes, 0, 0);

      // Only create if the time hasn't passed yet (compare with current time, not start of day)
      const now = new Date();
      if (scheduledTime >= todayStart) {
        // Check if dose log already exists
        const existingLogsQuery = query(
          collection(db, 'doseLogs'),
          where('userId', '==', userId),
          where('scheduleId', '==', scheduleId),
          where('scheduledAt', '==', Timestamp.fromDate(scheduledTime))
        );

        const existingLogs = await getDocs(existingLogsQuery);

        if (existingLogs.empty) {
          // Create new dose log
          await addDoc(collection(db, 'doseLogs'), {
            userId,
            scheduleId,
            medId,
            scheduledAt: Timestamp.fromDate(scheduledTime),
            takenAt: null,
            status: 'scheduled',
            snoozedUntil: null,
          });
          console.log(`✅ Created dose log for ${timeStr} (scheduleId: ${scheduleId})`);
        } else {
          console.log(`⏭️ Skipped duplicate dose log for ${timeStr} (scheduleId: ${scheduleId})`);
        }
      }
    }
  } catch (error) {
    console.error('Error creating today dose logs:', error);
    // Don't throw - let the schedule be created even if dose logs fail
  }
};

/**
 * Add a new schedule
 */
export const addSchedule = async (userId, scheduleData) => {
  try {
    const scheduleRef = await addDoc(collection(db, 'schedules'), {
      userId,
      medId: scheduleData.medId,
      startDate: Timestamp.fromDate(new Date(scheduleData.startDate)),
      endDate: scheduleData.endDate ? Timestamp.fromDate(new Date(scheduleData.endDate)) : null,
      recurrence: scheduleData.recurrence || { type: 'daily', intervalHours: null },
      times: scheduleData.times || [], // Array of "HH:mm" strings
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
      instructions: scheduleData.instructions || '',
      active: true,
    });

    // Create dose logs for today
    await createTodayDoseLogs(userId, scheduleRef.id, scheduleData.medId, scheduleData.times || []);

    return scheduleRef.id;
  } catch (error) {
    console.error('Error adding schedule:', error);
    throw error;
  }
};

/**
 * Update a schedule
 */
export const updateSchedule = async (scheduleId, updates) => {
  try {
    const scheduleRef = doc(db, 'schedules', scheduleId);
    
    // Convert dates to Timestamps if present
    const processedUpdates = { ...updates };
    if (updates.startDate) {
      processedUpdates.startDate = Timestamp.fromDate(new Date(updates.startDate));
    }
    if (updates.endDate) {
      processedUpdates.endDate = Timestamp.fromDate(new Date(updates.endDate));
    }

    await updateDoc(scheduleRef, processedUpdates);
    return scheduleId;
  } catch (error) {
    console.error('Error updating schedule:', error);
    throw error;
  }
};

/**
 * Delete a schedule
 */
export const deleteSchedule = async (scheduleId) => {
  try {
    const scheduleRef = doc(db, 'schedules', scheduleId);
    await deleteDoc(scheduleRef);
    return true;
  } catch (error) {
    console.error('Error deleting schedule:', error);
    throw error;
  }
};

/**
 * Get all schedules for a user
 */
export const getUserSchedules = async (userId) => {
  try {
    const schedulesQuery = query(
      collection(db, 'schedules'),
      where('userId', '==', userId),
      where('active', '==', true),
      orderBy('startDate', 'desc')
    );

    const snapshot = await getDocs(schedulesQuery);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error getting schedules:', error);
    throw error;
  }
};

/**
 * Get schedules for a specific medication
 */
export const getMedicationSchedules = async (medId) => {
  try {
    const schedulesQuery = query(
      collection(db, 'schedules'),
      where('medId', '==', medId),
      where('active', '==', true)
    );

    const snapshot = await getDocs(schedulesQuery);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error getting medication schedules:', error);
    throw error;
  }
};

/**
 * Get a single schedule
 */
export const getSchedule = async (scheduleId) => {
  try {
    const scheduleRef = doc(db, 'schedules', scheduleId);
    const scheduleSnap = await getDoc(scheduleRef);

    if (!scheduleSnap.exists()) {
      throw new Error('Schedule not found');
    }

    return {
      id: scheduleSnap.id,
      ...scheduleSnap.data(),
    };
  } catch (error) {
    console.error('Error getting schedule:', error);
    throw error;
  }
};

/**
 * Toggle schedule active status
 */
export const toggleScheduleActive = async (scheduleId, active) => {
  try {
    const scheduleRef = doc(db, 'schedules', scheduleId);
    await updateDoc(scheduleRef, { active });
    return true;
  } catch (error) {
    console.error('Error toggling schedule:', error);
    throw error;
  }
};

/**
 * Sync all active schedules and create today's dose logs
 * Call this when the app starts or when user logs in
 */
export const syncTodayDoseLogs = async (userId) => {
  try {
    console.log('Syncing today\'s dose logs...');
    
    // Get all active schedules
    const schedulesQuery = query(
      collection(db, 'schedules'),
      where('userId', '==', userId),
      where('active', '==', true)
    );

    const schedulesSnapshot = await getDocs(schedulesQuery);
    
    for (const scheduleDoc of schedulesSnapshot.docs) {
      const schedule = scheduleDoc.data();
      const scheduleId = scheduleDoc.id;

      // Check if schedule is valid for today
      const today = new Date();
      const startDate = schedule.startDate.toDate();
      const endDate = schedule.endDate ? schedule.endDate.toDate() : null;

      // Skip if not started yet or already ended
      if (startDate > today) continue;
      if (endDate && endDate < today) continue;

      // Create dose logs for today
      await createTodayDoseLogs(userId, scheduleId, schedule.medId, schedule.times || []);
    }

    console.log('Dose logs synced successfully');
    return true;
  } catch (error) {
    console.error('Error syncing dose logs:', error);
    return false;
  }
};

