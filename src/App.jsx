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
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:relative md:bottom-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-around md:justify-start md:gap-8 py-3">
          <Link
            to="/dashboard"
            className="flex flex-col md:flex-row items-center gap-1 md:gap-2 text-gray-600 hover:text-primary-600 transition-colors"
          >
            <Home className="w-6 h-6" />
            <span className="text-xs md:text-sm font-medium">Home</span>
          </Link>
          <Link
            to="/medications"
            className="flex flex-col md:flex-row items-center gap-1 md:gap-2 text-gray-600 hover:text-primary-600 transition-colors"
          >
            <Pill className="w-6 h-6" />
            <span className="text-xs md:text-sm font-medium">Medications</span>
          </Link>
          <Link
            to="/schedules"
            className="flex flex-col md:flex-row items-center gap-1 md:gap-2 text-gray-600 hover:text-primary-600 transition-colors"
          >
            <Calendar className="w-6 h-6" />
            <span className="text-xs md:text-sm font-medium">Schedules</span>
          </Link>
          <Link
            to="/family"
            className="flex flex-col md:flex-row items-center gap-1 md:gap-2 text-gray-600 hover:text-primary-600 transition-colors"
          >
            <Users className="w-6 h-6" />
            <span className="text-xs md:text-sm font-medium">Family</span>
          </Link>
          <Link
            to="/chatbot"
            className="flex flex-col md:flex-row items-center gap-1 md:gap-2 text-gray-600 hover:text-primary-600 transition-colors"
          >
            <MessageCircle className="w-6 h-6" />
            <span className="text-xs md:text-sm font-medium">Chat</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex flex-col md:flex-row items-center gap-1 md:gap-2 text-gray-600 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-6 h-6" />
            <span className="text-xs md:text-sm font-medium">Logout</span>
          </button>
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

