# Testing Guide - My Meds App

## Recent Fixes Applied
1. ✅ Dashboard sync issue - dose logs now created automatically
2. ✅ Firestore rules updated - client-side dose log creation allowed
3. ✅ Take/Snooze/Skip buttons now working

## Complete Testing Flow

### Prerequisites
- Firebase project configured
- Firestore rules deployed
- App running on `localhost:3000`
- User logged in

---

## Test 1: Add Medication

### Steps:
1. Navigate to **Medications** page (bottom nav)
2. Click **"Add Medication"** button
3. Fill in the form:
   - **Name**: Aspirin
   - **Strength**: 500mg
   - **Form**: Tablet
   - **Pills Remaining**: 30
   - **Notes**: Take with food
4. Click **"Add Medication"**

### Expected Results:
✅ Success toast: "Medication added successfully"
✅ Medication appears in the list
✅ All details displayed correctly

---

## Test 2: Create Schedule

### Steps:
1. Navigate to **Schedules** page
2. Click **"Add Schedule"** button
3. Fill in the form:
   - **Medication**: Select "Aspirin" (from dropdown)
   - **Start Date**: Today's date
   - **End Date**: Leave empty (ongoing)
   - **Times**: Add 3 times:
     - 9:00 AM
     - 2:00 PM
     - 8:00 PM
   - **Instructions**: Take with water
4. Click **"Create Schedule"**

### Expected Results:
✅ Success toast: "Schedule created successfully"
✅ Schedule appears in the list
✅ Console log: "Created dose log for 9:00", "Created dose log for 2:00", etc.

---

## Test 3: Dashboard Sync

### Steps:
1. Navigate to **Dashboard** (Home icon in bottom nav)
2. Wait for page to load

### Expected Results:
✅ Console log: "Syncing today's dose logs..."
✅ Console log: "Dose logs synced successfully"
✅ **Today's Doses** count shows correct number (e.g., 3)
✅ **Upcoming** count shows doses not yet taken
✅ Doses listed in "Upcoming Doses" section with:
   - Medication name (Aspirin)
   - Strength and form (500mg • Tablet)
   - Scheduled time (e.g., 2:00 PM)
   - Instructions (Take with water)
   - Three buttons: Take, Snooze, Skip

---

## Test 4: Take Dose Button

### Steps:
1. On Dashboard, find an upcoming dose
2. Click **"Take"** button
3. Wait for action to complete

### Expected Results:
✅ Loading state on button (disabled)
✅ Success toast: "Dose marked as taken!"
✅ Dose moves to **"Completed Today"** section
✅ Status badge shows "taken" (green)
✅ **Completed** count increases by 1
✅ **Upcoming** count decreases by 1
✅ Pills remaining decreases by 1 (check Medications page)

---

## Test 5: Snooze Dose Button

### Steps:
1. On Dashboard, find an upcoming dose
2. Click **"Snooze"** button
3. Wait for action to complete

### Expected Results:
✅ Loading state on button
✅ Success toast: "Dose snoozed for 10 minutes"
✅ Dose shows "(Snoozed until [time])" text
✅ Dose remains in "Upcoming Doses" section
✅ After 10 minutes, snooze text disappears

---

## Test 6: Skip Dose Button

### Steps:
1. On Dashboard, find an upcoming dose
2. Click **"Skip"** button
3. Wait for action to complete

### Expected Results:
✅ Loading state on button
✅ Success toast: "Dose skipped"
✅ Dose moves to **"Completed Today"** section
✅ Status badge shows "skipped" (gray)
✅ **Completed** count increases by 1
✅ **Upcoming** count decreases by 1
✅ Pills remaining does NOT decrease

---

## Test 7: Refresh Page

### Steps:
1. Press **F5** or click browser refresh
2. Wait for page to reload

### Expected Results:
✅ User remains logged in
✅ Dashboard loads with correct data
✅ All counts remain accurate
✅ Completed doses still show in "Completed Today"
✅ Console log: "Initial dose logs sync completed"

---

## Test 8: Multiple Medications

### Steps:
1. Add another medication:
   - Name: Vitamin D
   - Strength: 1000 IU
   - Form: Capsule
2. Create schedule for Vitamin D:
   - Time: 10:00 AM
3. Go to Dashboard

### Expected Results:
✅ Both medications show in dashboard
✅ Counts include doses from both medications
✅ Each dose shows correct medication details
✅ Can interact with each dose independently

---

## Test 9: Past Time Schedule

### Steps:
1. Create a schedule with a time that already passed today
   - Example: If it's 3:00 PM, add a schedule for 1:00 PM
2. Go to Dashboard

### Expected Results:
✅ Dose log is NOT created for past time
✅ Only future times show in dashboard
✅ Console log shows: "Only create if the time hasn't passed yet"

---

## Test 10: Notifications (Optional)

### Steps:
1. When prompted, click **"Allow"** for notifications
2. Wait until a scheduled time arrives
3. Check for browser notification

### Expected Results:
✅ Browser notification appears at scheduled time
✅ Notification shows medication name
✅ Notification shows instructions
✅ Clicking notification opens dashboard

---

## Troubleshooting

### Issue: Dashboard shows 0 doses
**Check:**
- Browser console for errors
- Firestore rules deployed: `firebase deploy --only firestore:rules`
- Schedules exist and are active
- Times are for today and haven't passed

### Issue: "Failed to mark dose as taken"
**Check:**
- Firestore rules allow `update` on doseLogs
- User is authenticated
- Dose log exists in Firestore
- Browser console for specific error

### Issue: Doses not appearing after adding schedule
**Check:**
- Console log: "Created dose log for..."
- Firestore console: Check `doseLogs` collection
- Refresh dashboard page
- Check if schedule times are in the future

### Issue: Counts are wrong
**Check:**
- Refresh the page
- Check Firestore console for duplicate dose logs
- Verify schedule is active
- Check browser console for sync errors

---

## Browser Console Logs to Expect

### On Login:
```
Initial dose logs sync completed
Syncing today's dose logs...
Dose logs synced successfully
Notification permission granted
Starting client-side notification scheduler for user: [userId]
```

### On Dashboard Load:
```
Syncing today's dose logs...
Created dose log for 9:00
Created dose log for 14:00
Created dose log for 20:00
Dose logs synced successfully
```

### On Take/Snooze/Skip:
```
(No errors should appear)
```

---

## Success Criteria

All tests should pass with:
- ✅ No errors in browser console
- ✅ All success toasts appear
- ✅ Data persists after refresh
- ✅ Counts are accurate
- ✅ Buttons work as expected
- ✅ Firestore data is correct

If any test fails, check the troubleshooting section or review the error in the browser console.

