# My Meds - QA Testing Checklist

Use this checklist to verify all features are working correctly before deployment.

## Pre-Testing Setup

- [ ] Environment variables configured correctly
- [ ] Firebase project created and configured
- [ ] Cloud Functions deployed
- [ ] Firestore rules deployed
- [ ] Storage rules deployed
- [ ] Test user accounts created

## 1. Authentication Testing

### Email/Password Sign Up
- [ ] Can access signup page
- [ ] Form validation works (empty fields)
- [ ] Password confirmation validation works
- [ ] Can create account with valid credentials
- [ ] User document created in Firestore (`users/{uid}`)
- [ ] Redirected to dashboard after signup
- [ ] Error shown for duplicate email
- [ ] Error shown for weak password

### Email/Password Login
- [ ] Can access login page
- [ ] Can login with valid credentials
- [ ] Error shown for invalid credentials
- [ ] Redirected to dashboard after login
- [ ] Session persists on page refresh

### Google Sign In
- [ ] Google sign-in button visible
- [ ] Google auth popup opens
- [ ] Can sign in with Google account
- [ ] User document created in Firestore
- [ ] Redirected to dashboard after signin

### Logout
- [ ] Logout button visible in navigation
- [ ] Can logout successfully
- [ ] Redirected to login page
- [ ] Session cleared (cannot access protected routes)

## 2. Medications Management

### Add Medication
- [ ] Can access medications page
- [ ] "Add Medication" button visible
- [ ] Modal opens on click
- [ ] Form fields present (name, strength, form, notes, pills remaining)
- [ ] Can upload photo
- [ ] Photo preview shows
- [ ] Form validation works (required fields)
- [ ] Can save medication without photo
- [ ] Can save medication with photo
- [ ] Photo uploaded to Firebase Storage
- [ ] Medication appears in list
- [ ] Medication document created in Firestore

### View Medications
- [ ] All user medications displayed
- [ ] Medication details visible (name, strength, form)
- [ ] Photo displayed if present
- [ ] Pills remaining badge shows (if set)
- [ ] Low inventory warning (≤10 pills) shows in red

### Edit Medication
- [ ] Edit button visible on medication card
- [ ] Modal opens with pre-filled data
- [ ] Can update medication details
- [ ] Can change photo
- [ ] Can remove photo
- [ ] Changes saved to Firestore
- [ ] Updated medication reflects changes

### Delete Medication
- [ ] Delete button visible
- [ ] Confirmation dialog appears
- [ ] Can cancel deletion
- [ ] Medication deleted from Firestore
- [ ] Photo deleted from Storage
- [ ] Associated schedules deleted
- [ ] Medication removed from list

## 3. Schedules Management

### Add Schedule
- [ ] Can access schedules page
- [ ] "Add Schedule" button visible (if medications exist)
- [ ] Button disabled if no medications
- [ ] Modal opens on click
- [ ] Medication dropdown populated
- [ ] Can select start date
- [ ] Can select end date (optional)
- [ ] Can select recurrence type (daily/custom)
- [ ] Can add multiple times
- [ ] Can remove times
- [ ] Time validation works
- [ ] Can add instructions
- [ ] Schedule saved to Firestore
- [ ] Schedule appears in list

### View Schedules
- [ ] All user schedules displayed
- [ ] Medication name shown
- [ ] Start/end dates visible
- [ ] Recurrence type visible
- [ ] Times displayed
- [ ] Instructions shown (if present)

### Edit Schedule
- [ ] Edit button visible
- [ ] Modal opens with pre-filled data
- [ ] Can update schedule details
- [ ] Changes saved to Firestore
- [ ] Updated schedule reflects changes

### Delete Schedule
- [ ] Delete button visible
- [ ] Confirmation dialog appears
- [ ] Schedule deleted from Firestore
- [ ] Schedule removed from list

## 4. Dashboard & Dose Management

### Dashboard View
- [ ] Dashboard loads without errors
- [ ] User name displayed
- [ ] Today's date shown
- [ ] Stats cards visible (Today's Doses, Completed, Upcoming)
- [ ] Stats show correct counts
- [ ] Upcoming doses section visible
- [ ] Completed doses section visible (if any)
- [ ] Quick action cards visible

### Upcoming Doses
- [ ] Doses for today displayed
- [ ] Medication name shown
- [ ] Medication photo shown (if present)
- [ ] Scheduled time displayed
- [ ] Medication details visible (strength, form)
- [ ] Instructions shown (if present)
- [ ] Action buttons visible (Take, Snooze, Skip)

### Take Dose
- [ ] "Take" button clickable
- [ ] Loading state shown
- [ ] Dose marked as taken in Firestore
- [ ] `takenAt` timestamp set
- [ ] Status changed to "taken"
- [ ] Pills remaining decremented (if tracked)
- [ ] Success toast shown
- [ ] Dose moved to completed section
- [ ] Dashboard refreshes

### Snooze Dose
- [ ] "Snooze" button clickable
- [ ] Dose snoozed for 10 minutes
- [ ] `snoozedUntil` timestamp set
- [ ] Success toast shown
- [ ] Dose still in upcoming (with snooze indicator)
- [ ] No duplicate notifications during snooze

### Skip Dose
- [ ] "Skip" button clickable
- [ ] Dose marked as skipped
- [ ] Status changed to "skipped"
- [ ] Success toast shown
- [ ] Dose moved to completed section
- [ ] Pills remaining NOT decremented

### Completed Doses
- [ ] Completed doses shown
- [ ] Status badge displayed (taken/skipped)
- [ ] Medication details visible
- [ ] Time displayed

## 5. Push Notifications

### FCM Setup
- [ ] Browser prompts for notification permission
- [ ] Can allow notifications
- [ ] FCM token generated
- [ ] Token saved to Firestore (`users/{uid}.fcmTokens`)
- [ ] Token visible in Firebase Console

### Notification Delivery
- [ ] Notification sent at scheduled time
- [ ] Notification appears in browser (foreground)
- [ ] Notification appears in notification center (background)
- [ ] Notification title correct
- [ ] Notification body includes medication name
- [ ] Notification includes action buttons (background)

### Notification Actions
- [ ] Clicking notification opens app
- [ ] Deep link works (opens correct schedule)
- [ ] "Mark as Taken" action works (background)
- [ ] "Snooze" action works (background)

### Snooze Behavior
- [ ] No notification sent during snooze period
- [ ] Notification sent after snooze expires
- [ ] Multiple snoozes work correctly

## 6. Family/Caregiver Features

### Add Family Member
- [ ] Can access family page
- [ ] "Add Member" button visible
- [ ] Modal opens on click
- [ ] Email input field present
- [ ] Can enter family member email
- [ ] Error shown if user not found
- [ ] Error shown if adding self
- [ ] Success message shown on add
- [ ] Family member added to both users' `family` arrays
- [ ] Family member appears in list

### View Family Members
- [ ] All family members displayed
- [ ] Member name and email visible
- [ ] Remove button visible

### Remove Family Member
- [ ] Remove button clickable
- [ ] Confirmation dialog appears
- [ ] Member removed from both users' arrays
- [ ] Member removed from list

### Caregiver Notifications
- [ ] Missed dose detected after grace period
- [ ] Dose status changed to "missed"
- [ ] Notification sent to all family members
- [ ] Notification includes patient name and medication

## 7. Chatbot

### Chatbot UI
- [ ] Can access chatbot page
- [ ] Welcome message displayed
- [ ] Disclaimer visible
- [ ] Input field present
- [ ] Send button visible

### Chatbot Interaction
- [ ] Can type message
- [ ] Can send message (button or Enter key)
- [ ] User message appears
- [ ] Bot response appears
- [ ] Loading indicator shown while processing
- [ ] Messages scrollable
- [ ] Timestamps shown

### Chatbot Responses
- [ ] Greeting recognized
- [ ] Schedule queries answered
- [ ] Medication info queries answered
- [ ] Help command works
- [ ] Thank you recognized
- [ ] Default response for unknown queries

## 8. PWA Features

### PWA Installation
- [ ] Install prompt appears (Chrome)
- [ ] Can install app on Android
- [ ] App icon appears on home screen
- [ ] App opens in standalone mode
- [ ] Splash screen shows

### Offline Support
- [ ] App loads when offline (cached assets)
- [ ] Dashboard shows cached data
- [ ] Offline indicator shown (optional)
- [ ] Actions queued when offline (optional)

### Service Worker
- [ ] Service worker registered
- [ ] Assets cached
- [ ] Background notifications work
- [ ] Service worker updates properly

## 9. Security & Permissions

### Firestore Rules
- [ ] Users can only read their own data
- [ ] Users can only write their own data
- [ ] Family members can read each other's data
- [ ] Cannot access other users' data
- [ ] Cannot modify other users' data

### Storage Rules
- [ ] Users can upload to their own folder
- [ ] Users can delete their own photos
- [ ] Cannot access other users' photos

### Authentication
- [ ] Cannot access protected routes when logged out
- [ ] Redirected to login when accessing protected routes
- [ ] Session expires after inactivity (Firebase default)

## 10. Performance

### Load Times
- [ ] Dashboard loads in <2 seconds (good connection)
- [ ] Medications page loads in <2 seconds
- [ ] Schedules page loads in <2 seconds
- [ ] Images load progressively
- [ ] No layout shift during load

### Responsiveness
- [ ] Works on mobile (320px width)
- [ ] Works on tablet (768px width)
- [ ] Works on desktop (1920px width)
- [ ] Navigation adapts to screen size
- [ ] Modals responsive

### Database Performance
- [ ] Queries use indexes (no warnings)
- [ ] Large lists paginated (if >50 items)
- [ ] Real-time updates work smoothly

## 11. Error Handling

### Network Errors
- [ ] Error shown when offline
- [ ] Retry mechanism works
- [ ] Graceful degradation

### Validation Errors
- [ ] Form validation messages clear
- [ ] Required fields indicated
- [ ] Invalid data rejected

### Firebase Errors
- [ ] Auth errors shown to user
- [ ] Firestore errors handled
- [ ] Storage errors handled

## 12. Cross-Browser Testing

### Chrome
- [ ] All features work
- [ ] Notifications work
- [ ] PWA installable

### Firefox
- [ ] All features work
- [ ] Notifications work

### Safari (iOS)
- [ ] All features work
- [ ] PWA installable (Add to Home Screen)

### Edge
- [ ] All features work
- [ ] Notifications work

## 13. Accessibility

- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] ARIA labels present
- [ ] Color contrast sufficient
- [ ] Screen reader compatible (basic)

## 14. Cloud Functions

### scheduledNotifier
- [ ] Runs every 5 minutes
- [ ] Creates dose logs
- [ ] Sends notifications
- [ ] Respects snooze settings
- [ ] No duplicate notifications
- [ ] Logs visible in Firebase Console

### missedDetector
- [ ] Runs every 15 minutes
- [ ] Detects missed doses
- [ ] Updates dose status
- [ ] Notifies caregivers
- [ ] Logs visible

### refillReminderWorker
- [ ] Runs daily at 9 AM
- [ ] Detects low inventory
- [ ] Sends refill reminders
- [ ] Logs visible

## Test Results Summary

**Date**: _______________
**Tester**: _______________
**Environment**: ☐ Development ☐ Staging ☐ Production

**Total Tests**: _____
**Passed**: _____
**Failed**: _____
**Blocked**: _____

### Critical Issues Found

1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

### Notes

_______________________________________________
_______________________________________________
_______________________________________________

**Approval**: ☐ Ready for Production ☐ Needs Fixes

**Signature**: _______________

