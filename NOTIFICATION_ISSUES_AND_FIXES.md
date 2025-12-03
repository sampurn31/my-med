# Notification System - Issues & Fixes

**Current Status:** ❌ Notifications NOT working on phone  
**Root Causes:** 5 critical issues identified

---

## 🔍 ISSUES IDENTIFIED

### Issue 1: ❌ **Using Wrong Notification System in App.jsx**

**Problem:**
`App.jsx` is using the client-side browser notification system (`clientNotifications.js`) instead of FCM (Firebase Cloud Messaging).

**Current Code (Line 109):**
```javascript
requestClientNotificationPermission().then((granted) => {
  if (granted) {
    console.log('Notification permission granted');
    // Start client-side notification scheduler
    startNotificationScheduler(currentUser.uid);
  }
});
```

**Why This Fails on Phone:**
- Client-side notifications use browser `Notification` API
- Requires app to be OPEN and running
- Doesn't work with Cloud Functions
- Stops when browser/PWA closes
- No FCM token registration happening

---

### Issue 2: ❌ **Service Worker Has Placeholder Config**

**Problem:**
`public/firebase-messaging-sw.js` has placeholder values instead of real Firebase config.

**Current Code (Lines 9-16):**
```javascript
firebase.initializeApp({
  apiKey: "YOUR_API_KEY",           // ❌ PLACEHOLDER
  authDomain: "YOUR_AUTH_DOMAIN",   // ❌ PLACEHOLDER
  projectId: "YOUR_PROJECT_ID",     // ❌ PLACEHOLDER
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
});
```

**Why This Fails:**
- Service worker can't connect to Firebase
- Background notifications won't work
- FCM can't deliver messages

---

### Issue 3: ⚠️ **No FCM Token Registration**

**Problem:**
App never calls `requestNotificationPermission(userId)` from `fcm.js` which registers FCM tokens.

**What's Missing:**
```javascript
import { requestNotificationPermission } from './services/fcm';
await requestNotificationPermission(currentUser.uid);
```

**Why This Matters:**
- Cloud Functions need FCM tokens to send notifications
- Tokens stored in Firestore: `users/{userId}/fcmTokens`
- Without tokens, Cloud Functions can't target your device

---

### Issue 4: ⚠️ **Cloud Functions May Not Be Deployed**

**Problem:**
Cloud Functions might not be deployed to Firebase.

**Check Status:**
```bash
firebase functions:list
```

**Expected Functions:**
- `scheduledNotifier` - Sends dose reminders every 5 minutes
- `missedDetector` - Detects missed doses every 15 minutes  
- `refillReminderWorker` - Daily refill reminders

**If Not Deployed:**
```bash
firebase deploy --only functions
```

---

### Issue 5: ⚠️ **Cloud Scheduler May Not Be Enabled**

**Problem:**
Cloud Functions use Pub/Sub triggers which require Cloud Scheduler.

**Check:**
Go to: https://console.cloud.google.com/cloudscheduler

**If Not Enabled:**
- Select your Firebase project
- Click "Enable API"

---

## ✅ COMPLETE FIX

### Step 1: Update `public/firebase-messaging-sw.js`

**Replace placeholder values with YOUR actual Firebase config:**

```javascript
// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js');

// REPLACE THESE WITH YOUR ACTUAL VALUES FROM .env
firebase.initializeApp({
  apiKey: "YOUR_ACTUAL_API_KEY_FROM_ENV",
  authDomain: "YOUR_ACTUAL_AUTH_DOMAIN",
  projectId: "YOUR_ACTUAL_PROJECT_ID",
  storageBucket: "YOUR_ACTUAL_STORAGE_BUCKET",
  messagingSenderId: "YOUR_ACTUAL_SENDER_ID",
  appId: "YOUR_ACTUAL_APP_ID"
});

const messaging = firebase.messaging();

// ... rest of the file stays the same
```

**How to get values:**
1. Open your `.env` file
2. Copy the values (without `VITE_` prefix)
3. Replace in service worker

---

### Step 2: Update `src/App.jsx` to Use FCM

**Replace the entire notification section:**

**Find this code (lines 101-127):**
```javascript
useEffect(() => {
  if (currentUser) {
    // Sync today's dose logs on app start
    syncTodayDoseLogs(currentUser.uid).then(() => {
      console.log('Initial dose logs sync completed');
    });

    // Request notification permission
    requestClientNotificationPermission().then((granted) => {  // ❌ WRONG
      if (granted) {
        console.log('Notification permission granted');
        // Start client-side notification scheduler
        startNotificationScheduler(currentUser.uid);  // ❌ WRONG
      } else {
        console.warn('Notification permission denied');
      }
    });
    
    return () => {
      // Stop scheduler when user logs out
      stopNotificationScheduler();
    };
  } else {
    // Stop scheduler if no user
    stopNotificationScheduler();
  }
}, [currentUser]);
```

**Replace with:**
```javascript
useEffect(() => {
  if (currentUser) {
    // Sync today's dose logs on app start
    syncTodayDoseLogs(currentUser.uid).then(() => {
      console.log('Initial dose logs sync completed');
    });

    // ✅ NEW: Request FCM notification permission
    import('./services/fcm').then(({ requestNotificationPermission }) => {
      requestNotificationPermission(currentUser.uid).then((token) => {
        if (token) {
          console.log('✅ FCM token registered:', token.substring(0, 20) + '...');
        } else {
          console.warn('❌ FCM token registration failed');
          
          // Fallback to client-side notifications
          console.log('Falling back to client-side notifications...');
          requestClientNotificationPermission().then((granted) => {
            if (granted) {
              startNotificationScheduler(currentUser.uid);
            }
          });
        }
      });
    });
    
    return () => {
      // Stop client-side scheduler when user logs out
      stopNotificationScheduler();
    };
  } else {
    stopNotificationScheduler();
  }
}, [currentUser]);
```

**Alternative (cleaner approach) - Update the imports at top:**

```javascript
// At the top of App.jsx, change import line 9:
import { 
  requestNotificationPermission as requestFCMPermission
} from './services/fcm';
import { 
  startNotificationScheduler, 
  stopNotificationScheduler,
  requestNotificationPermission as requestClientNotificationPermission 
} from './services/clientNotifications';
```

**Then update useEffect:**
```javascript
useEffect(() => {
  if (currentUser) {
    // Sync today's dose logs
    syncTodayDoseLogs(currentUser.uid).then(() => {
      console.log('Initial dose logs sync completed');
    });

    // Try FCM first (for Cloud Functions support)
    requestFCMPermission(currentUser.uid).then((token) => {
      if (token) {
        console.log('✅ FCM enabled - Cloud Functions will send notifications');
      } else {
        // Fallback to client-side notifications
        console.log('⚠️ FCM failed, using client-side notifications');
        requestClientNotificationPermission().then((granted) => {
          if (granted) {
            startNotificationScheduler(currentUser.uid);
          }
        });
      }
    }).catch(() => {
      // Fallback on error
      requestClientNotificationPermission().then((granted) => {
        if (granted) {
          startNotificationScheduler(currentUser.uid);
        }
      });
    });
    
    return () => {
      stopNotificationScheduler();
    };
  } else {
    stopNotificationScheduler();
  }
}, [currentUser]);
```

---

### Step 3: Deploy Cloud Functions

**In terminal:**
```bash
# Make sure you're in project root
cd /path/to/My-Meds

# Login to Firebase (if not already)
firebase login

# Select your project
firebase use --add
# Choose your project from the list
# Enter alias: default

# Deploy functions
firebase deploy --only functions
```

**Expected output:**
```
✔ functions[scheduledNotifier] Successful create operation.
✔ functions[missedDetector] Successful create operation.
✔ functions[refillReminderWorker] Successful create operation.
✔ Deploy complete!
```

---

### Step 4: Enable Cloud Scheduler

1. Go to: https://console.cloud.google.com/cloudscheduler
2. Select your Firebase project from dropdown
3. Click "Enable API"
4. Wait for activation (~30 seconds)

---

### Step 5: Verify Setup

**Check Firebase Console:**

1. Go to: https://console.firebase.google.com/
2. Select your project
3. Go to **Functions** → Should see 3-4 functions listed
4. Go to **Cloud Messaging** → Should see "Web Push certificates" with VAPID key

**Check Your App:**

1. Open app on your phone
2. Open browser console (if using Chrome on Android)
3. Look for:
   ```
   ✅ FCM token registered: ey...
   FCM Token: ey...
   FCM token saved to Firestore
   ```

**Check Firestore:**

1. Go to Firestore Database
2. Open `users` collection
3. Find your user document
4. Should have `fcmTokens` field with a token

---

## 🧪 TESTING NOTIFICATIONS

### Test 1: Verify FCM Token Registration

**In browser console:**
```javascript
// Check if FCM token is saved
const userId = 'YOUR_USER_ID'; // Get from Firebase Auth
const userDoc = await firebase.firestore().collection('users').doc(userId).get();
console.log('FCM Tokens:', userDoc.data().fcmTokens);
// Should show: { "ey...": true }
```

---

### Test 2: Create a Test Schedule

1. Add a medication
2. Create a schedule for **5 minutes from now**
3. Wait for notification

**What should happen:**
- Cloud Function runs every 5 minutes
- Checks for upcoming doses (within 10 min window)
- Creates dose log
- Sends FCM notification to your device
- You receive notification on phone

---

### Test 3: Check Cloud Functions Logs

**In terminal:**
```bash
firebase functions:log
```

**Or in Firebase Console:**
1. Go to Functions
2. Click on `scheduledNotifier`
3. Click "Logs" tab
4. Should see execution logs every 5 minutes

**Expected logs:**
```
Running scheduledNotifier...
Found X active schedules
Sent 1 notifications, 0 failures
```

---

## 🐛 TROUBLESHOOTING

### Problem: "No FCM token available"

**Causes:**
1. Service worker not registered
2. Service worker has wrong config
3. VAPID key missing in .env

**Fix:**
1. Check `.env` has `VITE_FCM_VAPID_KEY`
2. Update `firebase-messaging-sw.js` with real config
3. Clear cache and reload
4. Unregister old service workers:
   ```javascript
   navigator.serviceWorker.getRegistrations().then(registrations => {
     registrations.forEach(r => r.unregister())
   })
   ```

---

### Problem: "Notification permission denied"

**Fix:**
1. Go to browser settings
2. Find site permissions
3. Allow notifications for your domain
4. On phone: Go to App Settings → Notifications → Enable

---

### Problem: "Cloud Functions not triggering"

**Check:**
1. Are functions deployed? `firebase functions:list`
2. Is Cloud Scheduler enabled?
3. Are there any errors in logs? `firebase functions:log`
4. Check billing: Cloud Functions require Blaze plan

---

### Problem: "Notifications work on desktop, not phone"

**Likely Issues:**
1. FCM token not registered for phone
2. Service worker not installed on phone
3. PWA not installed
4. Phone browser doesn't support FCM

**Fix:**
1. Install PWA on phone
2. Grant notification permission
3. Check if FCM token is saved in Firestore
4. Verify using Chrome on Android (best FCM support)

---

## 📱 PHONE-SPECIFIC SETUP

### For Android (Chrome/Samsung Internet):

1. **Install PWA:**
   - Open app in Chrome
   - Tap menu (⋮)
   - Tap "Install app" or "Add to Home Screen"
   - Open installed app

2. **Grant Permissions:**
   - App will prompt for notification permission
   - Tap "Allow"

3. **Verify:**
   - Check Settings → Apps → My Meds → Notifications → Enabled
   - Create test schedule
   - Close app completely
   - Wait for notification

### For iOS (Safari):

**Note:** iOS has limited FCM support

**Options:**
1. Use in Safari browser (notifications require browser open)
2. Use client-side notifications (fallback)
3. For production: Consider native app or send to App Store

---

## ✅ QUICK FIX CHECKLIST

**Before testing, ensure:**

- [ ] `.env` file has all Firebase config values
- [ ] `VITE_FCM_VAPID_KEY` is set in `.env`
- [ ] `firebase-messaging-sw.js` has REAL config (not placeholders)
- [ ] `App.jsx` calls FCM `requestNotificationPermission(userId)`
- [ ] Cloud Functions deployed (`firebase deploy --only functions`)
- [ ] Cloud Scheduler enabled in Google Cloud Console
- [ ] Firebase project on Blaze plan (for Cloud Functions)
- [ ] Notification permission granted in browser/phone
- [ ] PWA installed on phone (for best results)
- [ ] FCM token visible in Firestore `users/{userId}/fcmTokens`

---

## 🎯 RECOMMENDED APPROACH

### Option A: Cloud Functions (Production) ✅

**Pros:**
- Works even when app is closed
- Reliable server-side delivery
- Supports multiple devices
- Can notify caregivers

**Cons:**
- Requires Firebase Blaze plan (~$0-5/month for your usage)
- More complex setup

**Use if:** You want production-ready, reliable notifications

---

### Option B: Client-Side Only (Free) ⚠️

**Pros:**
- Completely FREE
- No billing required
- Works immediately
- Good for demos

**Cons:**
- Requires app/browser to be open
- Stops when app closes
- No caregiver notifications

**Use if:** College project, personal use, or demo

---

## 📝 FINAL NOTES

**Current State:**
- You're using client-side notifications
- They only work when app is open
- On phone, if you close the app/browser, notifications stop

**To Get Phone Notifications When App is Closed:**
1. Fix service worker config
2. Update App.jsx to use FCM
3. Deploy Cloud Functions
4. Enable Cloud Scheduler
5. Install PWA on phone
6. Ensure FCM token is registered

**Estimated Fix Time:** 30-45 minutes

**Difficulty:** Medium (requires Firebase CLI and console access)

---

Would you like me to create the exact code changes as ready-to-copy files?

