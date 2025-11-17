# My Meds - Medicine Scheduler

A production-ready Progressive Web App (PWA) for managing medication schedules with smart reminders, family caregiver support, and an AI chatbot assistant.

## 🚀 Features

- ✅ **Authentication** - Email/Password + Google Sign-in
- 💊 **Medication Management** - CRUD operations with photo upload
- 📅 **Smart Scheduling** - Recurring schedules with custom times
- 🔔 **Push Notifications** - Reliable FCM-based reminders
- 📊 **Dashboard** - Today's doses with Take/Snooze/Skip actions
- 👨‍👩‍👧 **Family Mode** - Caregiver notifications for missed doses
- 🤖 **Chatbot** - Health information assistant
- 📱 **PWA** - Installable on Android with offline support
- 🔒 **Secure** - Firestore security rules with family access control

## 📋 Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Auth, Firestore, Functions, Storage, FCM)
- **Hosting**: Vercel (Frontend) + Firebase (Functions)
- **PWA**: Vite PWA Plugin with Workbox

## 🛠️ Prerequisites

- Node.js 18+ and npm
- Firebase account
- Vercel account (for deployment)
- Git

## 📦 Installation & Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd my-meds
```

### 2. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install functions dependencies
cd functions
npm install
cd ..
```

### 3. Firebase Setup

#### Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `my-meds` (or your preferred name)
4. Enable Google Analytics (optional)
5. Create project

#### Enable Authentication

1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Enable **Email/Password**
3. Enable **Google** sign-in provider
4. Add your domain to authorized domains

#### Create Firestore Database

1. Go to **Firestore Database** > **Create database**
2. Start in **production mode**
3. Choose a location (e.g., `us-central1`)

#### Enable Storage

1. Go to **Storage** > **Get started**
2. Start in **production mode**

#### Enable Cloud Messaging

1. Go to **Project Settings** > **Cloud Messaging**
2. Under **Web Push certificates**, click **Generate key pair**
3. Copy the VAPID key (you'll need this for `.env`)

#### Get Firebase Config

1. Go to **Project Settings** > **General**
2. Scroll to "Your apps" section
3. Click **Web** icon (</>) to add a web app
4. Register app with nickname: `my-meds-web`
5. Copy the Firebase configuration object

### 4. Environment Variables

Create a `.env` file in the root directory:

```bash
cp env.example .env
```

Edit `.env` and add your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FCM_VAPID_KEY=your_vapid_key_here
```

### 5. Update Firebase Messaging Service Worker

Edit `public/firebase-messaging-sw.js` and replace the placeholder config with your actual Firebase config:

```javascript
firebase.initializeApp({
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "YOUR_ACTUAL_AUTH_DOMAIN",
  projectId: "YOUR_ACTUAL_PROJECT_ID",
  storageBucket: "YOUR_ACTUAL_STORAGE_BUCKET",
  messagingSenderId: "YOUR_ACTUAL_SENDER_ID",
  appId: "YOUR_ACTUAL_APP_ID"
});
```

### 6. Install Firebase CLI

```bash
npm install -g firebase-tools
```

### 7. Login to Firebase

```bash
firebase login
```

### 8. Initialize Firebase Project

```bash
firebase init
```

Select:
- ✅ Firestore
- ✅ Functions
- ✅ Storage
- ✅ Emulators

Choose:
- Use existing project: Select your Firebase project
- Firestore rules: `firestore.rules`
- Firestore indexes: `firestore.indexes.json`
- Functions language: JavaScript
- Functions directory: `functions`
- Install dependencies: Yes
- Storage rules: `storage.rules`
- Emulators: Select all

### 9. Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
firebase deploy --only storage
```

## 🚀 Development

### Run Locally

```bash
# Start development server
npm run dev
```

Visit `http://localhost:3000`

### Run with Firebase Emulators (Recommended)

```bash
# Terminal 1: Start Firebase emulators
firebase emulators:start

# Terminal 2: Start Vite dev server
npm run dev
```

Update `.env` to use emulators:
```env
VITE_FIREBASE_AUTH_DOMAIN=localhost
```

## 🔧 Deploy Cloud Functions

### Setup Cloud Scheduler (Required for Notifications)

Cloud Functions use Pub/Sub scheduled triggers. You need to enable Cloud Scheduler:

1. Go to [Cloud Scheduler Console](https://console.cloud.google.com/cloudscheduler)
2. Enable the API
3. Select a region (same as your functions)

### Deploy Functions

```bash
firebase deploy --only functions
```

This deploys:
- `scheduledNotifier` - Runs every 5 minutes to send dose reminders
- `missedDetector` - Runs every 15 minutes to detect missed doses
- `refillReminderWorker` - Runs daily at 9 AM for refill reminders
- `dialogflowFulfillment` - Webhook for chatbot (optional)

### Verify Deployment

```bash
firebase functions:log
```

## 📱 Deploy Frontend to Vercel

### Option 1: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel
```

### Option 2: GitHub Integration

1. Push code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click **New Project**
4. Import your GitHub repository
5. Configure:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. Add environment variables (copy from `.env`)
7. Deploy

### Add Environment Variables in Vercel

Go to Project Settings > Environment Variables and add all `VITE_*` variables.

## 🧪 Testing

### Run Unit Tests

```bash
npm test
```

### Test Firestore Rules

```bash
firebase emulators:exec --only firestore "npm test"
```

## 📊 Monitoring & Logs

### View Cloud Functions Logs

```bash
firebase functions:log
```

### View Specific Function Logs

```bash
firebase functions:log --only scheduledNotifier
```

### Firebase Console

Monitor usage, errors, and performance in [Firebase Console](https://console.firebase.google.com/).

## 🔐 Security

### Firestore Rules

Security rules are defined in `firestore.rules`:
- Users can only access their own data
- Family members can read each other's data
- Cloud Functions have admin access

### Storage Rules

Storage rules in `storage.rules`:
- Users can only upload/delete their own medication photos
- All authenticated users can read photos

## 📱 PWA Installation

### Android

1. Open the app in Chrome
2. Tap the menu (⋮) > "Install app" or "Add to Home screen"
3. Follow prompts

### Desktop

1. Open the app in Chrome
2. Click the install icon (⊕) in the address bar
3. Click "Install"

## 🤖 Chatbot Setup (Optional)

The app includes a rule-based chatbot. To integrate Dialogflow ES:

1. Create a [Dialogflow ES agent](https://dialogflow.cloud.google.com/)
2. Create intents for medication queries
3. Enable webhook fulfillment
4. Set webhook URL to your `dialogflowFulfillment` function URL
5. Update `VITE_DIALOGFLOW_PROJECT_ID` in `.env`

## 🐛 Troubleshooting

### Notifications Not Working

1. Check browser notification permissions
2. Verify VAPID key in `.env`
3. Check `firebase-messaging-sw.js` config
4. Verify Cloud Scheduler is enabled
5. Check Cloud Functions logs

### Build Errors

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Firestore Permission Denied

1. Verify security rules are deployed
2. Check user is authenticated
3. Verify userId matches in documents

## 📚 Project Structure

```
my-meds/
├── public/
│   ├── firebase-messaging-sw.js    # FCM service worker
│   └── favicon.svg                  # App icon
├── src/
│   ├── components/                  # Reusable components
│   ├── config/
│   │   └── firebase.js             # Firebase initialization
│   ├── contexts/
│   │   └── AuthContext.jsx         # Auth state management
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Medications.jsx
│   │   ├── Schedules.jsx
│   │   ├── Family.jsx
│   │   └── Chatbot.jsx
│   ├── services/
│   │   ├── medications.js          # Medication CRUD
│   │   ├── schedules.js            # Schedule management
│   │   ├── doseLogs.js             # Dose tracking
│   │   ├── family.js               # Family/caregiver
│   │   └── fcm.js                  # Push notifications
│   ├── App.jsx                      # Main app component
│   ├── main.jsx                     # Entry point
│   └── index.css                    # Global styles
├── functions/
│   ├── index.js                     # Cloud Functions
│   └── package.json
├── firestore.rules                  # Firestore security rules
├── firestore.indexes.json           # Firestore indexes
├── storage.rules                    # Storage security rules
├── firebase.json                    # Firebase config
├── vite.config.js                   # Vite config
└── package.json
```

## 🔄 CI/CD

GitHub Actions workflow is included in `.github/workflows/deploy.yml` for automatic deployment.

### Setup GitHub Secrets

Add these secrets in GitHub repository settings:

1. `FIREBASE_SERVICE_ACCOUNT` - Firebase service account JSON (base64 encoded)
2. `VERCEL_TOKEN` - Vercel token
3. All `VITE_*` environment variables

## 📝 License

This project is private and proprietary.

## 🤝 Support

For issues or questions, please contact the project owner.

---

**Built with ❤️ using React, Firebase, and Vercel**

