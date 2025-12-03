/**
 * Client-Side Notification Scheduler
 * This runs in the browser/PWA and sends notifications without Cloud Functions
 * Perfect for users without Firebase billing
 */

import { collection, query, where, getDocs, addDoc, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { format, isToday, isBefore, isAfter, addMinutes, parseISO } from 'date-fns';

// Store for tracking sent notifications (prevents duplicates)
const sentNotifications = new Set();
let notificationInterval = null;

/**
 * Start the client-side notification scheduler
 */
export const startNotificationScheduler = (userId) => {
  if (!userId) {
    console.warn('Cannot start notification scheduler: No user ID');
    return;
  }

  // Clear any existing interval
  stopNotificationScheduler();

  console.log('Starting client-side notification scheduler for user:', userId);

  // Check immediately
  checkAndSendNotifications(userId);

  // Then check every minute
  notificationInterval = setInterval(() => {
    checkAndSendNotifications(userId);
  }, 60000); // 60 seconds

  // Clean up sent notifications cache every hour
  setInterval(() => {
    sentNotifications.clear();
    console.log('Cleared notification cache');
  }, 3600000); // 1 hour
};

/**
 * Stop the notification scheduler
 */
export const stopNotificationScheduler = () => {
  if (notificationInterval) {
    clearInterval(notificationInterval);
    notificationInterval = null;
    console.log('Stopped notification scheduler');
  }
};

/**
 * Check schedules and send notifications
 */
const checkAndSendNotifications = async (userId) => {
  try {
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get active schedules for today
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
      const startDate = schedule.startDate.toDate();
      const endDate = schedule.endDate ? schedule.endDate.toDate() : null;

      if (isBefore(now, startDate)) continue; // Not started yet
      if (endDate && isAfter(now, endDate)) continue; // Already ended

      // Process each scheduled time
      for (const timeStr of schedule.times) {
        await processScheduledTime(userId, scheduleId, schedule, timeStr, now);
      }
    }
  } catch (error) {
    console.error('Error checking notifications:', error);
  }
};

/**
 * Process a single scheduled time
 */
const processScheduledTime = async (userId, scheduleId, schedule, timeStr, now) => {
  try {
    // Parse time (format: "HH:mm")
    const [hours, minutes] = timeStr.split(':').map(Number);
    
    // Create scheduled datetime for today
    const scheduledTime = new Date();
    scheduledTime.setHours(hours, minutes, 0, 0);

    // Check if this time is within the notification window (5 minutes before to 5 minutes after)
    const notificationStart = addMinutes(scheduledTime, -5);
    const notificationEnd = addMinutes(scheduledTime, 5);

    if (isBefore(now, notificationStart) || isAfter(now, notificationEnd)) {
      return; // Not time yet or too late
    }

    // Create unique key for this notification
    const notificationKey = `${scheduleId}-${format(scheduledTime, 'yyyy-MM-dd-HH:mm')}`;

    // Check if we already sent this notification
    if (sentNotifications.has(notificationKey)) {
      return; // Already sent
    }

    // Check if dose log already exists
    const doseLogsQuery = query(
      collection(db, 'doseLogs'),
      where('userId', '==', userId),
      where('scheduleId', '==', scheduleId),
      where('scheduledAt', '==', Timestamp.fromDate(scheduledTime))
    );

    const doseLogsSnapshot = await getDocs(doseLogsQuery);

    let doseLogId = null;
    let shouldSendNotification = false;

    if (doseLogsSnapshot.empty) {
      // Create new dose log
      const doseLogRef = await addDoc(collection(db, 'doseLogs'), {
        userId,
        scheduleId,
        medId: schedule.medId,
        scheduledAt: Timestamp.fromDate(scheduledTime),
        takenAt: null,
        status: 'scheduled',
        snoozedUntil: null,
      });
      doseLogId = doseLogRef.id;
      shouldSendNotification = true;
    } else {
      // Dose log exists, check if we should send notification
      const doseLog = doseLogsSnapshot.docs[0].data();
      doseLogId = doseLogsSnapshot.docs[0].id;

      // Don't send if already taken or skipped
      if (doseLog.status === 'taken' || doseLog.status === 'skipped') {
        sentNotifications.add(notificationKey);
        return;
      }

      // Check if snoozed
      if (doseLog.snoozedUntil) {
        const snoozedUntil = doseLog.snoozedUntil.toDate();
        if (isAfter(snoozedUntil, now)) {
          return; // Still snoozed
        }
      }

      shouldSendNotification = true;
    }

    if (shouldSendNotification) {
      // Get medication details
      const medDoc = await getDocs(query(
        collection(db, 'medications'),
        where('__name__', '==', schedule.medId)
      ));

      const medName = medDoc.docs[0]?.data()?.name || 'Your medication';

      // Send notification
      await sendBrowserNotification(
        medName,
        schedule.instructions || 'Time to take your medicine',
        scheduleId,
        doseLogId
      );

      // Mark as sent
      sentNotifications.add(notificationKey);
      console.log(`Sent notification for ${medName} at ${timeStr}`);
    }
  } catch (error) {
    console.error('Error processing scheduled time:', error);
  }
};

/**
 * Send browser notification
 */
const sendBrowserNotification = async (medName, instructions, scheduleId, doseLogId) => {
  try {
    // Check if notifications are supported and permitted
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return;
    }

    if (Notification.permission !== 'granted') {
      console.warn('Notification permission not granted');
      return;
    }

    // Send notification (remove actions - they only work with service worker)
    const notification = new Notification('Time to take your medicine! 💊', {
      body: `${medName}\n${instructions}`,
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      tag: scheduleId,
      requireInteraction: true,
      data: {
        scheduleId,
        doseLogId,
        url: '/dashboard',
      },
    });

    // Handle notification click
    notification.onclick = () => {
      window.focus();
      window.location.href = '/dashboard';
      notification.close();
    };

    // Play notification sound (optional)
    try {
      const audio = new Audio('/notification.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {
        // Ignore if sound fails
      });
    } catch (err) {
      // Ignore sound errors
    }
  } catch (error) {
    console.error('Error sending browser notification:', error);
  }
};

/**
 * Request notification permission
 */
export const requestNotificationPermission = async () => {
  try {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

/**
 * Check if notifications are enabled
 */
export const areNotificationsEnabled = () => {
  return 'Notification' in window && Notification.permission === 'granted';
};

