# My Meds - Complete Setup Guide

This guide will walk you through setting up the My Meds application from scratch.

## 🎉 Good News for Students!

This app is **100% FREE** to run! No billing or credit card required.

**What's FREE:**
- ✅ Firebase Authentication (unlimited)
- ✅ Cloud Firestore (50K reads/day free)
- ✅ Client-side notifications (browser-based)
- ✅ Vercel hosting (hobby plan)
- ✅ PWA installation (works like native app)

**What's NOT included (requires billing):**
- ❌ Photo uploads (Firebase Storage) - Optional
- ❌ Cloud Functions (server-side) - Replaced with client-side
- ❌ Advanced features (missed dose detection, refill reminders)

**Bottom line:** All core features work perfectly for FREE! 🎓

---

## Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] npm or yarn installed
- [ ] Git installed
- [ ] Google account (for Firebase)
- [ ] Vercel account (for hosting)
- [ ] GitHub account (for CI/CD)

## Step-by-Step Setup

### Phase 1: Firebase Project Setup (30 minutes)

#### 1.1 Create Firebase Project

1. Go to https://console.firebase.google.com/
2. Click **"Add project"**
3. Enter project name: `my-meds-prod` (or your choice)
4. Disable Google Analytics (optional for personal project)
5. Click **"Create project"**
6. Wait for project creation (1-2 minutes)

#### 1.2 Enable Authentication

1. In Firebase Console, click **"Authentication"** in left sidebar
2. Click **"Get started"**
3. Click **"Sign-in method"** tab
4. Enable **"Email/Password"**:
   - Toggle to enable
   - Click **"Save"**
5. Enable **"Google"**:
   - Toggle to enable
   - Enter project support email
   - Click **"Save"**

#### 1.3 Create Firestore Database

1. Click **"Firestore Database"** in left sidebar
2. Click **"Create database"**
3. Select **"Start in production mode"**
4. Choose location: **"us-central1"** (or nearest to you)
5. Click **"Enable"**
6. Wait for database creation (1-2 minutes)

#### 1.4 Enable Cloud Storage (OPTIONAL - Skip if you can't enable billing)

**Note**: Cloud Storage requires billing to be enabled. If you're a student or can't enable billing, **you can skip this step**. The app will work without photo uploads.

**If you can enable Storage (recommended):**
1. Click **"Storage"** in left sidebar
2. Click **"Get started"**
3. Select **"Start in test mode"** (not production mode)
4. Choose same location as Firestore
5. Click **"Done"**

**If you skip Storage:**
- Photo upload feature will be disabled
- All other features will work perfectly
- You can enable Storage later if needed

#### 1.5 Setup Cloud Messaging

1. Click **"Settings"** (gear icon) > **"Project settings"**
2. Click **"Cloud Messaging"** tab
3. Scroll to **"Web Push certificates"**
4. Click **"Generate key pair"**
5. **Copy the key** (starts with "B...") - you'll need this for `.env`

#### 1.6 Get Firebase Configuration

1. Still in **"Project settings"**
2. Scroll to **"Your apps"** section
3. Click **Web icon** (`</>`)
4. Enter app nickname: `my-meds-web`
5. Check **"Also set up Firebase Hosting"** (optional)
6. Click **"Register app"**
7. **Copy the entire firebaseConfig object** - you'll need this

Example config (yours will be different):
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...",
  authDomain: "my-meds-prod.firebaseapp.com",
  projectId: "my-meds-prod",
  storageBucket: "my-meds-prod.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

#### 1.7 Enable Required APIs (SKIP THIS - Not Needed!)

**✅ You can SKIP this entire step!**

The app now uses **client-side notifications** that run in your browser/PWA. This means:
- ✅ **No billing required** - Completely FREE
- ✅ **No APIs to enable** - Nothing to configure
- ✅ **Works automatically** - Already implemented

**What was replaced:**
- ❌ Cloud Functions API - Not needed (client-side code instead)
- ❌ Cloud Scheduler API - Not needed (browser timer instead)
- ❌ Cloud Pub/Sub API - Not needed (no messaging needed)
- ❌ Cloud Build API - Not needed (no functions to build)

**How notifications work now:**
- Browser checks schedules every minute
- Sends notifications at scheduled times
- Works when PWA is installed and running
- 100% FREE with no setup needed!

### Phase 2: Local Project Setup (15 minutes)

#### 2.1 Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd my-meds

# Install dependencies
npm install

# Install function dependencies
cd functions
npm install
cd ..
```

#### 2.2 Configure Environment Variables

1. Copy the example env file:
```bash
cp env.example .env
```

2. Edit `.env` with your Firebase config:
```env
VITE_FIREBASE_API_KEY=AIzaSyC...
VITE_FIREBASE_AUTH_DOMAIN=my-meds-prod.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=my-meds-prod
VITE_FIREBASE_STORAGE_BUCKET=my-meds-prod.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
VITE_FCM_VAPID_KEY=B...your-vapid-key
```

#### 2.3 Update Service Worker

Edit `public/firebase-messaging-sw.js` and replace the config:

```javascript
firebase.initializeApp({
  apiKey: "AIzaSyC...",  // Your actual values
  authDomain: "my-meds-prod.firebaseapp.com",
  projectId: "my-meds-prod",
  storageBucket: "my-meds-prod.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
});
```

#### 2.4 Install Firebase CLI

```bash
npm install -g firebase-tools
```

#### 2.5 Login to Firebase

```bash
firebase login
```

This will open a browser for authentication.

#### 2.6 Initialize Firebase

```bash
firebase use --add
```

Select your Firebase project and give it an alias (e.g., `prod`).

### Phase 3: Deploy Firebase Backend (20 minutes)

#### 3.1 Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

Expected output: `✔ Deploy complete!`

#### 3.2 Deploy Firestore Indexes

```bash
firebase deploy --only firestore:indexes
```

This may take 5-10 minutes. You can continue to next steps.

#### 3.3 Deploy Storage Rules (OPTIONAL - Skip if Storage not enabled)

**Only run this if you enabled Cloud Storage in step 1.4:**

```bash
firebase deploy --only storage
```

**If you skipped Storage, skip this step.**

#### 3.4 Deploy Cloud Functions (SKIP THIS - Not Needed!)

**✅ You can SKIP this entire step!**

The app uses **client-side notifications** instead of Cloud Functions. This means:
- ✅ **No functions to deploy** - Nothing to upload
- ✅ **No billing required** - Completely FREE
- ✅ **Works automatically** - Already implemented in browser code

**What you're NOT missing:**
- Notifications still work (client-side)
- Dose tracking still works
- All core features functional

**What you won't have (requires billing):**
- Server-side missed dose detection
- Automatic caregiver alerts
- Refill reminder automation

But for personal use, the client-side approach works great!

### Phase 4: Test Locally (10 minutes)

#### 4.1 Start Development Server

```bash
npm run dev
```

Open http://localhost:3000

#### 4.2 Test Authentication

1. Click **"Sign up"**
2. Enter email and password
3. Create account
4. Verify you're redirected to dashboard

#### 4.3 Test Medication CRUD

1. Click **"Medications"**
2. Click **"Add Medication"**
3. Fill in details
4. Upload a photo (optional)
5. Save
6. Verify medication appears

#### 4.4 Test Schedules

1. Click **"Schedules"**
2. Click **"Add Schedule"**
3. Select medication
4. Set times
5. Save
6. Verify schedule appears

#### 4.5 Test Notifications

1. When prompted, click **"Allow"** for notifications
2. Create a schedule with a time in the next few minutes
3. Wait for scheduled time (notifications check every minute)
4. Verify notification appears in your browser/system tray

**Note**: Client-side notifications work automatically when the app is open or running as PWA in background.

### Phase 5: Deploy to Production (15 minutes)

#### 5.1 Setup Vercel

1. Go to https://vercel.com/
2. Sign up/login with GitHub
3. Click **"Add New Project"**
4. Import your GitHub repository
5. Configure:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Root Directory: `./`

#### 5.2 Add Environment Variables in Vercel

1. In project settings, go to **"Environment Variables"**
2. Add each variable from your `.env` file:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_FCM_VAPID_KEY`
3. Select **"Production"**, **"Preview"**, and **"Development"**
4. Click **"Save"**

#### 5.3 Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes
3. Copy your production URL (e.g., `my-meds.vercel.app`)

#### 5.4 Update Firebase Auth Domain

1. Go to Firebase Console > Authentication > Settings
2. Under **"Authorized domains"**, add your Vercel domain
3. Click **"Add domain"**

### Phase 6: Configure CI/CD (Optional, 10 minutes)

#### 6.1 Setup GitHub Secrets

1. Go to your GitHub repository
2. Click **"Settings"** > **"Secrets and variables"** > **"Actions"**
3. Add these secrets:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_FCM_VAPID_KEY`
   - `VERCEL_TOKEN` (get from Vercel account settings)
   - `VERCEL_ORG_ID` (get from Vercel project settings)
   - `VERCEL_PROJECT_ID` (get from Vercel project settings)
   - `FIREBASE_TOKEN` (run `firebase login:ci` to get)

#### 6.2 Test CI/CD

1. Make a small change (e.g., update README)
2. Commit and push to `main` branch
3. Go to GitHub Actions tab
4. Verify workflow runs successfully

## Verification Checklist

After setup, verify these features work:

- [ ] User can sign up with email/password
- [ ] User can sign in with Google
- [ ] User can add a medication (without photo if Storage disabled)
- [ ] User can create a schedule
- [ ] User receives browser notification (at scheduled time)
- [ ] User can mark dose as taken
- [ ] User can snooze a dose
- [ ] User can skip a dose
- [ ] User can add family member
- [ ] Chatbot responds to messages
- [ ] PWA can be installed on mobile
- [ ] App works offline (cached assets)

**Note**: Photo upload will not work if Cloud Storage was skipped. This is expected and doesn't affect other features.

## Troubleshooting

### Issue: Notifications not working

**Solution**:
1. Check browser console for errors
2. Verify notification permission is granted (browser settings)
3. Make sure the app is open or running as PWA
4. Check that schedules are created with correct times
5. Wait at least 1 minute (notifications check every minute)
6. For PWA: Make sure app isn't force-closed

### Issue: Build fails on Vercel

**Solution**:
1. Check all environment variables are set
2. Verify build command is `npm run build`
3. Check build logs for specific errors
4. Try building locally: `npm run build`

### Issue: Firestore permission denied

**Solution**:
1. Verify rules are deployed: `firebase deploy --only firestore:rules`
2. Check user is authenticated
3. Verify document userId matches current user

### Issue: Client-side notifications not showing

**Solution**:
1. Open browser DevTools → Console tab
2. Look for notification scheduler logs
3. Verify schedules exist in Firestore
4. Check notification permission in browser settings
5. For PWA: Reopen the app after device restart
6. Make sure app is running (not force-closed)

## Next Steps

1. **Add Custom Domain** (Optional)
   - Purchase domain
   - Add to Vercel project
   - Update Firebase authorized domains

2. **Setup Monitoring**
   - Enable Firebase Performance Monitoring
   - Setup error tracking (e.g., Sentry)
   - Monitor Firestore usage

3. **Optimize Performance**
   - Review Firebase usage in console
   - Optimize Firestore queries
   - Monitor notification scheduler performance
   - Check browser console for errors

4. **Enhance Features**
   - Integrate Dialogflow for advanced chatbot
   - Add medication interaction warnings
   - Implement dose history analytics
   - Add export/import functionality

## Support

If you encounter issues not covered here:
1. Check Firebase Console for errors
2. Check Vercel deployment logs
3. Review Cloud Functions logs
4. Check browser console for errors

---

## 📋 Quick Reference: What to Skip

For **FREE setup without billing**:

| Step | Action | Reason |
|------|--------|--------|
| 1.4 | ❌ Skip Cloud Storage | Photo uploads disabled (optional) |
| 1.7 | ✅ Skip APIs | Client-side notifications used instead |
| 3.3 | ❌ Skip Storage Rules | No storage enabled |
| 3.4 | ✅ Skip Cloud Functions | Client-side notifications used instead |

**What you MUST do:**
- ✅ 1.1 - Create Firebase Project
- ✅ 1.2 - Enable Authentication
- ✅ 1.3 - Create Firestore Database
- ✅ 1.5 - Setup Cloud Messaging
- ✅ 1.6 - Get Firebase Configuration
- ✅ Phase 2 - Local Setup
- ✅ 3.1 & 3.2 - Deploy Firestore Rules & Indexes
- ✅ Phase 4 - Test Locally
- ✅ Phase 5 - Deploy to Vercel

**Total cost:** $0/month 🎉

---

**Setup Complete! 🎉**

Your My Meds application is now live and ready to use - completely FREE!

