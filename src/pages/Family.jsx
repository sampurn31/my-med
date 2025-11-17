import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getFamilyMembers, inviteFamilyMember, removeFamilyMember } from '../services/family';
import toast from 'react-hot-toast';
import { Users, Plus, X, Mail, UserPlus } from 'lucide-react';

export default function Family() {
  const { currentUser } = useAuth();
  const [familyMembers, setFamilyMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    loadFamilyMembers();
  }, [currentUser]);

  const loadFamilyMembers = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const members = await getFamilyMembers(currentUser.uid);
      setFamilyMembers(members);
    } catch (error) {
      console.error('Error loading family members:', error);
      toast.error('Failed to load family members');
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();

    if (!inviteEmail) {
      toast.error('Please enter an email address');
      return;
    }

    try {
      setInviting(true);
      const result = await inviteFamilyMember(currentUser.uid, inviteEmail);
      toast.success(`${result.inviteeName} added as family member!`);
      setInviteEmail('');
      setShowInviteModal(false);
      await loadFamilyMembers();
    } catch (error) {
      console.error('Error inviting family member:', error);
      toast.error(error.message || 'Failed to invite family member');
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async (memberId) => {
    if (!confirm('Are you sure you want to remove this family member?')) {
      return;
    }

    try {
      await removeFamilyMember(currentUser.uid, memberId);
      toast.success('Family member removed');
      await loadFamilyMembers();
    } catch (error) {
      console.error('Error removing family member:', error);
      toast.error('Failed to remove family member');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading family members...</p>
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
              <Users className="w-8 h-8 text-primary-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Family & Caregivers</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Add family members to receive notifications about your medication schedule
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowInviteModal(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Member
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {familyMembers.length === 0 ? (
          <div className="card text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No family members yet</h3>
            <p className="text-gray-500 mb-6">
              Add family members or caregivers to help monitor your medication schedule
            </p>
            <button
              onClick={() => setShowInviteModal(true)}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Member
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {familyMembers.map((member) => (
              <div key={member.id} className="card">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{member.name}</h3>
                      <p className="text-sm text-gray-500">{member.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemove(member.id)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-600">
                    Will receive notifications about missed doses
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Card */}
        <div className="mt-8 card bg-blue-50 border-blue-100">
          <div className="flex gap-3">
            <UserPlus className="w-6 h-6 text-blue-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">How it works</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Family members must have a My Meds account</li>
                <li>• They will receive notifications when you miss a dose</li>
                <li>• The connection is bidirectional - they can also add you to their family</li>
                <li>• You can remove family members at any time</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Add Family Member</h2>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleInvite} className="space-y-4">
                <div>
                  <label htmlFor="inviteEmail" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="inviteEmail"
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="input-field pl-10"
                      placeholder="family@example.com"
                      required
                      disabled={inviting}
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    The person must already have a My Meds account
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="flex-1 btn-secondary"
                    disabled={inviting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn-primary"
                    disabled={inviting}
                  >
                    {inviting ? 'Adding...' : 'Add Member'}
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

