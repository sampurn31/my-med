# My Meds - Operational Runbook

This runbook provides operational procedures for maintaining and troubleshooting the My Meds application.

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Monitoring](#monitoring)
3. [Common Operations](#common-operations)
4. [Troubleshooting](#troubleshooting)
5. [Incident Response](#incident-response)
6. [Maintenance](#maintenance)

## System Architecture

### Components

1. **Frontend (Vercel)**
   - React PWA hosted on Vercel
   - Serves static assets and handles client-side routing
   - Communicates with Firebase services

2. **Firebase Authentication**
   - Handles user authentication (Email/Password, Google)
   - Manages user sessions

3. **Firestore Database**
   - NoSQL database storing:
     - Users, Medications, Schedules, Dose Logs, Notifications

4. **Cloud Storage**
   - Stores medication photos

5. **Cloud Functions**
   - `scheduledNotifier`: Sends dose reminders (every 5 min)
   - `missedDetector`: Detects missed doses (every 15 min)
   - `refillReminderWorker`: Sends refill reminders (daily 9 AM)
   - `dialogflowFulfillment`: Chatbot webhook

6. **Firebase Cloud Messaging (FCM)**
   - Delivers push notifications to users

### Data Flow

```
User → Vercel (Frontend) → Firebase Auth → Firestore
                         ↓
                    Cloud Storage (photos)
                         ↓
Cloud Scheduler → Cloud Functions → FCM → User Device
```

## Monitoring

### Key Metrics to Monitor

#### 1. Firebase Console

**Location**: https://console.firebase.google.com/

- **Authentication**
  - Daily active users
  - Sign-in success rate
  - Failed authentication attempts

- **Firestore**
  - Read/Write operations per day
  - Storage usage
  - Query performance

- **Cloud Functions**
  - Invocations per function
  - Execution time
  - Error rate
  - Memory usage

- **Cloud Messaging**
  - Messages sent
  - Delivery rate
  - Open rate

#### 2. Vercel Dashboard

**Location**: https://vercel.com/dashboard

- Deployment status
- Build success rate
- Response times
- Bandwidth usage

### Alerts to Setup

1. **Firebase Budget Alert**
   - Set at 80% of expected monthly budget
   - Configure in Google Cloud Console > Billing

2. **Function Error Rate**
   - Alert if error rate > 5%
   - Use Cloud Monitoring

3. **Firestore Read/Write Spike**
   - Alert if operations exceed 2x normal
   - Indicates potential issue or attack

## Common Operations

### 1. View Logs

#### Cloud Functions Logs

```bash
# All functions
firebase functions:log

# Specific function
firebase functions:log --only scheduledNotifier

# Last 100 lines
firebase functions:log --limit 100

# Real-time logs
firebase functions:log --follow
```

#### Vercel Logs

```bash
# Install Vercel CLI
npm i -g vercel

# View logs
vercel logs <deployment-url>
```

### 2. Deploy Updates

#### Frontend (Vercel)

```bash
# Automatic via GitHub push to main
git push origin main

# Manual deploy
vercel --prod
```

#### Cloud Functions

```bash
# Deploy all functions
firebase deploy --only functions

# Deploy specific function
firebase deploy --only functions:scheduledNotifier

# Deploy with debug
firebase deploy --only functions --debug
```

#### Firestore Rules

```bash
firebase deploy --only firestore:rules
```

### 3. Manually Trigger Cloud Functions

#### Via Cloud Console

1. Go to https://console.cloud.google.com/cloudscheduler
2. Select your project
3. Find the scheduler job (e.g., `scheduledNotifier`)
4. Click **"Run now"**

#### Via CLI

```bash
# Trigger HTTP function
curl https://YOUR_REGION-YOUR_PROJECT.cloudfunctions.net/dialogflowFulfillment \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

### 4. Backup Firestore Data

```bash
# Export to Cloud Storage
gcloud firestore export gs://YOUR_BUCKET/backups/$(date +%Y%m%d)

# Import from backup
gcloud firestore import gs://YOUR_BUCKET/backups/BACKUP_DATE
```

### 5. Rotate FCM VAPID Key

1. Firebase Console > Project Settings > Cloud Messaging
2. Click **"Generate new key pair"**
3. Update `.env` with new key
4. Redeploy frontend
5. Update `firebase-messaging-sw.js`
6. Users will need to re-enable notifications

### 6. Add/Remove User Manually

#### Add User

```javascript
// Firebase Console > Authentication > Users > Add user
// Or via Cloud Functions:
const admin = require('firebase-admin');
admin.auth().createUser({
  email: 'user@example.com',
  password: 'securePassword',
  displayName: 'User Name'
});
```

#### Delete User

```bash
# Firebase Console > Authentication > Users > Select user > Delete
# Or via CLI:
firebase auth:delete USER_UID
```

## Troubleshooting

### Issue 1: Notifications Not Being Sent

**Symptoms**: Users not receiving dose reminders

**Diagnosis**:

```bash
# Check function logs
firebase functions:log --only scheduledNotifier

# Check Cloud Scheduler
gcloud scheduler jobs list

# Check FCM quota
# Go to Firebase Console > Cloud Messaging > Usage
```

**Solutions**:

1. **Cloud Scheduler not running**
   ```bash
   # Resume scheduler
   gcloud scheduler jobs resume scheduledNotifier
   ```

2. **Function errors**
   - Check logs for specific errors
   - Verify Firestore indexes are built
   - Check function memory/timeout settings

3. **FCM tokens expired**
   - Tokens are automatically cleaned up
   - Users need to re-enable notifications

### Issue 2: High Firestore Costs

**Symptoms**: Unexpected Firebase bill

**Diagnosis**:

```bash
# Check usage in Firebase Console
# Firestore > Usage tab

# Identify expensive queries
# Enable query profiling in Firestore
```

**Solutions**:

1. **Optimize queries**
   - Add composite indexes
   - Limit query results
   - Use pagination

2. **Reduce real-time listeners**
   - Use one-time reads where possible
   - Unsubscribe from listeners when not needed

3. **Batch operations**
   - Batch writes in Cloud Functions
   - Use transactions for atomic updates

### Issue 3: Slow Dashboard Load

**Symptoms**: Dashboard takes >3 seconds to load

**Diagnosis**:

```bash
# Check Vercel deployment logs
vercel logs

# Check browser console for errors
# Network tab for slow requests
```

**Solutions**:

1. **Optimize Firestore queries**
   - Add indexes
   - Limit query size
   - Use pagination

2. **Optimize images**
   - Compress medication photos
   - Use WebP format
   - Lazy load images

3. **Cache data**
   - Use React Query or SWR
   - Cache in localStorage
   - Implement service worker caching

### Issue 4: Authentication Failures

**Symptoms**: Users cannot log in

**Diagnosis**:

```bash
# Check Firebase Auth logs
# Firebase Console > Authentication > Users

# Check browser console
# Look for CORS or network errors
```

**Solutions**:

1. **Domain not authorized**
   - Add domain to Firebase Console > Authentication > Settings > Authorized domains

2. **API key issues**
   - Verify API key in `.env`
   - Check API key restrictions in Google Cloud Console

3. **Network issues**
   - Check if Firebase services are down: https://status.firebase.google.com/

### Issue 5: Cloud Function Timeout

**Symptoms**: Function execution exceeds time limit

**Diagnosis**:

```bash
# Check function execution time
firebase functions:log --only FUNCTION_NAME | grep "execution took"
```

**Solutions**:

1. **Increase timeout**
   ```javascript
   // In functions/index.js
   exports.myFunction = functions
     .runWith({ timeoutSeconds: 300 })
     .pubsub.schedule('...')
   ```

2. **Optimize function code**
   - Reduce database queries
   - Batch operations
   - Use Promise.all for parallel operations

3. **Split into smaller functions**
   - Break large operations into chunks
   - Use task queues for long-running jobs

## Incident Response

### Severity Levels

- **P0 (Critical)**: Service completely down
- **P1 (High)**: Major feature broken (e.g., no notifications)
- **P2 (Medium)**: Minor feature broken (e.g., chatbot not working)
- **P3 (Low)**: Cosmetic issue

### Response Procedures

#### P0: Service Down

1. **Immediate Actions** (0-5 minutes)
   - Check Firebase status: https://status.firebase.google.com/
   - Check Vercel status: https://www.vercel-status.com/
   - Check recent deployments
   - Rollback if recent deploy caused issue

2. **Investigation** (5-30 minutes)
   - Check all logs (Vercel, Cloud Functions, Firestore)
   - Identify root cause
   - Estimate time to fix

3. **Resolution** (30+ minutes)
   - Fix issue
   - Deploy fix
   - Verify service restored
   - Monitor for 1 hour

4. **Post-Mortem** (within 24 hours)
   - Document incident
   - Identify prevention measures
   - Update runbook

#### P1: Critical Feature Down

1. Check function logs
2. Verify configuration
3. Test manually
4. Deploy fix if needed
5. Monitor for 30 minutes

#### P2/P3: Non-Critical Issues

1. Create GitHub issue
2. Prioritize in backlog
3. Fix in next sprint

## Maintenance

### Daily Tasks

- [ ] Check Firebase usage dashboard
- [ ] Review Cloud Functions error logs
- [ ] Monitor notification delivery rate

### Weekly Tasks

- [ ] Review Firestore query performance
- [ ] Check storage usage
- [ ] Review user feedback/issues
- [ ] Update dependencies (if needed)

### Monthly Tasks

- [ ] Review Firebase billing
- [ ] Optimize expensive queries
- [ ] Backup Firestore data
- [ ] Review and update security rules
- [ ] Performance audit
- [ ] Update documentation

### Quarterly Tasks

- [ ] Security audit
- [ ] Dependency updates
- [ ] Load testing
- [ ] Disaster recovery drill
- [ ] Review and update runbook

## Emergency Contacts

- **Firebase Support**: https://firebase.google.com/support
- **Vercel Support**: https://vercel.com/support
- **Project Owner**: [Your contact info]

## Useful Commands Reference

```bash
# Firebase
firebase login
firebase projects:list
firebase use PROJECT_ID
firebase deploy --only functions
firebase functions:log
firebase firestore:delete --all-collections

# Vercel
vercel login
vercel list
vercel logs DEPLOYMENT_URL
vercel rollback

# Google Cloud
gcloud projects list
gcloud config set project PROJECT_ID
gcloud scheduler jobs list
gcloud scheduler jobs run JOB_NAME
gcloud logging read "resource.type=cloud_function"

# Git
git log --oneline -10
git revert COMMIT_HASH
git push origin main
```

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [React Documentation](https://react.dev/)
- [Firestore Best Practices](https://firebase.google.com/docs/firestore/best-practices)

---

**Last Updated**: [Current Date]
**Maintained By**: [Your Name]

