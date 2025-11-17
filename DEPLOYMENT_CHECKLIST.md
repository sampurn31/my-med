# My Meds - Deployment Checklist

Use this checklist to ensure everything is properly configured before going live.

## Pre-Deployment

### Code Review
- [ ] All TODO comments resolved
- [ ] No console.log statements in production code
- [ ] No hardcoded credentials or secrets
- [ ] Error handling implemented for all API calls
- [ ] Loading states implemented for async operations

### Environment Variables
- [ ] `.env` file created and configured
- [ ] All `VITE_*` variables set correctly
- [ ] `firebase-messaging-sw.js` updated with actual config
- [ ] `.env` added to `.gitignore`
- [ ] Environment variables documented in `env.example`

### Firebase Setup
- [ ] Firebase project created
- [ ] Authentication enabled (Email/Password + Google)
- [ ] Firestore database created
- [ ] Cloud Storage enabled
- [ ] Cloud Messaging configured
- [ ] VAPID key generated
- [ ] Authorized domains added (for production URL)

### Dependencies
- [ ] `npm install` completed successfully
- [ ] `cd functions && npm install` completed
- [ ] No security vulnerabilities (`npm audit`)
- [ ] All dependencies up to date

## Firebase Deployment

### Firestore
- [ ] Rules deployed: `firebase deploy --only firestore:rules`
- [ ] Indexes deployed: `firebase deploy --only firestore:indexes`
- [ ] Indexes built (check Firebase Console)
- [ ] Rules tested with emulator
- [ ] Sample data created for testing

### Storage
- [ ] Rules deployed: `firebase deploy --only storage`
- [ ] Rules tested with emulator

### Cloud Functions
- [ ] Functions deployed: `firebase deploy --only functions`
- [ ] All 4 functions deployed successfully:
  - [ ] scheduledNotifier
  - [ ] missedDetector
  - [ ] refillReminderWorker
  - [ ] dialogflowFulfillment
- [ ] Cloud Scheduler enabled
- [ ] Scheduler jobs created and running
- [ ] Function logs show no errors
- [ ] Test notification sent successfully

### Firebase Configuration
- [ ] Billing enabled (required for Cloud Functions)
- [ ] Budget alerts configured
- [ ] Quota limits reviewed
- [ ] Backup strategy defined

## Frontend Deployment

### Vercel Setup
- [ ] Vercel account created
- [ ] GitHub repository connected
- [ ] Project imported to Vercel
- [ ] Build settings configured:
  - [ ] Framework: Vite
  - [ ] Build Command: `npm run build`
  - [ ] Output Directory: `dist`
  - [ ] Install Command: `npm install`

### Environment Variables (Vercel)
- [ ] All `VITE_*` variables added
- [ ] Variables set for Production environment
- [ ] Variables set for Preview environment (optional)
- [ ] Variables set for Development environment (optional)

### Build & Deploy
- [ ] Build succeeds locally: `npm run build`
- [ ] Build succeeds on Vercel
- [ ] No build warnings
- [ ] Deployment successful
- [ ] Production URL accessible

### Domain & SSL
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] Domain added to Firebase authorized domains

## Post-Deployment Testing

### Authentication
- [ ] Can sign up with email/password
- [ ] Can login with email/password
- [ ] Can sign in with Google
- [ ] User document created in Firestore
- [ ] Can logout
- [ ] Session persists on refresh

### Core Features
- [ ] Can add medication
- [ ] Can upload medication photo
- [ ] Photo stored in Firebase Storage
- [ ] Can edit medication
- [ ] Can delete medication
- [ ] Can create schedule
- [ ] Can edit schedule
- [ ] Can delete schedule

### Dashboard
- [ ] Dashboard loads correctly
- [ ] Today's doses displayed
- [ ] Can mark dose as taken
- [ ] Pills remaining decremented
- [ ] Can snooze dose
- [ ] Can skip dose
- [ ] Completed doses shown

### Notifications
- [ ] Browser prompts for notification permission
- [ ] FCM token saved to Firestore
- [ ] Notification received at scheduled time
- [ ] Foreground notification shows toast
- [ ] Background notification shows in notification center
- [ ] Notification click opens app
- [ ] Snooze prevents duplicate notifications

### Family Features
- [ ] Can add family member
- [ ] Family member receives invite
- [ ] Can view family members
- [ ] Can remove family member
- [ ] Caregiver receives missed dose notification

### Chatbot
- [ ] Chatbot page loads
- [ ] Can send messages
- [ ] Bot responds correctly
- [ ] Disclaimer visible

### PWA
- [ ] PWA installable on desktop
- [ ] PWA installable on Android
- [ ] App works offline (cached assets)
- [ ] Service worker registered
- [ ] Manifest loaded correctly
- [ ] Icons display correctly

### Performance
- [ ] Dashboard loads in <2 seconds
- [ ] Medications page loads in <2 seconds
- [ ] Images load progressively
- [ ] No console errors
- [ ] No console warnings (except expected)

### Cross-Browser Testing
- [ ] Works in Chrome
- [ ] Works in Firefox
- [ ] Works in Safari
- [ ] Works in Edge
- [ ] Works on mobile browsers

### Security
- [ ] Cannot access other users' data
- [ ] Cannot modify other users' data
- [ ] Family members can read each other's data
- [ ] Protected routes require authentication
- [ ] Firestore rules enforced

## Monitoring Setup

### Firebase Console
- [ ] Usage dashboard reviewed
- [ ] Alerts configured for:
  - [ ] High Firestore reads/writes
  - [ ] Function errors
  - [ ] Storage usage
- [ ] Billing alerts configured

### Vercel Dashboard
- [ ] Deployment notifications enabled
- [ ] Analytics enabled (optional)
- [ ] Error tracking configured (optional)

### Cloud Functions
- [ ] Logs accessible: `firebase functions:log`
- [ ] Error alerts configured
- [ ] Execution metrics reviewed

## Documentation

- [ ] README.md updated with production URL
- [ ] SETUP_GUIDE.md reviewed
- [ ] RUNBOOK.md accessible to team
- [ ] QA_CHECKLIST.md completed
- [ ] PROJECT_SUMMARY.md reviewed

## CI/CD (Optional)

### GitHub Actions
- [ ] Workflow file present (`.github/workflows/deploy.yml`)
- [ ] GitHub secrets configured:
  - [ ] All `VITE_*` variables
  - [ ] `VERCEL_TOKEN`
  - [ ] `VERCEL_ORG_ID`
  - [ ] `VERCEL_PROJECT_ID`
  - [ ] `FIREBASE_TOKEN`
- [ ] Workflow runs successfully
- [ ] Auto-deployment works on push to main

## Production Readiness

### Performance
- [ ] Lighthouse score >90 (Performance)
- [ ] Lighthouse score >90 (Accessibility)
- [ ] Lighthouse score >90 (Best Practices)
- [ ] Lighthouse score >90 (SEO)
- [ ] PWA score 100

### Security
- [ ] No exposed API keys in client code
- [ ] Firebase security rules tested
- [ ] HTTPS enforced
- [ ] CORS configured correctly

### Scalability
- [ ] Database indexes optimized
- [ ] Query patterns efficient
- [ ] Function timeouts appropriate
- [ ] Storage limits considered

### Backup & Recovery
- [ ] Firestore backup strategy defined
- [ ] Rollback procedure documented
- [ ] Disaster recovery plan in place

## Launch

### Soft Launch
- [ ] Deploy to production
- [ ] Test with small group (5-10 users)
- [ ] Monitor for 24 hours
- [ ] Fix any critical issues

### Full Launch
- [ ] Announce to target audience
- [ ] Monitor usage metrics
- [ ] Monitor error rates
- [ ] Monitor costs
- [ ] Respond to user feedback

## Post-Launch

### Day 1
- [ ] Monitor Firebase usage
- [ ] Check Cloud Functions logs
- [ ] Verify notifications working
- [ ] Check error rates
- [ ] Review user feedback

### Week 1
- [ ] Review Firebase billing
- [ ] Optimize expensive queries (if any)
- [ ] Fix reported bugs
- [ ] Update documentation

### Month 1
- [ ] Performance review
- [ ] Security audit
- [ ] Cost optimization
- [ ] Feature prioritization
- [ ] User satisfaction survey

## Rollback Plan

If critical issues occur:

1. **Immediate**: Rollback Vercel deployment
   ```bash
   vercel rollback
   ```

2. **Functions**: Rollback to previous version
   ```bash
   firebase functions:delete FUNCTION_NAME
   firebase deploy --only functions:FUNCTION_NAME
   ```

3. **Rules**: Restore previous rules from Git history
   ```bash
   git checkout HEAD~1 firestore.rules
   firebase deploy --only firestore:rules
   ```

## Sign-Off

- [ ] Technical lead approval
- [ ] Product owner approval
- [ ] All critical issues resolved
- [ ] Documentation complete
- [ ] Monitoring in place

**Deployment Date**: _______________

**Deployed By**: _______________

**Production URL**: _______________

**Firebase Project**: _______________

**Status**: ☐ Ready ☐ Deployed ☐ Verified

---

**Notes**:
_______________________________________________
_______________________________________________
_______________________________________________

