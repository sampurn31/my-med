const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { zonedTimeToUtc, utcToZonedTime, format } = require('date-fns-tz');
const { addMinutes, isAfter, isBefore, parseISO } = require('date-fns');

admin.initializeApp();

const db = admin.firestore();
const messaging = admin.messaging();

// Configuration
const LOOKAHEAD_MINUTES = 10; // How far ahead to look for upcoming doses
const GRACE_PERIOD_MINUTES = 15; // Grace period before marking as missed
const REFILL_THRESHOLD = 10; // Pills remaining threshold for refill reminder

/**
 * Scheduled function to send dose reminders
 * Runs every 5 minutes via Cloud Scheduler
 */
exports.scheduledNotifier = functions.pubsub
  .schedule('every 5 minutes')
  .onRun(async (context) => {
    console.log('Running scheduledNotifier...');

    try {
      const now = new Date();
      const lookAheadTime = addMinutes(now, LOOKAHEAD_MINUTES);

      // Get all active schedules
      const schedulesSnapshot = await db
        .collection('schedules')
        .where('active', '==', true)
        .get();

      console.log(`Found ${schedulesSnapshot.size} active schedules`);

      const notificationPromises = [];

      for (const scheduleDoc of schedulesSnapshot.docs) {
        const schedule = scheduleDoc.data();
        const scheduleId = scheduleDoc.id;

        // Check if schedule is currently valid
        const startDate = schedule.startDate.toDate();
        const endDate = schedule.endDate ? schedule.endDate.toDate() : null;

        if (isAfter(now, startDate) && (!endDate || isBefore(now, endDate))) {
          // Process each time in the schedule
          for (const timeStr of schedule.times) {
            const scheduledTime = getScheduledTimeForToday(timeStr, schedule.timezone);

            // Check if this dose is within our lookahead window
            if (isAfter(scheduledTime, now) && isBefore(scheduledTime, lookAheadTime)) {
              notificationPromises.push(
                processDoseNotification(scheduleId, schedule, scheduledTime)
              );
            }
          }
        }
      }

      await Promise.all(notificationPromises);
      console.log(`Processed ${notificationPromises.length} dose notifications`);

      return null;
    } catch (error) {
      console.error('Error in scheduledNotifier:', error);
      throw error;
    }
  });

/**
 * Process a single dose notification
 */
async function processDoseNotification(scheduleId, schedule, scheduledTime) {
  try {
    // Check if dose log already exists
    const existingLogsSnapshot = await db
      .collection('doseLogs')
      .where('scheduleId', '==', scheduleId)
      .where('scheduledAt', '==', admin.firestore.Timestamp.fromDate(scheduledTime))
      .get();

    if (!existingLogsSnapshot.empty) {
      const existingLog = existingLogsSnapshot.docs[0].data();

      // Check if snoozed
      if (existingLog.snoozedUntil) {
        const snoozedUntil = existingLog.snoozedUntil.toDate();
        if (isAfter(new Date(), snoozedUntil)) {
          // Snooze period is over, send reminder
          await sendDoseReminder(scheduleId, schedule, existingLogsSnapshot.docs[0].id);
        }
        return;
      }

      // Don't send if already taken or skipped
      if (existingLog.status === 'taken' || existingLog.status === 'skipped') {
        return;
      }

      // Send reminder for existing scheduled dose
      await sendDoseReminder(scheduleId, schedule, existingLogsSnapshot.docs[0].id);
      return;
    }

    // Create new dose log
    const doseLogRef = await db.collection('doseLogs').add({
      userId: schedule.userId,
      scheduleId: scheduleId,
      medId: schedule.medId,
      scheduledAt: admin.firestore.Timestamp.fromDate(scheduledTime),
      takenAt: null,
      status: 'scheduled',
      snoozedUntil: null,
    });

    // Send notification
    await sendDoseReminder(scheduleId, schedule, doseLogRef.id);
  } catch (error) {
    console.error('Error processing dose notification:', error);
  }
}

/**
 * Send FCM notification for a dose reminder
 */
async function sendDoseReminder(scheduleId, schedule, doseLogId) {
  try {
    // Get user FCM tokens
    const userDoc = await db.collection('users').doc(schedule.userId).get();
    if (!userDoc.exists) {
      console.error('User not found:', schedule.userId);
      return;
    }

    const userData = userDoc.data();
    const fcmTokens = userData.fcmTokens || {};
    const tokens = Object.keys(fcmTokens).filter((token) => fcmTokens[token] === true);

    if (tokens.length === 0) {
      console.log('No FCM tokens for user:', schedule.userId);
      return;
    }

    // Get medication details
    const medDoc = await db.collection('medications').doc(schedule.medId).get();
    const medName = medDoc.exists ? medDoc.data().name : 'Your medication';

    // Prepare notification
    const message = {
      notification: {
        title: 'Time to take your medicine',
        body: `${medName} - ${schedule.instructions || 'Take as prescribed'}`,
      },
      data: {
        scheduleId: scheduleId,
        doseLogId: doseLogId,
        type: 'reminder',
      },
      tokens: tokens,
    };

    // Send notification
    const response = await messaging.sendEachForMulticast(message);
    console.log(`Sent ${response.successCount} notifications, ${response.failureCount} failures`);

    // Remove invalid tokens
    if (response.failureCount > 0) {
      const tokensToRemove = {};
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          tokensToRemove[`fcmTokens.${tokens[idx]}`] = admin.firestore.FieldValue.delete();
        }
      });

      if (Object.keys(tokensToRemove).length > 0) {
        await db.collection('users').doc(schedule.userId).update(tokensToRemove);
      }
    }
  } catch (error) {
    console.error('Error sending dose reminder:', error);
  }
}

/**
 * Detect missed doses and notify caregivers
 * Runs every 15 minutes
 */
exports.missedDetector = functions.pubsub
  .schedule('every 15 minutes')
  .onRun(async (context) => {
    console.log('Running missedDetector...');

    try {
      const now = new Date();
      const gracePeriodAgo = addMinutes(now, -GRACE_PERIOD_MINUTES);

      // Find scheduled doses that are past grace period
      const missedLogsSnapshot = await db
        .collection('doseLogs')
        .where('status', '==', 'scheduled')
        .where('scheduledAt', '<', admin.firestore.Timestamp.fromDate(gracePeriodAgo))
        .get();

      console.log(`Found ${missedLogsSnapshot.size} potentially missed doses`);

      const updatePromises = [];

      for (const logDoc of missedLogsSnapshot.docs) {
        const log = logDoc.data();

        // Check if snoozed
        if (log.snoozedUntil && isAfter(log.snoozedUntil.toDate(), now)) {
          continue; // Still snoozed
        }

        // Mark as missed
        updatePromises.push(
          logDoc.ref.update({ status: 'missed' }).then(() => {
            return notifyCaregivers(log);
          })
        );
      }

      await Promise.all(updatePromises);
      console.log(`Updated ${updatePromises.length} missed doses`);

      return null;
    } catch (error) {
      console.error('Error in missedDetector:', error);
      throw error;
    }
  });

/**
 * Notify caregivers about missed doses
 */
async function notifyCaregivers(doseLog) {
  try {
    // Get user's family members
    const userDoc = await db.collection('users').doc(doseLog.userId).get();
    if (!userDoc.exists) return;

    const userData = userDoc.data();
    const familyIds = userData.family || [];

    if (familyIds.length === 0) return;

    // Get medication details
    const medDoc = await db.collection('medications').doc(doseLog.medId).get();
    const medName = medDoc.exists ? medDoc.data().name : 'medication';

    // Notify each family member
    for (const familyId of familyIds) {
      const familyDoc = await db.collection('users').doc(familyId).get();
      if (!familyDoc.exists) continue;

      const familyData = familyDoc.data();
      const fcmTokens = familyData.fcmTokens || {};
      const tokens = Object.keys(fcmTokens).filter((token) => fcmTokens[token] === true);

      if (tokens.length === 0) continue;

      const message = {
        notification: {
          title: 'Missed Dose Alert',
          body: `${userData.name} missed their ${medName} dose`,
        },
        data: {
          userId: doseLog.userId,
          type: 'missed_alert',
        },
        tokens: tokens,
      };

      await messaging.sendEachForMulticast(message);
    }
  } catch (error) {
    console.error('Error notifying caregivers:', error);
  }
}

/**
 * Check for low medication inventory and send refill reminders
 * Runs daily at 9 AM
 */
exports.refillReminderWorker = functions.pubsub
  .schedule('0 9 * * *')
  .timeZone('Asia/Kolkata')
  .onRun(async (context) => {
    console.log('Running refillReminderWorker...');

    try {
      // Find medications with low inventory
      const lowInventorySnapshot = await db
        .collection('medications')
        .where('pillsRemaining', '<=', REFILL_THRESHOLD)
        .where('pillsRemaining', '>', 0)
        .get();

      console.log(`Found ${lowInventorySnapshot.size} medications needing refill`);

      for (const medDoc of lowInventorySnapshot.docs) {
        const med = medDoc.data();

        // Get user FCM tokens
        const userDoc = await db.collection('users').doc(med.userId).get();
        if (!userDoc.exists) continue;

        const userData = userDoc.data();
        const fcmTokens = userData.fcmTokens || {};
        const tokens = Object.keys(fcmTokens).filter((token) => fcmTokens[token] === true);

        if (tokens.length === 0) continue;

        const message = {
          notification: {
            title: 'Refill Reminder',
            body: `${med.name} is running low (${med.pillsRemaining} pills remaining)`,
          },
          data: {
            medId: medDoc.id,
            type: 'refill',
          },
          tokens: tokens,
        };

        await messaging.sendEachForMulticast(message);
      }

      return null;
    } catch (error) {
      console.error('Error in refillReminderWorker:', error);
      throw error;
    }
  });

/**
 * Dialogflow webhook fulfillment (placeholder)
 * Can be extended with actual Dialogflow ES integration
 */
exports.dialogflowFulfillment = functions.https.onRequest(async (req, res) => {
  console.log('Dialogflow webhook called');

  try {
    const intentName = req.body.queryResult.intent.displayName;
    const parameters = req.body.queryResult.parameters;

    let responseText = 'I can help you with your medication schedule.';

    // Handle different intents
    switch (intentName) {
      case 'GetSchedule':
        responseText = 'To view your schedule, please check the Schedules page in the app.';
        break;
      case 'MedicationInfo':
        responseText = 'For specific medication information, please consult your healthcare provider.';
        break;
      default:
        responseText = 'I\'m here to help with your medications. What would you like to know?';
    }

    res.json({
      fulfillmentText: responseText,
    });
  } catch (error) {
    console.error('Error in dialogflowFulfillment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Helper function to get scheduled time for today in user's timezone
 */
function getScheduledTimeForToday(timeStr, timezone) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const now = new Date();
  const zonedNow = utcToZonedTime(now, timezone);

  zonedNow.setHours(hours, minutes, 0, 0);

  return zonedTimeToUtc(zonedNow, timezone);
}

