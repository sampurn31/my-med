// Firebase Messaging Service Worker
// This file handles background push notifications

importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js');

// Initialize Firebase in the service worker
// Note: These values will be replaced during build or should match your Firebase config
firebase.initializeApp({
  apiKey: "AIzaSyAUWhR-MihieN12R9Yjrx9Q1G3sVHrUuEI",
  authDomain: "my-meds-prod-9c9a8.firebaseapp.com",
  projectId: "my-meds-prod-9c9a8",
  storageBucket: "my-meds-prod-9c9a8.firebasestorage.app",
  messagingSenderId: "439942736552",
  appId: "1:439942736552:web:13befc15687cc5f91d309d"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);
  
  const notificationTitle = payload.notification?.title || 'My Meds Reminder';
  const notificationOptions = {
    body: payload.notification?.body || 'Time to take your medicine',
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    tag: payload.data?.scheduleId || 'default',
    data: payload.data,
    requireInteraction: true,
    actions: [
      {
        action: 'taken',
        title: 'Mark as Taken'
      },
      {
        action: 'snooze',
        title: 'Snooze 10min'
      }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click received:', event);
  
  event.notification.close();
  
  const action = event.action;
  const scheduleId = event.notification.data?.scheduleId;
  
  let urlToOpen = '/';
  
  if (action === 'taken' && scheduleId) {
    urlToOpen = `/dashboard?action=taken&scheduleId=${scheduleId}`;
  } else if (action === 'snooze' && scheduleId) {
    urlToOpen = `/dashboard?action=snooze&scheduleId=${scheduleId}`;
  } else if (scheduleId) {
    urlToOpen = `/schedule/${scheduleId}`;
  }
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window open
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === new URL(urlToOpen, self.location.origin).href && 'focus' in client) {
          return client.focus();
        }
      }
      // If not, open a new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

