# 🚀 Quick Deploy Guide - 5 Minutes to Mobile App

## Prerequisites Checklist

- [ ] GitHub account
- [ ] Vercel account (sign up at vercel.com)
- [ ] Android phone with Chrome

---

## Step 1: Create Icons (2 minutes)

### Easiest Method - Use Canva:

1. Go to **https://www.canva.com/** (free account)
2. Create **512x512px** design
3. Add text: **"💊 My Meds"** or just **"💊"**
4. Background: **#4F46E5** (indigo)
5. Download as PNG
6. Save to: `public/pwa-512x512.png`
7. Resize to 192x192px, save as: `public/pwa-192x192.png`

**OR use this quick command** (if you have ImageMagick):
```bash
# Create simple colored icons
convert -size 512x512 xc:#4F46E5 -pointsize 200 -fill white -gravity center -annotate +0+0 "💊" public/pwa-512x512.png
convert public/pwa-512x512.png -resize 192x192 public/pwa-192x192.png
```

---

## Step 2: Push to GitHub (1 minute)

```bash
# If git not initialized
git init
git add .
git commit -m "Ready for deployment"

# Create repo on GitHub.com, then:
git remote add origin https://github.com/YOUR_USERNAME/my-meds.git
git branch -M main
git push -u origin main
```

---

## Step 3: Deploy to Vercel (2 minutes)

1. Go to **https://vercel.com/new**
2. Import your GitHub repo
3. Add environment variables (copy from `.env` file):
   ```
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   VITE_FCM_VAPID_KEY=...
   ```
4. Click **Deploy**
5. Wait 2 minutes
6. Copy your URL: `https://your-app.vercel.app`

---

## Step 4: Update Firebase (1 minute)

1. Go to **Firebase Console** → **Authentication** → **Settings**
2. Add domain: `your-app.vercel.app` (without https://)
3. Save

---

## Step 5: Install on Phone (30 seconds)

1. Open Chrome on Android
2. Go to: `https://your-app.vercel.app`
3. Tap **3-dot menu** → **Add to Home screen**
4. Tap **Add**

---

## Step 6: Enable Notifications (30 seconds)

1. Open app from home screen
2. Log in
3. Tap **Allow** when prompted for notifications
4. Go to **Settings** → **Battery** → **My Meds** → **Not optimized**

---

## ✅ Done!

Your app is now installed and working on your phone!

**Full guide:** See `MOBILE_DEPLOYMENT_GUIDE.md` for detailed instructions.

