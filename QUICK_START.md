# My Meds - Quick Start Guide

Get your My Meds app running in 30 minutes!

## Prerequisites

- Node.js 18+ installed
- Firebase account (free)
- Vercel account (free)

## Step 1: Install Dependencies (2 minutes)

```bash
npm install
cd functions && npm install && cd ..
```

## Step 2: Create Firebase Project (10 minutes)

1. Go to https://console.firebase.google.com/
2. Click "Add project" → Name it "my-meds"
3. Enable these services:
   - **Authentication** → Enable Email/Password + Google
   - **Firestore** → Create database (production mode)
   - **Storage** → Get started
   - **Cloud Messaging** → Generate VAPID key

4. Get your config:
   - Settings → Project Settings → General
   - Scroll to "Your apps" → Add web app
   - Copy the config object

## Step 3: Configure Environment (3 minutes)

1. Copy environment template:
```bash
cp env.example .env
```

2. Edit `.env` with your Firebase config:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FCM_VAPID_KEY=your_vapid_key
```

3. Update `public/firebase-messaging-sw.js` with the same config (lines 7-13)

## Step 4: Deploy Firebase Backend (10 minutes)

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize project
firebase use --add
# Select your project

# Deploy everything
firebase deploy
```

This deploys:
- Firestore security rules
- Storage rules
- Cloud Functions (4 functions)
- Firestore indexes

**Note**: If Cloud Scheduler error occurs:
1. Go to https://console.cloud.google.com/cloudscheduler
2. Enable API
3. Run `firebase deploy` again

## Step 5: Test Locally (2 minutes)

```bash
npm run dev
```

Open http://localhost:3000

1. Sign up with email/password
2. Add a medication
3. Create a schedule
4. Check dashboard

## Step 6: Deploy to Vercel (5 minutes)

### Option A: GitHub (Recommended)

1. Push code to GitHub
2. Go to https://vercel.com/
3. Click "New Project"
4. Import your GitHub repo
5. Add environment variables (all `VITE_*` from `.env`)
6. Deploy!

### Option B: CLI

```bash
npm i -g vercel
vercel login
vercel
```

## Step 7: Enable Notifications (2 minutes)

1. Open your deployed app
2. Click "Allow" when prompted for notifications
3. Wait for a scheduled time or manually trigger via Cloud Scheduler
4. Verify notification appears

## Verification Checklist

- [ ] Can sign up and login
- [ ] Can add medication with photo
- [ ] Can create schedule
- [ ] Dashboard shows upcoming doses
- [ ] Can mark dose as taken
- [ ] Notifications work (at scheduled time)
- [ ] Can add family member
- [ ] Chatbot responds

## Troubleshooting

### "Permission denied" in Firestore
```bash
firebase deploy --only firestore:rules
```

### Notifications not working
1. Check VAPID key in `.env`
2. Check `firebase-messaging-sw.js` config
3. Enable Cloud Scheduler API
4. Check function logs: `firebase functions:log`

### Build fails
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

## What's Next?

- Read [README.md](README.md) for full documentation
- Check [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed setup
- Use [QA_CHECKLIST.md](QA_CHECKLIST.md) for testing
- Refer to [RUNBOOK.md](RUNBOOK.md) for operations

## Need Help?

1. Check Firebase Console for errors
2. Check Vercel deployment logs
3. Review `firebase functions:log`
4. Check browser console

## Cost Estimate

- **Development**: $0 (free tiers)
- **Personal use (<10 users)**: $0
- **Small scale (100 users)**: ~$5-10/month
- **Medium scale (1000 users)**: ~$50-100/month

---

**You're all set! 🎉**

Your medication reminder app is now live and ready to use.

