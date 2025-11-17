import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  getUserMedications,
  addMedication,
  updateMedication,
  deleteMedication,
} from '../services/medications';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, Pill, X } from 'lucide-react';

export default function Medications() {
  const { currentUser } = useAuth();
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMed, setEditingMed] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    strength: '',
    form: 'tablet',
    notes: '',
    pillsRemaining: '',
  });
  // Photo upload disabled - Firebase Storage not enabled
  // const [photoFile, setPhotoFile] = useState(null);
  // const [photoPreview, setPhotoPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadMedications();
  }, [currentUser]);

  const loadMedications = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const meds = await getUserMedications(currentUser.uid);
      setMedications(meds);
    } catch (error) {
      console.error('Error loading medications:', error);
      toast.error('Failed to load medications');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (med = null) => {
    if (med) {
      setEditingMed(med);
      setFormData({
        name: med.name,
        strength: med.strength,
        form: med.form,
        notes: med.notes || '',
        pillsRemaining: med.pillsRemaining || '',
      });
      // setPhotoPreview(med.photoUrl); // Photo disabled
    } else {
      setEditingMed(null);
      setFormData({
        name: '',
        strength: '',
        form: 'tablet',
        notes: '',
        pillsRemaining: '',
      });
      // setPhotoPreview(null); // Photo disabled
    }
    // setPhotoFile(null); // Photo disabled
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingMed(null);
    setFormData({
      name: '',
      strength: '',
      form: 'tablet',
      notes: '',
      pillsRemaining: '',
    });
    // setPhotoFile(null); // Photo disabled
    // setPhotoPreview(null); // Photo disabled
  };

  // Photo upload disabled - Firebase Storage not enabled
  // const handlePhotoChange = (e) => {
  //   const file = e.target.files[0];
  //   if (file) {
  //     setPhotoFile(file);
  //     const reader = new FileReader();
  //     reader.onloadend = () => {
  //       setPhotoPreview(reader.result);
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name) {
      toast.error('Please enter medication name');
      return;
    }

    try {
      setSubmitting(true);

      const medData = {
        ...formData,
        pillsRemaining: formData.pillsRemaining ? parseInt(formData.pillsRemaining) : null,
      };

      if (editingMed) {
        await updateMedication(editingMed.id, medData, null); // No photo
        toast.success('Medication updated successfully');
      } else {
        await addMedication(currentUser.uid, medData, null); // No photo
        toast.success('Medication added successfully');
      }

      await loadMedications();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving medication:', error);
      toast.error('Failed to save medication');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (medId) => {
    if (!confirm('Are you sure you want to delete this medication? This will also delete all associated schedules.')) {
      return;
    }

    try {
      await deleteMedication(medId);
      toast.success('Medication deleted successfully');
      await loadMedications();
    } catch (error) {
      console.error('Error deleting medication:', error);
      toast.error('Failed to delete medication');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading medications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-8">
      {/* Header - Mobile Optimized */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 md:gap-3">
              <Pill className="w-7 h-7 md:w-8 md:h-8 text-primary-600" />
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">Medications</h1>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="btn-primary flex items-center gap-2 text-sm md:text-base"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Add Medication</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content - Mobile First */}
      <div className="max-w-7xl mx-auto px-4 py-4 md:py-8">
        {medications.length === 0 ? (
          <div className="card text-center py-12">
            <Pill className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No medications yet</h3>
            <p className="text-gray-500 mb-6">Add your first medication to get started</p>
            <button
              onClick={() => handleOpenModal()}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Medication
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {medications.map((med) => (
              <div key={med.id} className="card p-5 md:p-6">
                {/* Photo display disabled - Firebase Storage not enabled */}
                {/* {med.photoUrl && (
                  <img
                    src={med.photoUrl}
                    alt={med.name}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                )} */}
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">{med.name}</h3>
                <p className="text-sm md:text-base text-gray-600 mb-3">
                  {med.strength} • {med.form}
                </p>
                {med.notes && (
                  <p className="text-sm text-gray-500 mb-3 bg-gray-50 p-2 rounded-lg">{med.notes}</p>
                )}
                {med.pillsRemaining !== null && (
                  <div className="mb-4">
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${
                      med.pillsRemaining <= 10 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {med.pillsRemaining} pills remaining
                    </span>
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenModal(med)}
                    className="flex-1 btn-secondary flex items-center justify-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(med.id)}
                    className="flex-1 btn-danger flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal - Mobile Optimized */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end md:items-center justify-center z-50">
          <div className="bg-white rounded-t-3xl md:rounded-2xl max-w-md w-full max-h-[95vh] md:max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-5 md:p-6">
              {/* Mobile drag handle */}
              <div className="md:hidden flex justify-center mb-4">
                <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
              </div>
              <div className="flex items-center justify-between mb-5 md:mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                  {editingMed ? 'Edit Medication' : 'Add Medication'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 p-2 -mr-2"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Photo Upload - DISABLED (Firebase Storage not enabled) */}
                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Photo (Optional)
                  </label>
                  <div className="flex items-center gap-4">
                    {photoPreview ? (
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <label className="btn-secondary cursor-pointer flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Upload Photo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div> */}

                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Medication Name *
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                    placeholder="e.g., Aspirin"
                    required
                  />
                </div>

                {/* Strength */}
                <div>
                  <label htmlFor="strength" className="block text-sm font-medium text-gray-700 mb-2">
                    Strength
                  </label>
                  <input
                    id="strength"
                    type="text"
                    value={formData.strength}
                    onChange={(e) => setFormData({ ...formData, strength: e.target.value })}
                    className="input-field"
                    placeholder="e.g., 500mg"
                  />
                </div>

                {/* Form */}
                <div>
                  <label htmlFor="form" className="block text-sm font-medium text-gray-700 mb-2">
                    Form
                  </label>
                  <select
                    id="form"
                    value={formData.form}
                    onChange={(e) => setFormData({ ...formData, form: e.target.value })}
                    className="input-field"
                  >
                    <option value="tablet">Tablet</option>
                    <option value="capsule">Capsule</option>
                    <option value="liquid">Liquid</option>
                    <option value="injection">Injection</option>
                    <option value="cream">Cream</option>
                    <option value="inhaler">Inhaler</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Pills Remaining */}
                <div>
                  <label htmlFor="pillsRemaining" className="block text-sm font-medium text-gray-700 mb-2">
                    Pills Remaining (Optional)
                  </label>
                  <input
                    id="pillsRemaining"
                    type="number"
                    min="0"
                    value={formData.pillsRemaining}
                    onChange={(e) => setFormData({ ...formData, pillsRemaining: e.target.value })}
                    className="input-field"
                    placeholder="e.g., 30"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="input-field"
                    rows="3"
                    placeholder="Any additional notes..."
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
                    {submitting ? 'Saving...' : editingMed ? 'Update' : 'Add'}
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

