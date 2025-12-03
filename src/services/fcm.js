import { getToken, onMessage } from 'firebase/messaging';
import { doc, updateDoc } from 'firebase/firestore';
import { getMessagingInstance } from '../config/firebase';
import { db } from '../config/firebase';
import toast from 'react-hot-toast';

const VAPID_KEY = import.meta.env.VITE_FCM_VAPID_KEY;

/**
 * Request notification permission and get FCM token
 */
export const requestNotificationPermission = async (userId) => {
  try {
    const messaging = getMessagingInstance();
    if (!messaging) {
      console.warn('Firebase Messaging not supported in this browser');
      return null;
    }

    // Request permission
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('Notification permission granted');
      
      // Get FCM token
      const token = await getToken(messaging, { vapidKey: VAPID_KEY });
      
      if (token) {
        console.log('FCM Token:', token);
        
        // Save token to Firestore
        if (userId) {
          const userRef = doc(db, 'users', userId);
          await updateDoc(userRef, {
            [`fcmTokens.${token}`]: true,
          });
          console.log('FCM token saved to Firestore');
        }
        
        return token;
      } else {
        console.log('No registration token available');
        return null;
      }
    } else {
      console.log('Notification permission denied');
      return null;
    }
  } catch (error) {
    console.error('Error getting notification permission:', error);
    return null;
  }
};

/**
 * Setup foreground message listener
 */
export const setupForegroundMessageListener = () => {
  const messaging = getMessagingInstance();
  if (!messaging) {
    console.warn('Firebase Messaging not supported');
    return () => {};
  }

  const unsubscribe = onMessage(messaging, (payload) => {
    console.log('Foreground message received:', payload);
    
    const { notification, data } = payload;
    
    if (notification) {
      // Show simple toast notification
      toast.success(`${notification.title}\n${notification.body}`, {
        duration: 5000,
        position: 'top-right',
      });
      
      // Deep link to schedule or dose if needed
      if (data?.scheduleId) {
        setTimeout(() => {
          window.location.href = `/dashboard`;
        }, 1000);
      }
    }
  });

  return unsubscribe;
};

/**
 * Remove FCM token from Firestore (on logout)
 */
export const removeFCMToken = async (userId, token) => {
  if (!userId || !token) return;
  
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      [`fcmTokens.${token}`]: null,
    });
    console.log('FCM token removed from Firestore');
  } catch (error) {
    console.error('Error removing FCM token:', error);
  }
};

