# Technical Deep Dive - My Meds Application

**For Advanced Technical Questions During Presentation**

---

## 📋 Table of Contents
1. [Application Architecture](#application-architecture)
2. [Authentication System](#authentication-system)
3. [Database Design](#database-design)
4. [Notification System](#notification-system)
5. [State Management](#state-management)
6. [Security Implementation](#security-implementation)
7. [PWA Implementation](#pwa-implementation)
8. [Cloud Functions](#cloud-functions)
9. [Performance Optimizations](#performance-optimizations)
10. [Error Handling](#error-handling)

---

## 🏗️ Application Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                         │
│  ┌────────────────────────────────────────────────┐     │
│  │           React Application (SPA)               │     │
│  │  ┌──────────────────────────────────────────┐  │     │
│  │  │  UI Components (Pages + Components)      │  │     │
│  │  │  - Dashboard.jsx                          │  │     │
│  │  │  - Medications.jsx                        │  │     │
│  │  │  - Schedules.jsx                          │  │     │
│  │  │  - Family.jsx                             │  │     │
│  │  │  - Chatbot.jsx                            │  │     │
│  │  └──────────────────────────────────────────┘  │     │
│  │  ┌──────────────────────────────────────────┐  │     │
│  │  │  State Management                         │  │     │
│  │  │  - AuthContext (User session)            │  │     │
│  │  │  - React Hooks (useState, useEffect)     │  │     │
│  │  └──────────────────────────────────────────┘  │     │
│  │  ┌──────────────────────────────────────────┐  │     │
│  │  │  Service Layer                            │  │     │
│  │  │  - medications.js                         │  │     │
│  │  │  - schedules.js                           │  │     │
│  │  │  - doseLogs.js                            │  │     │
│  │  │  - family.js                              │  │     │
│  │  │  - fcm.js                                 │  │     │
│  │  └──────────────────────────────────────────┘  │     │
│  └────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────┘
                         ↕ HTTP/HTTPS
┌─────────────────────────────────────────────────────────┐
│                   BACKEND LAYER                          │
│  ┌────────────────────────────────────────────────┐     │
│  │         Firebase Platform (BaaS)               │     │
│  │  ┌──────────────────────────────────────────┐  │     │
│  │  │ Firebase Authentication                  │  │     │
│  │  │ - Email/Password provider                │  │     │
│  │  │ - Google OAuth provider                  │  │     │
│  │  │ - JWT token management                   │  │     │
│  │  └──────────────────────────────────────────┘  │     │
│  │  ┌──────────────────────────────────────────┐  │     │
│  │  │ Cloud Firestore (Database)               │  │     │
│  │  │ - NoSQL document store                   │  │     │
│  │  │ - Real-time sync                         │  │     │
│  │  │ - Offline persistence                    │  │     │
│  │  └──────────────────────────────────────────┘  │     │
│  │  ┌──────────────────────────────────────────┐  │     │
│  │  │ Cloud Functions (Serverless)             │  │     │
│  │  │ - scheduledNotifier                      │  │     │
│  │  │ - missedDetector                         │  │     │
│  │  │ - refillReminderWorker                   │  │     │
│  │  └──────────────────────────────────────────┘  │     │
│  │  ┌──────────────────────────────────────────┐  │     │
│  │  │ Cloud Storage                            │  │     │
│  │  │ - Medication photos                      │  │     │
│  │  └──────────────────────────────────────────┘  │     │
│  │  ┌──────────────────────────────────────────┐  │     │
│  │  │ Firebase Cloud Messaging (FCM)           │  │     │
│  │  │ - Push notification delivery             │  │     │
│  │  └──────────────────────────────────────────┘  │     │
│  └────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────┘
```

### Design Patterns Used

1. **Single Page Application (SPA)**
   - React Router for client-side routing
   - No page reloads, better UX

2. **Service Layer Pattern**
   - Business logic separated from UI
   - Reusable functions across components
   - Located in `src/services/`

3. **Context Pattern**
   - AuthContext for global user state
   - Avoids prop drilling

4. **Serverless Architecture**
   - Cloud Functions for backend logic
   - Auto-scaling, pay-per-use

5. **Progressive Enhancement**
   - Works without notifications
   - Works offline with cached data

---

## 🔐 Authentication System

### Implementation Details

**File:** `src/contexts/AuthContext.jsx`

**Key Components:**

1. **Firebase Authentication Integration**
```javascript
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';

const auth = getAuth(app);
```

2. **User Session Management**
```javascript
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      // User logged in
      setCurrentUser(user);
      await syncUserProfile(user);
    } else {
      // User logged out
      setCurrentUser(null);
    }
    setLoading(false);
  });
  
  return unsubscribe; // Cleanup listener
}, []);
```

3. **Authentication Methods**

**Email/Password Signup:**
```javascript
async function signup(email, password, displayName) {
  // Create user account
  const result = await createUserWithEmailAndPassword(auth, email, password);
  
  // Update profile
  await updateProfile(result.user, { displayName });
  
  // Create user document in Firestore
  await setDoc(doc(db, 'users', result.user.uid), {
    email,
    displayName,
    createdAt: serverTimestamp(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });
  
  return result.user;
}
```

**Google OAuth:**
```javascript
async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  
  // Create or update user profile
  await setDoc(doc(db, 'users', result.user.uid), {
    email: result.user.email,
    displayName: result.user.displayName,
    photoURL: result.user.photoURL,
    lastLogin: serverTimestamp()
  }, { merge: true }); // Merge prevents overwriting existing data
  
  return result.user;
}
```

4. **Protected Routes**
```javascript
function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  
  return currentUser ? children : <Navigate to="/login" />;
}
```

### Security Features

- **JWT Tokens:** Automatically managed by Firebase SDK
- **Session Persistence:** localStorage (can be changed to sessionStorage)
- **HTTPS Only:** Enforced by Firebase Auth
- **Rate Limiting:** Built into Firebase (prevents brute force)
- **Email Verification:** Can be enabled (optional feature)

---

## 🗄️ Database Design

### Firestore Schema

**Collection: `users`**
```javascript
users/{userId}
{
  email: string,
  displayName: string,
  timezone: string,  // e.g., "America/New_York"
  fcmToken: string,  // For push notifications
  photoURL: string,  // Optional
  createdAt: timestamp,
  updatedAt: timestamp
}
```

**Collection: `medications`**
```javascript
medications/{medicationId}
{
  userId: string,        // Owner
  name: string,          // e.g., "Aspirin"
  dosage: string,        // e.g., "100mg"
  type: string,          // e.g., "Tablet", "Liquid"
  refillAmount: number,  // e.g., 30
  currentAmount: number, // Decremented on each dose
  photoURL: string,      // Optional, from Storage
  notes: string,         // Optional
  createdAt: timestamp,
  updatedAt: timestamp
}

// Indexes:
// - userId ASC
// - userId ASC, createdAt DESC
```

**Collection: `schedules`**
```javascript
schedules/{scheduleId}
{
  userId: string,
  medicationId: string,
  medicationName: string,  // Denormalized for faster queries
  dosage: string,          // Denormalized
  
  frequency: string,       // "daily", "weekly", "asNeeded"
  
  // For daily/weekly schedules:
  times: [string],         // ["09:00", "21:00"]
  daysOfWeek: [number],    // [0,1,2,3,4,5,6] or subset
  
  // Calculated field:
  nextDoseAt: timestamp,   // Next scheduled dose time
  
  isActive: boolean,
  createdAt: timestamp,
  updatedAt: timestamp
}

// Indexes:
// - userId ASC, isActive ASC, nextDoseAt ASC
// - nextDoseAt ASC, isActive ASC (for Cloud Functions)
```

**Collection: `doseLogs`**
```javascript
doseLogs/{logId}
{
  userId: string,
  scheduleId: string,
  medicationId: string,
  medicationName: string,  // Denormalized
  dosage: string,          // Denormalized
  
  scheduledFor: timestamp, // When it should be taken
  takenAt: timestamp,      // When actually taken
  
  action: string,          // "taken", "skipped", "snoozed"
  notes: string,           // Optional
  
  createdAt: timestamp
}

// Indexes:
// - userId ASC, createdAt DESC
// - scheduleId ASC, scheduledFor DESC
// - userId ASC, scheduledFor DESC
```

**Collection: `families`**
```javascript
families/{familyId}
{
  createdBy: string,       // userId
  members: [
    {
      userId: string,
      email: string,
      displayName: string,
      role: string,        // "owner", "caregiver"
      joinedAt: timestamp
    }
  ],
  createdAt: timestamp,
  updatedAt: timestamp
}

// Indexes:
// - members array-contains userId
```

**Collection: `notifications`** (Optional, for tracking)
```javascript
notifications/{notificationId}
{
  userId: string,
  type: string,           // "dose", "refill", "missed"
  scheduleId: string,     // Optional
  medicationName: string,
  sentAt: timestamp,
  readAt: timestamp,      // Optional
  deliveredAt: timestamp  // FCM delivery confirmation
}
```

### Database Patterns

1. **Denormalization:**
   - Store `medicationName` in schedules/logs
   - **Why?** Faster queries, no joins needed
   - **Trade-off?** Must update multiple documents if med name changes

2. **Composite Indexes:**
   - Created in `firestore.indexes.json`
   - Speeds up complex queries like:
     ```javascript
     schedulesRef
       .where('userId', '==', userId)
       .where('isActive', '==', true)
       .orderBy('nextDoseAt', 'asc')
     ```

3. **Timestamp Strategy:**
   - `createdAt`: Document creation time
   - `updatedAt`: Last modification time
   - `scheduledFor`: When action should occur
   - `takenAt`: When action actually occurred

---

## 🔔 Notification System

### Complete Flow

```
┌─────────────────────────────────────────────────────┐
│         1. USER CREATES SCHEDULE                     │
│  - User sets medication time: "09:00 AM"            │
│  - Saved to Firestore schedules collection          │
│  - nextDoseAt calculated: tomorrow 9:00 AM          │
└─────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│    2. CLOUD SCHEDULER TRIGGERS (Every 5 min)        │
│  - Google Cloud Scheduler                           │
│  - Publishes to Pub/Sub topic                       │
│  - Triggers scheduledNotifier function              │
└─────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│    3. SCHEDULED NOTIFIER FUNCTION RUNS              │
│                                                      │
│  const now = new Date();                            │
│  const soon = new Date(now.getTime() + 15 * 60000); │
│                                                      │
│  // Query Firestore                                 │
│  const schedules = await db.collection('schedules') │
│    .where('isActive', '==', true)                   │
│    .where('nextDoseAt', '>=', now)                  │
│    .where('nextDoseAt', '<=', soon)                 │
│    .get();                                          │
└─────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│    4. CHECK IF ALREADY TAKEN                        │
│                                                      │
│  for (schedule of schedules) {                      │
│    // Check dose logs                               │
│    const logs = await db.collection('doseLogs')    │
│      .where('scheduleId', '==', schedule.id)       │
│      .where('scheduledFor', '==', schedule.nextDose)│
│      .limit(1)                                      │
│      .get();                                        │
│                                                      │
│    if (logs.empty) {                                │
│      // Not taken yet, send notification            │
│    }                                                 │
│  }                                                  │
└─────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│    5. GET USER FCM TOKEN                            │
│                                                      │
│  const user = await db.collection('users')          │
│    .doc(schedule.userId)                            │
│    .get();                                          │
│                                                      │
│  const fcmToken = user.data().fcmToken;             │
└─────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│    6. SEND FCM NOTIFICATION                         │
│                                                      │
│  await admin.messaging().send({                     │
│    token: fcmToken,                                 │
│    notification: {                                  │
│      title: "Time for Aspirin",                     │
│      body: "100mg - Take with water"                │
│    },                                               │
│    data: {                                          │
│      scheduleId: schedule.id,                       │
│      medicationId: schedule.medicationId,           │
│      type: "dose_reminder"                          │
│    },                                               │
│    webpush: {                                       │
│      notification: {                                │
│        icon: "/pwa-192x192.png",                    │
│        badge: "/pwa-192x192.png",                   │
│        requireInteraction: true                     │
│      }                                              │
│    }                                                │
│  });                                                │
└─────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│    7. FCM DELIVERS TO DEVICE                        │
│  - Google FCM infrastructure                        │
│  - Uses WebPush protocol                            │
│  - Delivers even if app is closed                   │
└─────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│    8. SERVICE WORKER RECEIVES                       │
│  - firebase-messaging-sw.js                         │
│  - Runs in background                               │
│                                                      │
│  messaging.onBackgroundMessage((payload) => {       │
│    self.registration.showNotification(              │
│      payload.notification.title,                    │
│      {                                              │
│        body: payload.notification.body,             │
│        icon: '/pwa-192x192.png',                    │
│        data: payload.data,                          │
│        actions: [                                   │
│          { action: 'taken', title: 'Mark Taken' },  │
│          { action: 'snooze', title: 'Snooze 10m' }  │
│        ]                                            │
│      }                                              │
│    );                                               │
│  });                                                │
└─────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│    9. USER SEES NOTIFICATION                        │
│  - Native OS notification appears                   │
│  - Even if browser/app is closed                    │
│  - User can tap action buttons                      │
└─────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│    10. USER TAPS "MARK TAKEN"                       │
│                                                      │
│  self.addEventListener('notificationclick', (e) => {│
│    if (e.action === 'taken') {                      │
│      // Open app with action parameter              │
│      clients.openWindow(                            │
│        `/dashboard?action=taken&scheduleId=${id}`   │
│      );                                             │
│    }                                                │
│  });                                                │
└─────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│    11. APP OPENS & LOGS DOSE                        │
│  - Dashboard component reads URL params             │
│  - Calls doseLogs.logDose(scheduleId, 'taken')     │
│  - Creates document in doseLogs collection          │
│  - Updates UI to show "✓ Taken"                     │
│  - Decrements medication currentAmount              │
└─────────────────────────────────────────────────────┘
```

### FCM Token Management

**File:** `src/services/fcm.js`

```javascript
export async function requestNotificationPermission(userId) {
  // 1. Request browser permission
  const permission = await Notification.requestPermission();
  
  if (permission === 'granted') {
    // 2. Get FCM token
    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FCM_VAPID_KEY
    });
    
    // 3. Save token to Firestore user document
    await updateDoc(doc(db, 'users', userId), {
      fcmToken: token,
      fcmTokenUpdatedAt: serverTimestamp()
    });
    
    return token;
  }
  
  throw new Error('Notification permission denied');
}
```

### Handling Token Refresh

```javascript
// Token can expire or change, listen for updates
onTokenRefresh(messaging, async () => {
  const newToken = await getToken(messaging);
  await updateUserFCMToken(currentUser.uid, newToken);
});
```

---

## 🧠 State Management

### AuthContext Pattern

**File:** `src/contexts/AuthContext.jsx`

```javascript
const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    
    return unsubscribe; // Cleanup on unmount
  }, []);
  
  const value = {
    currentUser,
    signup,
    login,
    logout,
    loginWithGoogle
  };
  
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
```

### Component State Patterns

**1. Firestore Real-time Listener:**
```javascript
useEffect(() => {
  const unsubscribe = onSnapshot(
    query(
      collection(db, 'medications'),
      where('userId', '==', currentUser.uid)
    ),
    (snapshot) => {
      const meds = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMedications(meds);
    }
  );
  
  return unsubscribe; // Cleanup
}, [currentUser]);
```

**2. Optimistic Updates:**
```javascript
async function takeDose(scheduleId) {
  // Update UI immediately
  setDoses(prev => prev.map(d => 
    d.id === scheduleId ? { ...d, status: 'taken' } : d
  ));
  
  try {
    // Save to Firestore
    await logDose(scheduleId, 'taken');
  } catch (error) {
    // Revert on error
    setDoses(prev => prev.map(d => 
      d.id === scheduleId ? { ...d, status: 'pending' } : d
    ));
    toast.error('Failed to log dose');
  }
}
```

---

## 🔒 Security Implementation

### Firestore Security Rules

**File:** `firestore.rules`

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to check if user owns the document
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Helper function to check if user is in a family with another user
    function isInFamily(otherUserId) {
      return isAuthenticated() && 
        exists(/databases/$(database)/documents/families/$(request.auth.uid + '_' + otherUserId)) ||
        exists(/databases/$(database)/documents/families/$(otherUserId + '_' + request.auth.uid));
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isOwner(userId);
      allow create: if isAuthenticated() && request.auth.uid == userId;
      allow update: if isOwner(userId);
      allow delete: if false; // Prevent deletion
    }
    
    // Medications collection
    match /medications/{medId} {
      allow read: if isOwner(resource.data.userId) || 
                     isInFamily(resource.data.userId);
      allow create: if isAuthenticated() && 
                       request.resource.data.userId == request.auth.uid;
      allow update, delete: if isOwner(resource.data.userId);
    }
    
    // Schedules collection
    match /schedules/{schedId} {
      allow read: if isOwner(resource.data.userId) || 
                     isInFamily(resource.data.userId);
      allow create: if isAuthenticated() && 
                       request.resource.data.userId == request.auth.uid;
      allow update, delete: if isOwner(resource.data.userId);
    }
    
    // Dose logs collection
    match /doseLogs/{logId} {
      allow read: if isOwner(resource.data.userId) || 
                     isInFamily(resource.data.userId);
      allow create: if isAuthenticated() && 
                       request.resource.data.userId == request.auth.uid;
      allow update, delete: if isOwner(resource.data.userId);
    }
    
    // Families collection
    match /families/{familyId} {
      allow read: if isAuthenticated() && 
                     request.auth.uid in resource.data.members;
      allow create: if isAuthenticated();
      allow update: if isAuthenticated() && 
                       request.auth.uid in resource.data.members;
      allow delete: if isAuthenticated() && 
                       request.auth.uid == resource.data.createdBy;
    }
  }
}
```

### Storage Security Rules

**File:** `storage.rules`

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /medications/{userId}/{filename} {
      // Allow read if authenticated
      allow read: if request.auth != null;
      
      // Allow write only to own folder
      allow write: if request.auth != null && 
                      request.auth.uid == userId &&
                      request.resource.size < 5 * 1024 * 1024 && // Max 5MB
                      request.resource.contentType.matches('image/.*'); // Images only
    }
  }
}
```

---

## 📱 PWA Implementation

### Manifest Configuration

**File:** `public/manifest.json`

```json
{
  "name": "My Meds - Medication Reminder",
  "short_name": "My Meds",
  "description": "Smart medication reminder and scheduler",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#6366f1",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/pwa-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/pwa-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

### Vite PWA Configuration

**File:** `vite.config.js`

```javascript
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'pwa-192x192.png', 'pwa-512x512.png'],
      manifest: {
        // ... manifest config
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/firestore\.googleapis\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'firestore-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          }
        ]
      }
    })
  ]
});
```

### Service Worker Strategies

1. **NetworkFirst:** For API calls (Firestore)
   - Try network first
   - Fall back to cache if offline
   - Good for data that changes frequently

2. **CacheFirst:** For static assets (fonts, images)
   - Check cache first
   - Faster load times
   - Good for data that rarely changes

---

## ☁️ Cloud Functions

### scheduledNotifier Function

**File:** `functions/index.js`

```javascript
exports.scheduledNotifier = functions.pubsub
  .schedule('every 5 minutes')
  .onRun(async (context) => {
    const now = admin.firestore.Timestamp.now();
    const soon = admin.firestore.Timestamp.fromMillis(
      now.toMillis() + 15 * 60 * 1000 // 15 minutes from now
    );
    
    // Get schedules due soon
    const schedulesSnapshot = await db.collection('schedules')
      .where('isActive', '==', true)
      .where('nextDoseAt', '>=', now)
      .where('nextDoseAt', '<=', soon)
      .get();
    
    const notifications = [];
    
    for (const doc of schedulesSnapshot.docs) {
      const schedule = { id: doc.id, ...doc.data() };
      
      // Check if already taken
      const logsSnapshot = await db.collection('doseLogs')
        .where('scheduleId', '==', schedule.id)
        .where('scheduledFor', '==', schedule.nextDoseAt)
        .limit(1)
        .get();
      
      if (logsSnapshot.empty) {
        // Not taken yet, get user FCM token
        const userDoc = await db.collection('users').doc(schedule.userId).get();
        const fcmToken = userDoc.data().fcmToken;
        
        if (fcmToken) {
          notifications.push({
            token: fcmToken,
            notification: {
              title: `Time for ${schedule.medicationName}`,
              body: `${schedule.dosage} - ${schedule.notes || 'Take your medication'}`
            },
            data: {
              scheduleId: schedule.id,
              medicationId: schedule.medicationId,
              type: 'dose_reminder'
            },
            webpush: {
              notification: {
                icon: '/pwa-192x192.png',
                badge: '/pwa-192x192.png',
                requireInteraction: true
              }
            }
          });
        }
      }
    }
    
    // Send all notifications
    if (notifications.length > 0) {
      await admin.messaging().sendAll(notifications);
      console.log(`Sent ${notifications.length} notifications`);
    }
    
    return null;
  });
```

---

## ⚡ Performance Optimizations

### 1. Code Splitting

```javascript
// Lazy load pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Medications = lazy(() => import('./pages/Medications'));

// Usage in router
<Suspense fallback={<LoadingSpinner />}>
  <Routes>
    <Route path="/dashboard" element={<Dashboard />} />
  </Routes>
</Suspense>
```

### 2. Firestore Query Optimization

```javascript
// Good: Use indexes, limit results
const meds = await getDocs(
  query(
    collection(db, 'medications'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(50)
  )
);

// Bad: Fetching all documents
const allMeds = await getDocs(collection(db, 'medications'));
```

### 3. Image Optimization

```javascript
// Compress before upload
async function uploadMedicationPhoto(file) {
  // Check size
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('File too large');
  }
  
  // Upload
  const storageRef = ref(storage, `medications/${userId}/${file.name}`);
  await uploadBytes(storageRef, file);
  
  return await getDownloadURL(storageRef);
}
```

---

## 🐛 Error Handling

### Global Error Boundary

```javascript
class ErrorBoundary extends React.Component {
  state = { hasError: false };
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Error caught:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

### Service Layer Error Handling

```javascript
export async function createMedication(data) {
  try {
    const docRef = await addDoc(collection(db, 'medications'), {
      ...data,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating medication:', error);
    
    if (error.code === 'permission-denied') {
      throw new Error('You do not have permission to create medications');
    } else if (error.code === 'unavailable') {
      throw new Error('Database unavailable. Please check your connection');
    } else {
      throw new Error('Failed to create medication. Please try again');
    }
  }
}
```

---

**Document Version:** 1.0
**Last Updated:** November 27, 2025
**Purpose:** Technical deep dive for advanced presentation questions




