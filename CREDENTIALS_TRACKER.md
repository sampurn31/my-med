# Credentials & Configuration Tracker

**IMPORTANT: Keep this document private and secure. Do NOT commit to Git or share publicly!**

**Purpose:** Track all the credentials and configuration values you'll need during setup and presentation.

---

## 📧 Gmail Account (For Firebase)

**Create a NEW Gmail account for this project:**

```
Email: _________________________________________________

Password: ______________________________________________

Recovery Email: ________________________________________

Recovery Phone: ________________________________________
```

**Security Tips:**
- Use a strong password
- Enable 2-factor authentication
- Don't share this with anyone
- This will be YOUR project's account

---

## 🔥 Firebase Configuration

**Get these from Firebase Console → Project Settings → General → Your Apps**

### Firebase Project Details

```
Project Name: __________________________________________

Project ID: ____________________________________________

Project Number: ________________________________________

Location/Region: _______________________________________
(e.g., us-central1, asia-south1, europe-west1)
```

### Firebase Web App Configuration

**Copy these EXACTLY from Firebase Console:**

```javascript
VITE_FIREBASE_API_KEY=
(Starts with: AIza...)
_______________________________________________________

VITE_FIREBASE_AUTH_DOMAIN=
(Format: project-name.firebaseapp.com)
_______________________________________________________

VITE_FIREBASE_PROJECT_ID=
(Your project ID)
_______________________________________________________

VITE_FIREBASE_STORAGE_BUCKET=
(Format: project-name.appspot.com)
_______________________________________________________

VITE_FIREBASE_MESSAGING_SENDER_ID=
(Numbers only)
_______________________________________________________

VITE_FIREBASE_APP_ID=
(Format: 1:xxxxx:web:xxxxx)
_______________________________________________________
```

### Firebase Cloud Messaging

**Get this from Firebase Console → Project Settings → Cloud Messaging → Web Push Certificates**

```
VITE_FCM_VAPID_KEY=
(Starts with: BH...)
_______________________________________________________
```

---

## 🌐 Vercel Configuration

### Vercel Account

```
GitHub Username: _______________________________________
(Used to sign up for Vercel)

Vercel Account Email: __________________________________

Vercel Account Name: ___________________________________
```

### Vercel Deployment

```
Project Name: __________________________________________
(e.g., my-meds-app)

Production URL: ________________________________________
(Format: https://project-name-xxxxx.vercel.app)

Preview URL: ___________________________________________
(Optional, for testing)
```

---

## 👤 Test User Accounts

**Create these AFTER deploying the app - use them for demo:**

### Test Account 1 (Primary Demo Account)

```
Name: __________________________________________________

Email: _________________________________________________

Password: ______________________________________________

Notes: _________________________________________________
(e.g., "Has 3 medications, 2 schedules")
```

### Test Account 2 (Family Member Demo)

```
Name: __________________________________________________

Email: _________________________________________________

Password: ______________________________________________

Notes: _________________________________________________
(e.g., "Caregiver for Account 1")
```

---

## 📱 Demo Data

**Track the test data you created for presentation:**

### Medications Added

1. Name: _____________________ Dosage: _______________
2. Name: _____________________ Dosage: _______________
3. Name: _____________________ Dosage: _______________

### Schedules Created

1. Medication: ________________ Time: ________________
2. Medication: ________________ Time: ________________
3. Medication: ________________ Time: ________________

---

## 🔑 API Keys & Secrets Summary

**All environment variables needed (copy to .env and Vercel):**

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# Firebase Cloud Messaging
VITE_FCM_VAPID_KEY=

# Optional: Dialogflow (if implementing chatbot)
VITE_DIALOGFLOW_PROJECT_ID=
```

---

## 📂 Important URLs

**Bookmark these in your browser:**

### Development

```
Local Dev Server: http://localhost:5173

Firebase Console: https://console.firebase.google.com/

Vercel Dashboard: https://vercel.com/dashboard

GitHub Repository: _____________________________________
(If you create one)
```

### Production

```
Live App URL: __________________________________________

Firebase Hosting URL: __________________________________
(If using Firebase Hosting)
```

---

## 🛠️ Command Line Credentials

**For Firebase CLI:**

```
Logged in as: __________________________________________
(Your Gmail)

Firebase Project Alias: ________________________________
(Usually 'default')

Active Project: ________________________________________
(Your project ID)
```

**For Vercel CLI:**

```
Logged in as: __________________________________________

Scope: _________________________________________________
```

---

## 💳 Billing Information

**Firebase Blaze Plan:**

```
Payment Method: ________________________________________
(Last 4 digits of card)

Budget Alert Set: ______________________________________
(Recommended: $5-10)

Current Billing: _______________________________________
(Check monthly)
```

**Expected Costs:**
- **Free Tier:** Should be $0 for college project
- **Firestore:** 50k reads, 20k writes per day FREE
- **Functions:** 2M invocations per month FREE
- **Storage:** 5GB FREE

---

## 📊 Pre-Presentation Checklist

**Verify all these work before presentation:**

### Authentication
- [ ] Can sign up with email/password
- [ ] Can login with email/password
- [ ] Can login with Google
- [ ] Can logout

### Core Features
- [ ] Can add medication
- [ ] Can edit medication
- [ ] Can delete medication
- [ ] Can create schedule
- [ ] Can edit schedule
- [ ] Can delete schedule

### Dashboard
- [ ] Shows today's doses
- [ ] Can mark dose as "Taken"
- [ ] Can mark dose as "Skipped"
- [ ] Can "Snooze" a dose
- [ ] Recent activity shows correctly

### Notifications
- [ ] Browser permission granted
- [ ] Notification arrives at scheduled time
- [ ] Notification shows correct medication
- [ ] Clicking notification opens app

### Family Feature
- [ ] Can add family member
- [ ] Family member receives invite
- [ ] Can accept invite
- [ ] Caregiver can see patient's medications
- [ ] Caregiver receives missed dose alerts

### Mobile/PWA
- [ ] App installs on Android
- [ ] Installed app works offline
- [ ] Push notifications work when app is closed
- [ ] App icon appears on home screen

---

## 🎓 Presentation Day Checklist

**What to bring/have ready:**

### Physical Items
- [ ] Laptop (fully charged)
- [ ] Phone charger
- [ ] Phone (with app installed)
- [ ] Printed reference guide
- [ ] Printed credentials (this document)
- [ ] USB drive with screenshots

### Digital Prep
- [ ] All browser tabs open:
  - [ ] Live app URL
  - [ ] Firebase Console (logged in)
  - [ ] Vercel Dashboard (logged in)
  - [ ] VS Code with project
- [ ] Test accounts verified working
- [ ] Notifications enabled in browser
- [ ] Demo data created
- [ ] Backup screenshots saved

### Knowledge Prep
- [ ] Know your tech stack
- [ ] Can explain architecture
- [ ] Can explain how notifications work
- [ ] Practiced demo 3+ times
- [ ] Read Q&A section
- [ ] Know what to say if something fails

---

## 🔒 Security Reminders

### NEVER Share Publicly:
- ❌ Firebase API keys (keep in .env, not in code)
- ❌ Your Gmail password
- ❌ FCM VAPID key
- ❌ Vercel tokens
- ❌ This credentials document

### What's Safe to Share:
- ✅ Your live Vercel URL
- ✅ Firebase project name (not credentials)
- ✅ Tech stack information
- ✅ Screenshots without sensitive data
- ✅ Code (without .env file)

### After Presentation:
- [ ] Change test account passwords (if needed)
- [ ] Keep Firebase project active (for future demos)
- [ ] Don't delete Vercel deployment (portfolio piece!)
- [ ] Can add to resume/LinkedIn

---

## 📞 Emergency Contacts

**If something breaks:**

### Documentation
1. `COMPLETE_OWNERSHIP_TRANSFER_GUIDE.md` → Troubleshooting section
2. `QUICK_REFERENCE_FOR_PRESENTATION.md` → Common issues
3. Firebase Docs: https://firebase.google.com/docs

### Common Issues

**"Firestore permission denied"**
- Check security rules are deployed: `firebase deploy --only firestore:rules`
- Verify user is logged in
- Check userId matches in document

**"Notifications not working"**
- Verify browser permission granted
- Check VAPID key in .env is correct
- Verify firebase-messaging-sw.js has correct config
- Check Cloud Functions logs: `firebase functions:log`

**"Can't deploy to Vercel"**
- Check all environment variables added in dashboard
- Verify build command: `npm run build`
- Verify output directory: `dist`

---

## 💾 Backup & Recovery

### If You Lose This Document:

**Firebase Config:**
- Go to Firebase Console
- Project Settings → General
- Scroll to "Your apps"
- Click config icon to view

**Vercel URL:**
- Go to Vercel Dashboard
- Select your project
- See URL in project header

**Test Accounts:**
- Use password reset if forgotten
- Check email for reset link

---

## ✅ Setup Progress Tracker

**Check off as you complete each major step:**

### Installation
- [ ] Node.js installed
- [ ] VS Code installed
- [ ] Firebase CLI installed
- [ ] Vercel CLI installed

### Firebase Setup
- [ ] Gmail account created
- [ ] Firebase project created
- [ ] Authentication enabled
- [ ] Firestore database created
- [ ] Cloud Storage enabled
- [ ] Cloud Messaging configured
- [ ] Web app registered
- [ ] Configuration copied

### Project Configuration
- [ ] Project files obtained
- [ ] Opened in VS Code
- [ ] .env file created
- [ ] .env populated with config
- [ ] firebase-messaging-sw.js updated
- [ ] Dependencies installed (npm install)

### Firebase Deployment
- [ ] Logged into Firebase CLI
- [ ] Project linked
- [ ] Firestore rules deployed
- [ ] Firestore indexes deployed
- [ ] Storage rules deployed
- [ ] Cloud Scheduler enabled
- [ ] Cloud Functions deployed

### Local Testing
- [ ] Dev server runs (npm run dev)
- [ ] Can sign up
- [ ] Can add medication
- [ ] Can create schedule
- [ ] Notifications enabled
- [ ] All features work

### Vercel Deployment
- [ ] Vercel account created
- [ ] Logged into Vercel CLI
- [ ] Project deployed
- [ ] Environment variables added
- [ ] Production deployment successful
- [ ] Authorized domain added to Firebase

### Final Testing
- [ ] Live URL works
- [ ] All features work online
- [ ] Mobile PWA installation works
- [ ] Notifications work on mobile

### Presentation Prep
- [ ] Test accounts created
- [ ] Demo data added
- [ ] Documentation read
- [ ] Demo practiced
- [ ] Backup screenshots taken
- [ ] Ready to present!

---

**Keep this document secure and up to date!**

**Last Updated:** _______________

**Setup Status:** [ ] In Progress  [ ] Complete

**Presentation Date:** _______________

---

## 🎯 Quick Copy-Paste Section

**For .env file (fill in your values):**

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FCM_VAPID_KEY=
```

**For firebase-messaging-sw.js (fill in your values):**

```javascript
firebase.initializeApp({
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
});
```

---

**Document Version:** 1.0
**Last Updated:** November 27, 2025
**Purpose:** Track all credentials and configuration for project setup

**🔒 KEEP THIS DOCUMENT PRIVATE AND SECURE! 🔒**




