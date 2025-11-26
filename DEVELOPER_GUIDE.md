# Developer Guide - My Meds App

## 📖 Quick Start for Developers

This guide explains how the codebase works in simple terms. Perfect for new developers or contributors.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────┐
│           React Frontend (PWA)          │
│  ┌─────────┐  ┌──────────┐  ┌────────┐ │
│  │  Pages  │  │ Services │  │ Context│ │
│  └─────────┘  └──────────┘  └────────┘ │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         Firebase Backend (BaaS)         │
│  ┌──────┐  ┌──────────┐  ┌───────────┐ │
│  │ Auth │  │Firestore │  │ Messaging │ │
│  └──────┘  └──────────┘  └───────────┘ │
└─────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
src/
├── config/
│   └── firebase.js          # Firebase initialization
├── contexts/
│   └── AuthContext.jsx      # User authentication state
├── pages/
│   ├── Dashboard.jsx        # Home screen with today's doses
│   ├── Medications.jsx      # Manage medications
│   ├── Schedules.jsx        # Manage schedules
│   ├── Family.jsx           # Manage family members
│   ├── Chatbot.jsx          # AI assistant
│   ├── Login.jsx            # Login page
│   └── Signup.jsx           # Signup page
├── services/
│   ├── medications.js       # CRUD for medications
│   ├── schedules.js         # CRUD for schedules
│   ├── doseLogs.js          # CRUD for dose logs
│   ├── family.js            # Family management
│   ├── clientNotifications.js # Browser notifications
│   └── fcm.js              # Firebase Cloud Messaging
└── utils/
    └── cleanupDuplicates.js # Utility functions
```

---

## 🔑 Key Concepts

### 1. Data Model

```
User
  └── Medications (pills, tablets, etc.)
       └── Schedules (when to take them)
            └── Dose Logs (individual doses)
```

**Example**:
- User: John
- Medication: Aspirin 500mg
- Schedule: Daily at 9:00 AM and 9:00 PM
- Dose Logs: 
  - 2024-01-15 09:00 - Taken
  - 2024-01-15 21:00 - Scheduled

### 2. Firestore Collections

```javascript
// medications
{
  userId: "user123",
  name: "Aspirin",
  strength: "500mg",
  form: "tablet",
  photoUrl: null,
  notes: "Take with food",
  pillsRemaining: 30,
  createdAt: Timestamp
}

// schedules
{
  userId: "user123",
  medId: "med456",
  startDate: Timestamp,
  endDate: Timestamp | null,
  times: ["09:00", "21:00"],
  recurrence: { type: "daily", intervalHours: null },
  instructions: "Take with food",
  active: true
}

// doseLogs
{
  userId: "user123",
  scheduleId: "schedule789",
  medId: "med456",
  scheduledAt: Timestamp,
  takenAt: Timestamp | null,
  status: "scheduled" | "taken" | "missed" | "skipped",
  snoozedUntil: Timestamp | null
}
```

---

## 🔄 How It Works

### Creating a Medication Schedule

**User Flow**:
1. User adds medication (Medications page)
2. User creates schedule (Schedules page)
3. App creates dose logs for today
4. Dashboard shows upcoming doses

**Code Flow**:
```javascript
// 1. Add medication
const medId = await addMedication(userId, {
  name: "Aspirin",
  strength: "500mg",
  form: "tablet"
});

// 2. Add schedule
const scheduleId = await addSchedule(userId, {
  medId: medId,
  startDate: "2024-01-15",
  times: ["09:00", "21:00"]
});

// 3. Dose logs are automatically created
// by createTodayDoseLogs() inside addSchedule()
```

### Notification System

**How it works**:
1. When user logs in, `startNotificationScheduler()` is called
2. Every minute, it checks all active schedules
3. If current time matches a scheduled time (±5 min), send notification
4. Create/update dose log
5. User clicks "Take" → mark dose as taken

**Code**:
```javascript
// In App.jsx
useEffect(() => {
  if (currentUser) {
    startNotificationScheduler(currentUser.uid);
  }
  return () => stopNotificationScheduler();
}, [currentUser]);
```

### Taking a Dose

**User Flow**:
1. User sees dose on Dashboard
2. Clicks "Take" button
3. Dose marked as taken
4. Pills remaining decremented

**Code Flow**:
```javascript
// In Dashboard.jsx
const handleTakeDose = async (logId) => {
  await markDoseAsTaken(logId); // Updates dose log
  // markDoseAsTaken also calls decrementPillsRemaining()
};
```

---

## 🛠️ Common Tasks

### Adding a New Field to Medications

1. **Update Firestore schema** (just add it, no migration needed)
2. **Update the form** in `src/pages/Medications.jsx`
3. **Update the service** in `src/services/medications.js`

```javascript
// In Medications.jsx - Add to form
<input
  type="text"
  value={formData.newField}
  onChange={(e) => setFormData({ ...formData, newField: e.target.value })}
/>

// In medications.js - Add to addMedication
const medRef = await addDoc(collection(db, 'medications'), {
  userId,
  name: medicationData.name,
  newField: medicationData.newField, // Add this
  // ... other fields
});
```

### Adding a New Page

1. **Create page component** in `src/pages/NewPage.jsx`
2. **Add route** in `src/App.jsx`
3. **Add navigation link** in `Navigation` component

```javascript
// In App.jsx
import NewPage from './pages/NewPage';

<Route
  path="/newpage"
  element={
    <PrivateRoute>
      <NewPage />
    </PrivateRoute>
  }
/>

// In Navigation component
<Link to="/newpage" className="nav-link">
  <Icon className="w-6 h-6" />
  <span>New Page</span>
</Link>
```

---

## 🐛 Debugging Tips

### Check Firestore Data
```javascript
// In browser console
import { db } from './config/firebase';
import { collection, getDocs } from 'firebase/firestore';

const snapshot = await getDocs(collection(db, 'medications'));
snapshot.docs.forEach(doc => console.log(doc.id, doc.data()));
```

### Check Notification Status
```javascript
// In browser console
console.log('Permission:', Notification.permission);
console.log('Supported:', 'Notification' in window);
```

### Common Issues

**Issue**: Notifications not working
- **Check**: Browser permission granted?
- **Check**: Is scheduler running? (Check console for "🔔 Starting...")
- **Check**: Are there active schedules for today?

**Issue**: Duplicate dose logs
- **Solution**: Click "Cleanup" button on Dashboard
- **Prevention**: Fixed in code audit (no longer creates duplicates)

**Issue**: Can't delete medication
- **Check**: Firestore rules allow it?
- **Check**: Console for errors?

---

## 🔒 Security Rules

### What Users Can Do

```javascript
// Own data
✅ Read own medications, schedules, dose logs
✅ Create own medications, schedules
✅ Update own medications, schedules, dose logs
✅ Delete own medications, schedules, dose logs

// Family data
✅ Read family member's medications, schedules, dose logs
❌ Cannot modify family member's data
```

### Firestore Rules Summary

```javascript
// Users can only access their own data or family data
allow read: if isOwner(userId) || isFamilyMember(userId);
allow write: if isOwner(userId);
```

---

## 📊 Performance Tips

### Efficient Queries

**Good** ✅:
```javascript
// Query with specific filters
const q = query(
  collection(db, 'doseLogs'),
  where('userId', '==', userId),
  where('scheduledAt', '>=', today),
  where('scheduledAt', '<', tomorrow)
);
```

**Bad** ❌:
```javascript
// Fetch all and filter in JS
const all = await getDocs(collection(db, 'doseLogs'));
const filtered = all.docs.filter(doc => doc.data().userId === userId);
```

### Batch Operations

**Good** ✅:
```javascript
// Delete in parallel
const deletePromises = docs.map(doc => deleteDoc(doc.ref));
await Promise.all(deletePromises);
```

**Bad** ❌:
```javascript
// Delete one by one
for (const doc of docs) {
  await deleteDoc(doc.ref); // Slow!
}
```

---

## 🧪 Testing

### Manual Testing Checklist

1. ✅ Add medication
2. ✅ Create schedule
3. ✅ Check Dashboard shows dose
4. ✅ Mark dose as taken
5. ✅ Check pills decremented
6. ✅ Delete medication (should delete schedules & dose logs)

### Test Notifications

1. Create schedule for current time + 2 minutes
2. Wait for notification
3. Click notification → should open Dashboard
4. Mark as taken

---

## 🚀 Deployment

### Prerequisites
- Firebase project created
- Vercel account
- `.env` file configured

### Steps
1. **Deploy Firestore Rules**: `firebase deploy --only firestore:rules`
2. **Deploy Frontend**: Push to GitHub → Vercel auto-deploys
3. **Test**: Open app, check all features work

---

## 💡 Best Practices

### Code Style
```javascript
// ✅ Good: Clear naming
const handleTakeDose = async (logId) => { ... }

// ❌ Bad: Unclear naming
const handle = async (id) => { ... }

// ✅ Good: Error handling
try {
  await updateDoc(ref, data);
} catch (error) {
  console.error('Error updating:', error);
  toast.error('Failed to update');
}

// ❌ Bad: No error handling
await updateDoc(ref, data);
```

### State Management
```javascript
// ✅ Good: Update state immutably
setFormData({ ...formData, name: newName });

// ❌ Bad: Mutate state
formData.name = newName;
setFormData(formData);
```

---

## 📞 Need Help?

### Resources
- Firebase Docs: https://firebase.google.com/docs
- React Docs: https://react.dev
- Tailwind Docs: https://tailwindcss.com

### Common Questions

**Q: How do I add a new medication field?**
A: See "Adding a New Field to Medications" above

**Q: Why are notifications not working?**
A: Check browser permission and console logs

**Q: How do I reset the database?**
A: Delete all documents in Firebase Console

---

## 🎉 You're Ready!

This guide covers 90% of what you need to know. The code is straightforward and well-commented. Happy coding! 🚀

