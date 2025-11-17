# 📱 START HERE - Get My Meds on Your Phone!

## 🎯 Goal
Install your medicine scheduler app on your Android phone with full notifications working.

---

## ⚡ Quick Start (5 Steps)

### 1️⃣ Create Icons (2 min)

**Option A - Use the HTML Generator:**
```bash
# Open create-icons.html in your browser
# Right-click each icon → Save as PNG
# Move to public/ folder
```

**Option B - Use Canva:**
- Go to canva.com
- Create 512x512px design
- Download and save as `public/pwa-512x512.png`
- Resize to 192x192px, save as `public/pwa-192x192.png`

### 2️⃣ Push to GitHub (1 min)

```bash
git add .
git commit -m "Ready for mobile deployment"
git push
```

### 3️⃣ Deploy to Vercel (2 min)

1. Go to **vercel.com** → Sign up with GitHub
2. Click **"New Project"** → Import your repo
3. Add environment variables (copy from `.env`):
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_FCM_VAPID_KEY`
4. Click **"Deploy"**
5. Copy your URL: `https://your-app.vercel.app`

### 4️⃣ Update Firebase (1 min)

1. Firebase Console → Authentication → Settings
2. Add domain: `your-app.vercel.app` (no https://)
3. Save

### 5️⃣ Install on Phone (30 sec)

1. Open Chrome on Android
2. Go to: `https://your-app.vercel.app`
3. Menu (⋮) → **"Add to Home screen"**
4. Tap **"Add"**

---

## ✅ Enable Notifications

1. Open app from home screen
2. Log in
3. Tap **"Allow"** for notifications
4. Settings → Battery → My Meds → **"Not optimized"**

---

## 📚 Full Guides

- **Quick Deploy**: `QUICK_DEPLOY.md` (5-minute version)
- **Complete Guide**: `MOBILE_DEPLOYMENT_GUIDE.md` (detailed with troubleshooting)
- **Icon Generator**: Open `create-icons.html` in browser

---

## 🆘 Troubleshooting

**Icons missing?**
→ Use `create-icons.html` or Canva

**Can't install?**
→ Make sure you're using Chrome (not Firefox)
→ Check that icons exist in `public/` folder

**Notifications not working?**
→ Settings → Battery → My Meds → Not optimized
→ Chrome → Settings → Site Settings → Notifications → Allow

**Can't log in?**
→ Check Firebase Authorized Domains includes your Vercel URL

---

## 🎉 You're Done!

Your app is now on your phone with notifications working!

**Need help?** Check `MOBILE_DEPLOYMENT_GUIDE.md` for detailed troubleshooting.

