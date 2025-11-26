import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getTodayDoseLogs, markDoseAsTaken, snoozeDose, skipDose } from '../services/doseLogs';
import { getUserMedications } from '../services/medications';
import { getUserSchedules, syncTodayDoseLogs } from '../services/schedules';
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

      // Sync dose logs for today's schedules
      // This ensures any newly created schedules have their dose logs
      console.log('🔄 Syncing dose logs for dashboard...');
      await syncTodayDoseLogs(currentUser.uid);

      // Load today's dose logs
      const logs = await getTodayDoseLogs(currentUser.uid);
      console.log(`📊 Loaded ${logs.length} dose logs for today`);

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
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-8">
      {/* Header - Mobile Optimized */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-3">
              <Pill className="w-7 h-7 md:w-8 md:h-8 text-primary-600" />
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">My Meds</h1>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <button
                onClick={handleCleanupDuplicates}
                className="btn-secondary flex items-center gap-1 md:gap-2 text-xs md:text-sm p-2 md:px-4 md:py-2"
                title="Remove duplicate dose logs"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden md:inline">Cleanup</span>
              </button>
              <div className="text-right hidden sm:block">
                <p className="text-xs md:text-sm text-gray-500">Welcome back,</p>
                <p className="text-xs md:text-sm font-medium text-gray-900 truncate max-w-[120px] md:max-w-none">
                  {currentUser?.displayName || currentUser?.email?.split('@')[0]}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Mobile First */}
      <div className="max-w-7xl mx-auto px-4 py-4 md:py-8">
        {/* Quick Stats - Mobile Optimized */}
        <div className="grid grid-cols-3 gap-3 md:gap-6 mb-6 md:mb-8">
          <div className="card p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-500 mb-1">Today's</p>
                <p className="text-2xl md:text-3xl font-bold text-gray-900">{doseLogs.length}</p>
              </div>
              <Calendar className="w-8 h-8 md:w-12 md:h-12 text-primary-600 opacity-20 hidden md:block" />
            </div>
          </div>
          <div className="card p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-500 mb-1">Done</p>
                <p className="text-2xl md:text-3xl font-bold text-green-600">{completedDoses.length}</p>
              </div>
              <Check className="w-8 h-8 md:w-12 md:h-12 text-green-600 opacity-20 hidden md:block" />
            </div>
          </div>
          <div className="card p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-500 mb-1">Upcoming</p>
                <p className="text-2xl md:text-3xl font-bold text-blue-600">{upcomingDoses.length}</p>
              </div>
              <Bell className="w-8 h-8 md:w-12 md:h-12 text-blue-600 opacity-20 hidden md:block" />
            </div>
          </div>
        </div>

        {/* Upcoming Doses - Mobile Optimized */}
        <div className="mb-6 md:mb-8">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4 px-1">Upcoming Doses</h2>
          {upcomingDoses.length === 0 ? (
            <div className="card text-center py-8 md:py-12">
              <Bell className="w-12 h-12 md:w-16 md:h-16 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 text-sm md:text-base">No upcoming doses for today</p>
              <Link to="/medications" className="text-primary-600 hover:text-primary-700 font-medium mt-2 inline-block text-sm md:text-base">
                Add your first medication
              </Link>
            </div>
          ) : (
            <div className="space-y-3 md:space-y-4">
              {upcomingDoses.map((log) => {
                const med = medications[log.medId];
                const schedule = schedules[log.scheduleId];
                
                return (
                  <div key={log.id} className="card p-4 md:p-6">
                    {/* Mobile: Stack vertically, Desktop: Side by side */}
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          {med?.photoUrl && (
                            <img
                              src={med.photoUrl}
                              alt={med.name}
                              className="w-12 h-12 md:w-14 md:h-14 rounded-xl object-cover flex-shrink-0"
                            />
                          )}
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-gray-900 text-base md:text-lg truncate">
                              {med?.name || 'Unknown'}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {med?.strength} • {med?.form}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm md:text-base text-gray-600 mb-2">
                          <Clock className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                          <span className="font-medium">{format(log.scheduledAt.toDate(), 'h:mm a')}</span>
                          {log.snoozedUntil && (
                            <span className="text-orange-600 text-xs md:text-sm">
                              (Snoozed until {format(log.snoozedUntil.toDate(), 'h:mm a')})
                            </span>
                          )}
                        </div>
                        {schedule?.instructions && (
                          <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded-lg">
                            {schedule.instructions}
                          </p>
                        )}
                      </div>
                      {/* Buttons - Stack on mobile, horizontal on desktop */}
                      <div className="flex flex-col md:flex-row gap-2 md:ml-4 w-full md:w-auto">
                        <button
                          onClick={() => handleTakeDose(log.id)}
                          disabled={actionLoading === log.id}
                          className="btn-primary flex items-center justify-center gap-2 w-full md:w-auto"
                        >
                          <Check className="w-5 h-5 md:w-4 md:h-4" />
                          <span>Take</span>
                        </button>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSnoozeDose(log.id)}
                            disabled={actionLoading === log.id}
                            className="btn-secondary flex items-center justify-center gap-2 flex-1 md:flex-none"
                          >
                            <Clock className="w-4 h-4" />
                            <span className="hidden sm:inline">Snooze</span>
                          </button>
                          <button
                            onClick={() => handleSkipDose(log.id)}
                            disabled={actionLoading === log.id}
                            className="btn-secondary flex items-center justify-center gap-2 flex-1 md:flex-none"
                          >
                            <SkipForward className="w-4 h-4" />
                            <span className="hidden sm:inline">Skip</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Completed Doses - Mobile Optimized */}
        {completedDoses.length > 0 && (
          <div className="mb-6 md:mb-8">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4 px-1">Completed Today</h2>
            <div className="space-y-2 md:space-y-3">
              {completedDoses.map((log) => {
                const med = medications[log.medId];
                
                return (
                  <div key={log.id} className="card bg-gray-50 p-4 md:p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {med?.photoUrl && (
                          <img
                            src={med.photoUrl}
                            alt={med.name}
                            className="w-10 h-10 md:w-12 md:h-12 rounded-xl object-cover opacity-75 flex-shrink-0"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium text-gray-700 text-sm md:text-base truncate">
                            {med?.name || 'Unknown'}
                          </h3>
                          <p className="text-xs md:text-sm text-gray-500">
                            {format(log.scheduledAt.toDate(), 'h:mm a')}
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase flex-shrink-0 ${getStatusBadge(log.status)}`}>
                        {log.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Quick Actions - Mobile Optimized */}
        <div className="mt-6 md:mt-8 grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          <Link to="/medications" className="card hover:shadow-lg active:scale-[0.98] transition-all cursor-pointer p-4 md:p-6">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Pill className="w-6 h-6 md:w-7 md:h-7 text-primary-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-gray-900 text-base md:text-lg">Medications</h3>
                <p className="text-xs md:text-sm text-gray-500 mt-1">Manage your medicines</p>
              </div>
            </div>
          </Link>
          <Link to="/schedules" className="card hover:shadow-lg active:scale-[0.98] transition-all cursor-pointer p-4 md:p-6">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Calendar className="w-6 h-6 md:w-7 md:h-7 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-gray-900 text-base md:text-lg">Schedules</h3>
                <p className="text-xs md:text-sm text-gray-500 mt-1">View all schedules</p>
              </div>
            </div>
          </Link>
          <Link to="/family" className="card hover:shadow-lg active:scale-[0.98] transition-all cursor-pointer p-4 md:p-6">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 md:w-7 md:h-7 text-purple-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-gray-900 text-base md:text-lg">Family</h3>
                <p className="text-xs md:text-sm text-gray-500 mt-1">Manage caregivers</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

