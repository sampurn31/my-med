/**
 * Utility to clean up duplicate dose logs
 * Run this once to remove duplicates from Firestore
 */

import { collection, query, where, getDocs, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Find and remove duplicate dose logs for a user
 * Keeps the first dose log and deletes the rest
 */
export const cleanupDuplicateDoseLogs = async (userId) => {
  try {
    console.log('🧹 Starting duplicate cleanup...');
    
    // Get all dose logs for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const logsQuery = query(
      collection(db, 'doseLogs'),
      where('userId', '==', userId),
      where('scheduledAt', '>=', Timestamp.fromDate(today)),
      where('scheduledAt', '<', Timestamp.fromDate(tomorrow))
    );

    const snapshot = await getDocs(logsQuery);
    const logs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log(`Found ${logs.length} total dose logs for today`);

    // Group by scheduleId + scheduledAt to find duplicates
    const grouped = {};
    
    logs.forEach(log => {
      const key = `${log.scheduleId}-${log.scheduledAt.toMillis()}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(log);
    });

    // Find and delete duplicates
    let deletedCount = 0;
    
    for (const [key, group] of Object.entries(grouped)) {
      if (group.length > 1) {
        console.log(`Found ${group.length} duplicates for ${key}`);
        
        // Keep the first one, delete the rest
        for (let i = 1; i < group.length; i++) {
          await deleteDoc(doc(db, 'doseLogs', group[i].id));
          deletedCount++;
          console.log(`  ❌ Deleted duplicate: ${group[i].id}`);
        }
      }
    }

    console.log(`✅ Cleanup complete! Deleted ${deletedCount} duplicate dose logs.`);
    console.log(`📊 Remaining dose logs: ${logs.length - deletedCount}`);
    
    return {
      total: logs.length,
      deleted: deletedCount,
      remaining: logs.length - deletedCount,
    };
  } catch (error) {
    console.error('Error cleaning up duplicates:', error);
    throw error;
  }
};

/**
 * Get duplicate statistics without deleting
 */
export const getDuplicateStats = async (userId) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const logsQuery = query(
      collection(db, 'doseLogs'),
      where('userId', '==', userId),
      where('scheduledAt', '>=', Timestamp.fromDate(today)),
      where('scheduledAt', '<', Timestamp.fromDate(tomorrow))
    );

    const snapshot = await getDocs(logsQuery);
    const logs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Group by scheduleId + scheduledAt
    const grouped = {};
    
    logs.forEach(log => {
      const key = `${log.scheduleId}-${log.scheduledAt.toMillis()}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(log);
    });

    const duplicates = Object.values(grouped).filter(group => group.length > 1);
    const duplicateCount = duplicates.reduce((sum, group) => sum + (group.length - 1), 0);

    return {
      total: logs.length,
      unique: Object.keys(grouped).length,
      duplicates: duplicateCount,
      groups: duplicates,
    };
  } catch (error) {
    console.error('Error getting duplicate stats:', error);
    throw error;
  }
};

