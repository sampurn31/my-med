import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useEffect, useState } from 'react';
// Client-side notifications (no Cloud Functions needed - FREE!)
import { 
  startNotificationScheduler, 
  stopNotificationScheduler,
  requestNotificationPermission as requestClientNotificationPermission 
} from './services/clientNotifications';
import { syncTodayDoseLogs } from './services/schedules';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Medications from './pages/Medications';
import Schedules from './pages/Schedules';
import Family from './pages/Family';
import Chatbot from './pages/Chatbot';

// Icons
import { Home, Pill, Calendar, Users, MessageCircle, LogOut, Menu, X, User } from 'lucide-react';

function PrivateRoute({ children }) {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" />;
}

function Navigation() {
  const { currentUser, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  if (!currentUser) return null;

  const handleLogout = async () => {
    try {
      setShowMenu(false);
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-lg z-40 md:relative md:bottom-auto md:shadow-none md:border-t">
        {/* Safe area for notched phones */}
        <div className="pb-safe md:pb-0">
          <div className="max-w-7xl mx-auto px-2 md:px-4 sm:px-6 lg:px-8">
            <div className="flex justify-around md:justify-start md:gap-8 py-2 md:py-3">
              <Link
                to="/dashboard"
                className="flex flex-col items-center gap-1 text-gray-600 hover:text-primary-600 active:text-primary-600 transition-colors py-2 px-3 rounded-lg active:bg-gray-100 min-w-[60px]"
              >
                <Home className="w-6 h-6 md:w-5 md:h-5" />
                <span className="text-xs font-medium">Home</span>
              </Link>
              <Link
                to="/medications"
                className="flex flex-col items-center gap-1 text-gray-600 hover:text-primary-600 active:text-primary-600 transition-colors py-2 px-3 rounded-lg active:bg-gray-100 min-w-[60px]"
              >
                <Pill className="w-6 h-6 md:w-5 md:h-5" />
                <span className="text-xs font-medium">Meds</span>
              </Link>
              <Link
                to="/schedules"
                className="flex flex-col items-center gap-1 text-gray-600 hover:text-primary-600 active:text-primary-600 transition-colors py-2 px-3 rounded-lg active:bg-gray-100 min-w-[60px]"
              >
                <Calendar className="w-6 h-6 md:w-5 md:h-5" />
                <span className="text-xs font-medium">Schedule</span>
              </Link>
              <Link
                to="/chatbot"
                className="flex flex-col items-center gap-1 text-gray-600 hover:text-primary-600 active:text-primary-600 transition-colors py-2 px-3 rounded-lg active:bg-gray-100 min-w-[60px]"
              >
                <MessageCircle className="w-6 h-6 md:w-5 md:h-5" />
                <span className="text-xs font-medium">Chat</span>
              </Link>
              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowMenu(true)}
                className="flex flex-col items-center gap-1 text-gray-600 hover:text-primary-600 active:text-primary-600 transition-colors py-2 px-3 rounded-lg active:bg-gray-100 min-w-[60px] md:hidden"
              >
                <Menu className="w-6 h-6" />
                <span className="text-xs font-medium">More</span>
              </button>
              {/* Desktop Only - Family and Logout */}
              <Link
                to="/family"
                className="hidden md:flex flex-col items-center gap-1 text-gray-600 hover:text-primary-600 active:text-primary-600 transition-colors py-2 px-3 rounded-lg active:bg-gray-100 min-w-[60px]"
              >
                <Users className="w-5 h-5" />
                <span className="text-xs font-medium">Family</span>
              </Link>
              <button
                onClick={handleLogout}
                className="hidden md:flex flex-col items-center gap-1 text-gray-600 hover:text-red-600 active:text-red-600 transition-colors py-2 px-3 rounded-lg active:bg-gray-100 min-w-[60px]"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-xs font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Slide-up Menu */}
      {showMenu && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setShowMenu(false)}
          />
          
          {/* Menu Panel */}
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl animate-slide-up">
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
            </div>
            
            {/* Menu Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {currentUser.displayName || 'User'}
                    </p>
                    <p className="text-sm text-gray-500">{currentUser.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowMenu(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Menu Items */}
            <div className="px-4 py-4 space-y-2">
              <Link
                to="/family"
                onClick={() => setShowMenu(false)}
                className="flex items-center gap-4 px-4 py-4 hover:bg-gray-50 active:bg-gray-100 rounded-xl transition-colors"
              >
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Family Members</p>
                  <p className="text-sm text-gray-500">Manage caregiver access</p>
                </div>
              </Link>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-4 px-4 py-4 hover:bg-red-50 active:bg-red-100 rounded-xl transition-colors"
              >
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <LogOut className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-red-600">Logout</p>
                  <p className="text-sm text-red-400">Sign out of your account</p>
                </div>
              </button>
            </div>

            {/* Safe area padding */}
            <div className="pb-safe" />
          </div>
        </div>
      )}
    </>
  );
}

function AppContent() {
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      // Sync today's dose logs on app start
      syncTodayDoseLogs(currentUser.uid).then(() => {
        console.log('Initial dose logs sync completed');
      });

      // Request notification permission
      requestClientNotificationPermission().then((granted) => {
        if (granted) {
          console.log('Notification permission granted');
          // Start client-side notification scheduler
          startNotificationScheduler(currentUser.uid);
        } else {
          console.warn('Notification permission denied');
        }
      });
      
      return () => {
        // Stop scheduler when user logs out
        stopNotificationScheduler();
      };
    } else {
      // Stop scheduler if no user
      stopNotificationScheduler();
    }
  }, [currentUser]);

  return (
    <div className="min-h-screen bg-gray-50">
      {currentUser && <Navigation />}
      <div className={currentUser ? 'pb-20 md:pb-0' : ''}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/medications"
            element={
              <PrivateRoute>
                <Medications />
              </PrivateRoute>
            }
          />
          <Route
            path="/schedules"
            element={
              <PrivateRoute>
                <Schedules />
              </PrivateRoute>
            }
          />
          <Route
            path="/family"
            element={
              <PrivateRoute>
                <Family />
              </PrivateRoute>
            }
          />
          <Route
            path="/chatbot"
            element={
              <PrivateRoute>
                <Chatbot />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;

