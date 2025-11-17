import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserSchedules, addSchedule, updateSchedule, deleteSchedule } from '../services/schedules';
import { getUserMedications } from '../services/medications';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, Calendar, X, Clock } from 'lucide-react';

export default function Schedules() {
  const { currentUser } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [formData, setFormData] = useState({
    medId: '',
    startDate: '',
    endDate: '',
    recurrenceType: 'daily',
    intervalHours: '',
    times: ['09:00'],
    instructions: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const loadData = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const [scheds, meds] = await Promise.all([
        getUserSchedules(currentUser.uid),
        getUserMedications(currentUser.uid),
      ]);
      setSchedules(scheds);
      setMedications(meds);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load schedules');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (schedule = null) => {
    if (schedule) {
      setEditingSchedule(schedule);
      setFormData({
        medId: schedule.medId,
        startDate: format(schedule.startDate.toDate(), 'yyyy-MM-dd'),
        endDate: schedule.endDate ? format(schedule.endDate.toDate(), 'yyyy-MM-dd') : '',
        recurrenceType: schedule.recurrence.type,
        intervalHours: schedule.recurrence.intervalHours || '',
        times: schedule.times,
        instructions: schedule.instructions || '',
      });
    } else {
      setEditingSchedule(null);
      const today = format(new Date(), 'yyyy-MM-dd');
      setFormData({
        medId: medications[0]?.id || '',
        startDate: today,
        endDate: '',
        recurrenceType: 'daily',
        intervalHours: '',
        times: ['09:00'],
        instructions: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSchedule(null);
  };

  const handleAddTime = () => {
    setFormData({
      ...formData,
      times: [...formData.times, '09:00'],
    });
  };

  const handleRemoveTime = (index) => {
    setFormData({
      ...formData,
      times: formData.times.filter((_, i) => i !== index),
    });
  };

  const handleTimeChange = (index, value) => {
    const newTimes = [...formData.times];
    newTimes[index] = value;
    setFormData({
      ...formData,
      times: newTimes,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.medId) {
      toast.error('Please select a medication');
      return;
    }

    if (!formData.startDate) {
      toast.error('Please select a start date');
      return;
    }

    if (formData.times.length === 0) {
      toast.error('Please add at least one time');
      return;
    }

    try {
      setSubmitting(true);

      const scheduleData = {
        medId: formData.medId,
        startDate: formData.startDate,
        endDate: formData.endDate || null,
        recurrence: {
          type: formData.recurrenceType,
          intervalHours: formData.recurrenceType === 'custom' ? parseInt(formData.intervalHours) : null,
        },
        times: formData.times,
        instructions: formData.instructions,
      };

      if (editingSchedule) {
        await updateSchedule(editingSchedule.id, scheduleData);
        toast.success('Schedule updated successfully');
      } else {
        await addSchedule(currentUser.uid, scheduleData);
        toast.success('Schedule added successfully');
      }

      await loadData();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving schedule:', error);
      toast.error('Failed to save schedule');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (scheduleId) => {
    if (!confirm('Are you sure you want to delete this schedule?')) {
      return;
    }

    try {
      await deleteSchedule(scheduleId);
      toast.success('Schedule deleted successfully');
      await loadData();
    } catch (error) {
      console.error('Error deleting schedule:', error);
      toast.error('Failed to delete schedule');
    }
  };

  const getMedicationName = (medId) => {
    const med = medications.find((m) => m.id === medId);
    return med ? med.name : 'Unknown';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading schedules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-primary-600" />
              <h1 className="text-2xl font-bold text-gray-900">Schedules</h1>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="btn-primary flex items-center gap-2"
              disabled={medications.length === 0}
            >
              <Plus className="w-5 h-5" />
              Add Schedule
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {medications.length === 0 ? (
          <div className="card text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No medications yet</h3>
            <p className="text-gray-500 mb-6">Add a medication first before creating schedules</p>
          </div>
        ) : schedules.length === 0 ? (
          <div className="card text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No schedules yet</h3>
            <p className="text-gray-500 mb-6">Create your first schedule to get reminders</p>
            <button
              onClick={() => handleOpenModal()}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Schedule
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {schedules.map((schedule) => (
              <div key={schedule.id} className="card">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {getMedicationName(schedule.medId)}
                    </h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>
                        <span className="font-medium">Start:</span>{' '}
                        {format(schedule.startDate.toDate(), 'MMM dd, yyyy')}
                      </p>
                      {schedule.endDate && (
                        <p>
                          <span className="font-medium">End:</span>{' '}
                          {format(schedule.endDate.toDate(), 'MMM dd, yyyy')}
                        </p>
                      )}
                      <p>
                        <span className="font-medium">Recurrence:</span>{' '}
                        {schedule.recurrence.type === 'daily' ? 'Daily' : `Every ${schedule.recurrence.intervalHours} hours`}
                      </p>
                      <p>
                        <span className="font-medium">Times:</span>{' '}
                        {schedule.times.join(', ')}
                      </p>
                      {schedule.instructions && (
                        <p>
                          <span className="font-medium">Instructions:</span>{' '}
                          {schedule.instructions}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleOpenModal(schedule)}
                      className="btn-secondary flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(schedule.id)}
                      className="btn-danger flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingSchedule ? 'Edit Schedule' : 'Add Schedule'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Medication */}
                <div>
                  <label htmlFor="medId" className="block text-sm font-medium text-gray-700 mb-2">
                    Medication *
                  </label>
                  <select
                    id="medId"
                    value={formData.medId}
                    onChange={(e) => setFormData({ ...formData, medId: e.target.value })}
                    className="input-field"
                    required
                  >
                    <option value="">Select medication</option>
                    {medications.map((med) => (
                      <option key={med.id} value={med.id}>
                        {med.name} ({med.strength})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Start Date */}
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>

                {/* End Date */}
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                    End Date (Optional)
                  </label>
                  <input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="input-field"
                    min={formData.startDate}
                  />
                </div>

                {/* Recurrence Type */}
                <div>
                  <label htmlFor="recurrenceType" className="block text-sm font-medium text-gray-700 mb-2">
                    Recurrence *
                  </label>
                  <select
                    id="recurrenceType"
                    value={formData.recurrenceType}
                    onChange={(e) => setFormData({ ...formData, recurrenceType: e.target.value })}
                    className="input-field"
                    required
                  >
                    <option value="daily">Daily</option>
                    <option value="custom">Custom Interval</option>
                  </select>
                </div>

                {/* Interval Hours (if custom) */}
                {formData.recurrenceType === 'custom' && (
                  <div>
                    <label htmlFor="intervalHours" className="block text-sm font-medium text-gray-700 mb-2">
                      Interval (hours) *
                    </label>
                    <input
                      id="intervalHours"
                      type="number"
                      min="1"
                      max="24"
                      value={formData.intervalHours}
                      onChange={(e) => setFormData({ ...formData, intervalHours: e.target.value })}
                      className="input-field"
                      placeholder="e.g., 8"
                      required
                    />
                  </div>
                )}

                {/* Times */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Times *
                  </label>
                  <div className="space-y-2">
                    {formData.times.map((time, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="time"
                          value={time}
                          onChange={(e) => handleTimeChange(index, e.target.value)}
                          className="input-field flex-1"
                          required
                        />
                        {formData.times.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveTime(index)}
                            className="btn-danger"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={handleAddTime}
                      className="btn-secondary w-full flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Time
                    </button>
                  </div>
                </div>

                {/* Instructions */}
                <div>
                  <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-2">
                    Instructions (Optional)
                  </label>
                  <textarea
                    id="instructions"
                    value={formData.instructions}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                    className="input-field"
                    rows="3"
                    placeholder="e.g., Take with food"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 btn-secondary"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? 'Saving...' : editingSchedule ? 'Update' : 'Add'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

