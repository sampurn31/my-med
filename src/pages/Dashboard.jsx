import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getTodayDoseLogs, markDoseAsTaken, snoozeDose, skipDose } from '../services/doseLogs';
import { getUserMedications } from '../services/medications';
import { getUserSchedules } from '../services/schedules';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Clock, Check, SkipForward, Bell, Pill, Calendar, Users, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cleanupDuplicateDoseLogs } from '../utils/cleanupDuplicates';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [doseLogs, setDoseLogs] = useState([]);
  const [medications, setMedications] = useState({});
  const [schedules, setSchedules] = useState({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, [currentUser]);

  const loadDashboardData = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);

      // Note: syncTodayDoseLogs is called in App.jsx on login, so we don't need to call it here
      // This prevents duplicate dose log creation

      // Load today's dose logs
      const logs = await getTodayDoseLogs(currentUser.uid);

      // Load medications
      const meds = await getUserMedications(currentUser.uid);
      const medsMap = {};
      meds.forEach(med => {
        medsMap[med.id] = med;
      });

      // Load schedules
      const scheds = await getUserSchedules(currentUser.uid);
      const schedsMap = {};
      scheds.forEach(sched => {
        schedsMap[sched.id] = sched;
      });

      setDoseLogs(logs);
      setMedications(medsMap);
      setSchedules(schedsMap);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleTakeDose = async (logId) => {
    try {
      setActionLoading(logId);
      await markDoseAsTaken(logId);
      toast.success('Dose marked as taken!');
      await loadDashboardData();
    } catch (error) {
      console.error('Error marking dose as taken:', error);
      toast.error('Failed to mark dose as taken');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSnoozeDose = async (logId) => {
    try {
      setActionLoading(logId);
      await snoozeDose(logId, 10);
      toast.success('Dose snoozed for 10 minutes');
      await loadDashboardData();
    } catch (error) {
      console.error('Error snoozing dose:', error);
      toast.error('Failed to snooze dose');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSkipDose = async (logId) => {
    try {
      setActionLoading(logId);
      await skipDose(logId);
      toast.success('Dose skipped');
      await loadDashboardData();
    } catch (error) {
      console.error('Error skipping dose:', error);
      toast.error('Failed to skip dose');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCleanupDuplicates = async () => {
    try {
      const result = await cleanupDuplicateDoseLogs(currentUser.uid);
      toast.success(`Cleaned up ${result.deleted} duplicate dose logs!`);
      await loadDashboardData();
    } catch (error) {
      console.error('Error cleaning up duplicates:', error);
      toast.error('Failed to cleanup duplicates');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      scheduled: 'bg-blue-100 text-blue-800',
      taken: 'bg-green-100 text-green-800',
      missed: 'bg-red-100 text-red-800',
      skipped: 'bg-gray-100 text-gray-800',
    };
    return badges[status] || badges.scheduled;
  };

  const upcomingDoses = doseLogs.filter(log => 
    log.status === 'scheduled' && 
    (!log.snoozedUntil || log.snoozedUntil.toDate() <= new Date())
  );

  const completedDoses = doseLogs.filter(log => 
    log.status === 'taken' || log.status === 'skipped'
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Pill className="w-8 h-8 text-primary-600" />
              <h1 className="text-2xl font-bold text-gray-900">My Meds</h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleCleanupDuplicates}
                className="btn-secondary flex items-center gap-2 text-sm"
                title="Remove duplicate dose logs"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Cleanup</span>
              </button>
              <div className="text-right">
                <p className="text-sm text-gray-500">Welcome back,</p>
                <p className="font-medium text-gray-900">{currentUser?.displayName || currentUser?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Today's Doses</p>
                <p className="text-3xl font-bold text-gray-900">{doseLogs.length}</p>
              </div>
              <Calendar className="w-12 h-12 text-primary-600 opacity-20" />
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-3xl font-bold text-green-600">{completedDoses.length}</p>
              </div>
              <Check className="w-12 h-12 text-green-600 opacity-20" />
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Upcoming</p>
                <p className="text-3xl font-bold text-blue-600">{upcomingDoses.length}</p>
              </div>
              <Bell className="w-12 h-12 text-blue-600 opacity-20" />
            </div>
          </div>
        </div>

        {/* Upcoming Doses */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Upcoming Doses</h2>
          {upcomingDoses.length === 0 ? (
            <div className="card text-center py-8">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No upcoming doses for today</p>
              <Link to="/medications" className="text-primary-600 hover:text-primary-700 font-medium mt-2 inline-block">
                Add your first medication
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingDoses.map((log) => {
                const med = medications[log.medId];
                const schedule = schedules[log.scheduleId];
                
                return (
                  <div key={log.id} className="card">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {med?.photoUrl && (
                            <img
                              src={med.photoUrl}
                              alt={med.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          )}
                          <div>
                            <h3 className="font-semibold text-gray-900">{med?.name || 'Unknown'}</h3>
                            <p className="text-sm text-gray-500">
                              {med?.strength} • {med?.form}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>{format(log.scheduledAt.toDate(), 'h:mm a')}</span>
                          {log.snoozedUntil && (
                            <span className="text-orange-600">
                              (Snoozed until {format(log.snoozedUntil.toDate(), 'h:mm a')})
                            </span>
                          )}
                        </div>
                        {schedule?.instructions && (
                          <p className="text-sm text-gray-600 mt-2">{schedule.instructions}</p>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleTakeDose(log.id)}
                          disabled={actionLoading === log.id}
                          className="btn-primary flex items-center gap-2"
                        >
                          <Check className="w-4 h-4" />
                          Take
                        </button>
                        <button
                          onClick={() => handleSnoozeDose(log.id)}
                          disabled={actionLoading === log.id}
                          className="btn-secondary flex items-center gap-2"
                        >
                          <Clock className="w-4 h-4" />
                          Snooze
                        </button>
                        <button
                          onClick={() => handleSkipDose(log.id)}
                          disabled={actionLoading === log.id}
                          className="btn-secondary flex items-center gap-2"
                        >
                          <SkipForward className="w-4 h-4" />
                          Skip
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Completed Doses */}
        {completedDoses.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Completed Today</h2>
            <div className="space-y-3">
              {completedDoses.map((log) => {
                const med = medications[log.medId];
                
                return (
                  <div key={log.id} className="card bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {med?.photoUrl && (
                          <img
                            src={med.photoUrl}
                            alt={med.name}
                            className="w-10 h-10 rounded-lg object-cover opacity-75"
                          />
                        )}
                        <div>
                          <h3 className="font-medium text-gray-700">{med?.name || 'Unknown'}</h3>
                          <p className="text-sm text-gray-500">
                            {format(log.scheduledAt.toDate(), 'h:mm a')}
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(log.status)}`}>
                        {log.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/medications" className="card hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center gap-3">
              <Pill className="w-8 h-8 text-primary-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Medications</h3>
                <p className="text-sm text-gray-500">Manage your medicines</p>
              </div>
            </div>
          </Link>
          <Link to="/schedules" className="card hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-primary-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Schedules</h3>
                <p className="text-sm text-gray-500">View all schedules</p>
              </div>
            </div>
          </Link>
          <Link to="/family" className="card hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-primary-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Family</h3>
                <p className="text-sm text-gray-500">Manage caregivers</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

