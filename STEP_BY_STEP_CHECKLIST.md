# Step-by-Step Setup Checklist

**Print this out and check off each item as you complete it!**

---

## ✅ PRE-SETUP CHECKLIST

### Day 1: Software Installation

- [ ] Download and install **Node.js** from https://nodejs.org/
  - [ ] Version 18 or higher
  - [ ] Verify: Run `node --version` in command prompt
  - [ ] Verify: Run `npm --version` in command prompt

- [ ] Download and install **VS Code** from https://code.visualstudio.com/
  - [ ] Launch VS Code to confirm installation

- [ ] Install **Firebase CLI**
  - [ ] Open command prompt/terminal
  - [ ] Run: `npm install -g firebase-tools`
  - [ ] Verify: Run `firebase --version`

- [ ] Install **Vercel CLI** (optional, can do later)
  - [ ] Run: `npm install -g vercel`
  - [ ] Verify: Run `vercel --version`

**If all above show version numbers, proceed to Day 2!**

---

## 📦 Day 2: Get Project Files

### Option A: Download from GitHub

- [ ] Go to the GitHub repository (link provided to you)
- [ ] Click green "Code" button
- [ ] Click "Download ZIP"
- [ ] Save to Desktop
- [ ] Extract ZIP to: `Desktop/My-Meds`
- [ ] Verify folder contains: `src`, `public`, `functions`, `package.json`

### Option B: Copy from USB/Cloud

- [ ] Copy project folder to Desktop
- [ ] Rename to `My-Meds`
- [ ] Verify all files are present

**Files must include:**
- [ ] `src/` folder
- [ ] `public/` folder
- [ ] `functions/` folder
- [ ] `package.json`
- [ ] `COMPLETE_OWNERSHIP_TRANSFER_GUIDE.md`

---

## 🔥 Day 3: Firebase Setup

### Create Google Account
- [ ] Create Gmail account (use YOUR email, not anyone else's)
- [ ] Save credentials:
  - Email: ___________________________
  - Password: ________________________

### Create Firebase Project
- [ ] Go to https://console.firebase.google.com/
- [ ] Sign in with your Gmail
- [ ] Click "Add project"
- [ ] Project name: `my-meds-app` (or your choice)
- [ ] Disable Google Analytics (toggle OFF)
- [ ] Click "Create project"
- [ ] Wait for creation (~30 seconds)
- [ ] Click "Continue"

### Enable Authentication
- [ ] Click "Authentication" in left sidebar
- [ ] Click "Get started"
- [ ] Click "Sign-in method" tab
- [ ] Enable "Email/Password"
  - [ ] Toggle to ON
  - [ ] Click "Save"
- [ ] Click "Add new provider"
- [ ] Select "Google"
  - [ ] Toggle to ON
  - [ ] Enter support email (your Gmail)
  - [ ] Click "Save"

### Create Firestore Database
- [ ] Click "Firestore Database" in left sidebar
- [ ] Click "Create database"
- [ ] Select "Start in production mode"
- [ ] Click "Next"
- [ ] Choose location: `us-central1` (or nearest to you)
- [ ] Click "Enable"
- [ ] Wait for creation (~1-2 minutes)

### Enable Cloud Storage
- [ ] Click "Storage" in left sidebar
- [ ] Click "Get started"
- [ ] Click "Next" (accept default rules)
- [ ] Location should auto-select
- [ ] Click "Done"

### Get Cloud Messaging VAPID Key
- [ ] Click gear icon (⚙️) next to "Project Overview"
- [ ] Click "Project settings"
- [ ] Click "Cloud Messaging" tab
- [ ] Scroll to "Web Push certificates"
- [ ] Click "Generate key pair"
- [ ] Copy the VAPID key (starts with "BH...")
- [ ] Save to Notepad:
  ```
  VAPID Key: BH___________________________
  ```

### Get Firebase Configuration
- [ ] Still in "Project settings"
- [ ] Click "General" tab
- [ ] Scroll to "Your apps"
- [ ] Click Web icon (`</>`)
- [ ] App nickname: `my-meds-web`
- [ ] Click "Register app"
- [ ] Copy ALL configuration values to Notepad:
  ```
  apiKey: AIza___________________________
  authDomain: my-meds-app-_____.firebaseapp.com
  projectId: my-meds-app-_____
  storageBucket: my-meds-app-_____.appspot.com
  messagingSenderId: ___________
  appId: 1:___________:web:___________
  ```
- [ ] Click "Continue to console"

### Upgrade to Blaze Plan
- [ ] Click "Upgrade" in sidebar
- [ ] Select "Blaze (Pay as you go)"
- [ ] Link credit/debit card
- [ ] **Set budget alert to $5** (important!)
- [ ] Complete setup

**Save all this information securely!**

---

## ⚙️ Day 4: Configure Project

### Open Project in VS Code
- [ ] Launch VS Code
- [ ] File → Open Folder
- [ ] Navigate to `Desktop/My-Meds`
- [ ] Click "Select Folder"
- [ ] See project files in left sidebar

### Create .env File
- [ ] Find `env.example` in file list
- [ ] Right-click → Copy
- [ ] Right-click empty space → Paste
- [ ] Rename to `.env` (just dot-env)
- [ ] Open `.env` file
- [ ] Replace ALL values with YOUR Firebase config:
  ```env
  VITE_FIREBASE_API_KEY=AIza___________________________
  VITE_FIREBASE_AUTH_DOMAIN=my-meds-app-_____.firebaseapp.com
  VITE_FIREBASE_PROJECT_ID=my-meds-app-_____
  VITE_FIREBASE_STORAGE_BUCKET=my-meds-app-_____.appspot.com
  VITE_FIREBASE_MESSAGING_SENDER_ID=___________
  VITE_FIREBASE_APP_ID=1:___________:web:___________
  VITE_FCM_VAPID_KEY=BH___________________________
  ```
- [ ] Save file (Ctrl+S or Cmd+S)

### Update Service Worker Config
- [ ] Open: `public/firebase-messaging-sw.js`
- [ ] Find line 9: `firebase.initializeApp({`
- [ ] Replace the placeholder values with YOUR config:
  ```javascript
  firebase.initializeApp({
    apiKey: "AIza___________________________",
    authDomain: "my-meds-app-_____.firebaseapp.com",
    projectId: "my-meds-app-_____",
    storageBucket: "my-meds-app-_____.appspot.com",
    messagingSenderId: "___________",
    appId: "1:___________:web:___________"
  });
  ```
- [ ] Save file

### Install Dependencies
- [ ] Open Terminal in VS Code (Terminal → New Terminal)
- [ ] Should be in project root (check path shows `My-Meds`)
- [ ] Run: `npm install`
- [ ] Wait 2-5 minutes (many packages installing)
- [ ] Should end without errors

- [ ] Install functions dependencies:
  ```bash
  cd functions
  npm install
  cd ..
  ```
- [ ] Wait 1-2 minutes

### Login to Firebase
- [ ] In terminal: `firebase login`
- [ ] Browser opens → Select your Google account
- [ ] Click "Allow"
- [ ] Should see: "✔ Success! Logged in as your-email@gmail.com"

### Link to Firebase Project
- [ ] In terminal: `firebase use --add`
- [ ] Use arrow keys to select your project
- [ ] Press Enter
- [ ] Type alias: `default`
- [ ] Press Enter
- [ ] Should see: "✔ Created alias default for..."

### Deploy Firebase Configuration
- [ ] Deploy Firestore rules:
  ```bash
  firebase deploy --only firestore:rules
  ```
  - [ ] Should see: "✔ Deploy complete!"

- [ ] Deploy Firestore indexes:
  ```bash
  firebase deploy --only firestore:indexes
  ```
  - [ ] Should see: "✔ Deploy complete!"

- [ ] Deploy Storage rules:
  ```bash
  firebase deploy --only storage
  ```
  - [ ] Should see: "✔ Deploy complete!"

### Enable Cloud Scheduler (Required!)
- [ ] Go to: https://console.cloud.google.com/cloudscheduler
- [ ] Select your Firebase project from dropdown
- [ ] Click "Enable API"
- [ ] Wait for activation

### Deploy Cloud Functions
- [ ] In terminal:
  ```bash
  firebase deploy --only functions
  ```
- [ ] Wait 3-5 minutes (deploying 3 functions)
- [ ] Should see:
  - ✔ scheduledNotifier
  - ✔ missedDetector
  - ✔ refillReminderWorker
- [ ] Should see: "✔ Deploy complete!"

**If everything above succeeded, your backend is ready!**

---

## 🚀 Day 5: Test Locally

### Start Development Server
- [ ] In terminal: `npm run dev`
- [ ] Should see:
  ```
  ➜  Local:   http://localhost:5173/
  ```
- [ ] Open browser to: `http://localhost:5173`
- [ ] Should see My Meds login page

### Create Test Account
- [ ] Click "Sign Up"
- [ ] Fill in:
  - Name: (Your name)
  - Email: test@example.com (any email)
  - Password: test123 (at least 6 characters)
- [ ] Click "Sign Up"
- [ ] Should redirect to Dashboard

### Test Adding Medication
- [ ] Click "Medications" in nav
- [ ] Click "Add Medication"
- [ ] Fill in:
  - Name: Vitamin C
  - Dosage: 500mg
  - Type: Tablet
  - Refill Amount: 30
  - Notes: Take with water
- [ ] Click "Save"
- [ ] Should see medication in list

### Test Creating Schedule
- [ ] Click "Schedules" in nav
- [ ] Click "Add Schedule"
- [ ] Select medication: Vitamin C
- [ ] Frequency: Daily
- [ ] Time: (2 minutes from now)
- [ ] Click "Save"
- [ ] Should see schedule in list

### Test Dashboard
- [ ] Click "Dashboard"
- [ ] Should see today's scheduled doses
- [ ] Try clicking "Take" on a dose
- [ ] Should log to "Recent Activity"

### Enable Notifications (Important!)
- [ ] Look for "Enable Notifications" button on Dashboard
- [ ] Click it
- [ ] Browser asks permission → Click "Allow"
- [ ] Should see success message

### Wait for Notification
- [ ] Wait until scheduled time (the 2-min schedule you created)
- [ ] Should receive browser notification
- [ ] Click notification → Should open app

**If all above worked, your app is functioning! 🎉**

Stop the dev server: Press `Ctrl+C` in terminal

---

## 🌐 Day 6: Deploy to Internet

### Create Vercel Account
- [ ] Go to: https://vercel.com/signup
- [ ] Click "Continue with GitHub"
- [ ] Sign in to your GitHub account
- [ ] Authorize Vercel
- [ ] Complete profile

### Deploy via CLI
- [ ] In terminal (make sure you're in project root):
  ```bash
  vercel login
  ```
- [ ] Enter your email
- [ ] Check email inbox
- [ ] Click verification link

- [ ] Deploy:
  ```bash
  vercel
  ```
- [ ] Answer prompts:
  - Set up and deploy? **Y**
  - Which scope? (Select your account)
  - Link to existing? **N**
  - Project name? `my-meds-app`
  - Directory? (Just press Enter)
  - Override settings? **N**

- [ ] Wait 1-2 minutes
- [ ] Copy the production URL:
  ```
  https://my-meds-app-xxxxx.vercel.app
  ```
- [ ] Save this URL: _______________________________

### Add Environment Variables to Vercel
- [ ] Go to: https://vercel.com/dashboard
- [ ] Click your project
- [ ] Click "Settings" tab
- [ ] Click "Environment Variables"

**Add EACH variable (copy from your .env file):**

- [ ] Add: `VITE_FIREBASE_API_KEY`
  - Value: (your API key)
  - Environment: Select ALL (Production, Preview, Development)
  - Click "Save"

- [ ] Add: `VITE_FIREBASE_AUTH_DOMAIN`
  - Value: (your auth domain)
  - Environment: ALL
  - Click "Save"

- [ ] Add: `VITE_FIREBASE_PROJECT_ID`
  - Value: (your project ID)
  - Environment: ALL
  - Click "Save"

- [ ] Add: `VITE_FIREBASE_STORAGE_BUCKET`
  - Value: (your storage bucket)
  - Environment: ALL
  - Click "Save"

- [ ] Add: `VITE_FIREBASE_MESSAGING_SENDER_ID`
  - Value: (your sender ID)
  - Environment: ALL
  - Click "Save"

- [ ] Add: `VITE_FIREBASE_APP_ID`
  - Value: (your app ID)
  - Environment: ALL
  - Click "Save"

- [ ] Add: `VITE_FCM_VAPID_KEY`
  - Value: (your VAPID key)
  - Environment: ALL
  - Click "Save"

### Redeploy with Environment Variables
- [ ] In terminal:
  ```bash
  vercel --prod
  ```
- [ ] Wait for deployment
- [ ] Should complete successfully

### Update Firebase Authorized Domains
- [ ] Go to Firebase Console
- [ ] Click "Authentication"
- [ ] Click "Settings" tab
- [ ] Click "Authorized domains"
- [ ] Click "Add domain"
- [ ] Enter: `my-meds-app-xxxxx.vercel.app` (YOUR Vercel domain, no https://)
- [ ] Click "Add"

### Test Live Site
- [ ] Open your Vercel URL in browser
- [ ] Should see login page
- [ ] Sign up with NEW email (not the test one)
- [ ] Add medication
- [ ] Create schedule
- [ ] Enable notifications
- [ ] Everything should work!

**Congratulations! Your app is live on the internet! 🚀**

---

## 📱 Day 7: Test on Mobile

### Android Testing
- [ ] Open your Vercel URL on Android Chrome
- [ ] Sign in
- [ ] Tap browser menu (⋮)
- [ ] Tap "Install app" or "Add to Home Screen"
- [ ] Tap "Install"
- [ ] App icon appears on home screen
- [ ] Open installed app
- [ ] Enable notifications
- [ ] Create a schedule for 2 minutes from now
- [ ] Wait for notification
- [ ] Should receive notification even when app is closed

### Desktop Testing
- [ ] Open your Vercel URL in Chrome (desktop)
- [ ] Look for install icon (⊕) in address bar
- [ ] Click it
- [ ] Click "Install"
- [ ] App opens in standalone window
- [ ] Test all features

---

## 🎓 Day 8: Presentation Prep

### Create Test Data
- [ ] Create 2 user accounts:
  
  **Account 1:**
  - Email: _____________________________
  - Password: __________________________
  
  **Account 2:**
  - Email: _____________________________
  - Password: __________________________

- [ ] In Account 1, add 3 medications:
  1. ___________________________________
  2. ___________________________________
  3. ___________________________________

- [ ] Create 2-3 schedules
- [ ] Add Account 2 as family member

### Practice Demo
- [ ] Run through entire demo 3 times
- [ ] Time yourself (should be 8-10 minutes)
- [ ] Practice explaining each feature
- [ ] Practice answering technical questions

### Read Documentation
- [ ] Read: `COMPLETE_OWNERSHIP_TRANSFER_GUIDE.md`
- [ ] Read: `QUICK_REFERENCE_FOR_PRESENTATION.md`
- [ ] Read: `TECHNICAL_DEEP_DIVE.md`
- [ ] Understand tech stack
- [ ] Understand architecture
- [ ] Can explain how notifications work

### Prepare Backup
- [ ] Take screenshots of:
  - [ ] Login page
  - [ ] Dashboard with doses
  - [ ] Medications list
  - [ ] Add schedule form
  - [ ] Notification
  - [ ] Mobile installed app
- [ ] Save screenshots to USB drive

### Browser Tabs to Open Before Presentation
- [ ] Your live app URL
- [ ] Firebase Console (signed in)
- [ ] Vercel Dashboard (signed in)
- [ ] VS Code with project open
- [ ] This checklist

---

## ✅ FINAL PRE-PRESENTATION CHECKLIST

### 1 Day Before
- [ ] Test live URL works
- [ ] Both test accounts work
- [ ] Notifications working
- [ ] Mobile app installed
- [ ] Phone charged
- [ ] Laptop charged
- [ ] Backup screenshots saved
- [ ] Printed quick reference guide

### 1 Hour Before
- [ ] Open all browser tabs
- [ ] Clear browser cache
- [ ] Test login
- [ ] Verify internet connection
- [ ] Have backup mobile hotspot ready
- [ ] Deep breath!

### Right Before Going On
- [ ] Clear throat, drink water
- [ ] Smile (you've got this!)
- [ ] Remember: You built something awesome

---

## 🚨 TROUBLESHOOTING

### If login fails during demo:
- [ ] Check internet connection
- [ ] Use second test account
- [ ] Fall back to screenshots
- [ ] Explain the feature verbally

### If notifications don't come:
- [ ] Show Firebase Functions logs
- [ ] Explain the 5-minute scheduler
- [ ] Show code instead
- [ ] Show screenshot of notification

### If you can't answer a question:
- [ ] "That's a great question. While I implemented this, I'd need to review my code for the specific details. The general approach I used was..."
- [ ] Show the code file
- [ ] Explain at high level

---

## 📊 PRESENTATION SCORE GUIDE

**You should be able to:**
- [ ] Explain what the app does (30 seconds)
- [ ] Demo all major features (5 minutes)
- [ ] Explain tech stack (1 minute)
- [ ] Describe architecture (2 minutes)
- [ ] Explain how notifications work (2 minutes)
- [ ] Show code structure (2 minutes)
- [ ] Answer "Why Firebase?" (1 minute)
- [ ] Answer "How does offline work?" (1 minute)
- [ ] Answer "How do you ensure security?" (2 minutes)
- [ ] Discuss challenges faced (2 minutes)

**Total: ~18 minutes + Q&A**

---

## 🎯 SUCCESS CRITERIA

You're ready if you can confidently say YES to all:
- [ ] App runs locally
- [ ] App deployed online
- [ ] Tested on mobile
- [ ] PWA installs correctly
- [ ] Notifications work
- [ ] Understand tech stack
- [ ] Can explain architecture
- [ ] Can answer basic questions
- [ ] Have backup plan ready
- [ ] Feel confident!

---

**YOU'VE GOT THIS! 💪**

**Final Prep:**
- Print this checklist
- Print quick reference guide
- Get good sleep before presentation
- Arrive early
- Believe in yourself

You built a production-ready web application with:
- React frontend
- Firebase backend
- Real-time notifications
- PWA capabilities
- Family sharing
- Secure authentication
- Cloud deployment

**That's impressive! Be proud of your work!**

---

**Last Updated:** November 27, 2025
**Purpose:** Complete step-by-step checklist for project setup and presentation prep




