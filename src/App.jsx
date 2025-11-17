import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useEffect } from 'react';
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
import { Home, Pill, Calendar, Users, MessageCircle, LogOut } from 'lucide-react';

function PrivateRoute({ children }) {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" />;
}

function Navigation() {
  const { currentUser, logout } = useAuth();

  if (!currentUser) return null;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-lg md:relative md:bottom-auto md:shadow-none md:border-t">
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
              to="/family"
              className="flex flex-col items-center gap-1 text-gray-600 hover:text-primary-600 active:text-primary-600 transition-colors py-2 px-3 rounded-lg active:bg-gray-100 min-w-[60px] hidden md:flex"
            >
              <Users className="w-6 h-6 md:w-5 md:h-5" />
              <span className="text-xs font-medium">Family</span>
            </Link>
            <Link
              to="/chatbot"
              className="flex flex-col items-center gap-1 text-gray-600 hover:text-primary-600 active:text-primary-600 transition-colors py-2 px-3 rounded-lg active:bg-gray-100 min-w-[60px]"
            >
              <MessageCircle className="w-6 h-6 md:w-5 md:h-5" />
              <span className="text-xs font-medium">Chat</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex flex-col items-center gap-1 text-gray-600 hover:text-red-600 active:text-red-600 transition-colors py-2 px-3 rounded-lg active:bg-gray-100 min-w-[60px] hidden md:flex"
            >
              <LogOut className="w-6 h-6 md:w-5 md:h-5" />
              <span className="text-xs font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
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

