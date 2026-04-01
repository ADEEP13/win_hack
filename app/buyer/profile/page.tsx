'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/use-auth';

interface UserProfile {
  id: string;
  phone: string;
  name: string;
  email?: string;
  bankAccount?: string;
  address?: string;
  city?: string;
  state?: string;
  profileImage?: string;
}

export default function BuyerProfilePage() {
  const router = useRouter();
  const { user, authenticated, loading: authLoading } = useAuth();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bankAccount: '',
    address: '',
    city: '',
    state: '',
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !authenticated) {
      router.push('/buyer/login');
    }
  }, [authenticated, authLoading, router]);

  // Fetch user profile
  useEffect(() => {
    if (authenticated && user?.phone) {
      fetchProfile();
    }
  }, [authenticated, user?.phone]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/profile');
      const data = await res.json();

      if (data.success && data.profile) {
        setProfile(data.profile);
        setFormData({
          name: data.profile.name || '',
          email: data.profile.email || '',
          bankAccount: data.profile.bankAccount || '',
          address: data.profile.address || '',
          city: data.profile.city || '',
          state: data.profile.state || '',
        });
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        setProfile(data.profile);
        setSuccessMessage('✅ Profile updated successfully!');
        setIsEditing(false);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(data.error || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🛍️</div>
          <p className="text-slate-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-agri-green mb-2">🛍️ My Profile</h1>
            <p className="text-slate-600">Manage your buyer account details</p>
          </div>
          <button
            onClick={() => router.push('/buyer')}
            className="bg-slate-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-slate-700 transition"
          >
            ← Back to Portal
          </button>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-md p-8">
          {!isEditing ? (
            // View Mode
            <>
              <div className="space-y-6">
                {/* Basic Info */}
                <div>
                  <h2 className="text-xl font-bold text-agri-green mb-4">Basic Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <p className="text-sm text-slate-600 font-semibold">Phone Number</p>
                      <p className="text-lg text-slate-800 font-mono font-bold">{user?.phone}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <p className="text-sm text-slate-600 font-semibold">Full Name</p>
                      <p className="text-lg text-slate-800 font-bold">{profile?.name || 'Not set'}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <p className="text-sm text-slate-600 font-semibold">Email</p>
                      <p className="text-lg text-slate-800">{profile?.email || 'Not set'}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <p className="text-sm text-slate-600 font-semibold">User Type</p>
                      <p className="text-lg text-slate-800 font-bold">🛍️ Buyer</p>
                    </div>
                  </div>
                </div>

                {/* Bank & Address Details */}
                <div>
                  <h2 className="text-xl font-bold text-agri-green mb-4">Banking & Address</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <p className="text-sm text-slate-600 font-semibold">Bank Account / UPI ID</p>
                      <p className="text-lg text-slate-800 font-mono">{profile?.bankAccount || 'Not set'}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <p className="text-sm text-slate-600 font-semibold">Address</p>
                      <p className="text-lg text-slate-800">{profile?.address || 'Not set'}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <p className="text-sm text-slate-600 font-semibold">City</p>
                      <p className="text-lg text-slate-800">{profile?.city || 'Not set'}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <p className="text-sm text-slate-600 font-semibold">State</p>
                      <p className="text-lg text-slate-800">{profile?.state || 'Not set'}</p>
                    </div>
                  </div>
                </div>

                {/* Profile Created Date */}
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <p className="text-sm text-blue-600 font-semibold">Profile Created</p>
                  <p className="text-slate-700">
                    {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Unknown'}
                  </p>
                  <p className="text-sm text-blue-600 font-semibold mt-2">Last Updated</p>
                  <p className="text-slate-700">
                    {profile?.updatedAt ? new Date(profile.updatedAt).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
              </div>

              {/* Edit Button */}
              <button
                onClick={() => setIsEditing(true)}
                className="w-full bg-agri-green text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 transition mt-8"
              >
                ✏️ Edit Profile
              </button>
            </>
          ) : (
            // Edit Mode
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <p className="text-sm text-blue-700 font-semibold">
                  📱 Phone Number (Cannot be changed): {user?.phone}
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-agri-green"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your.email@example.com"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-agri-green"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Bank Account / UPI ID *
                </label>
                <input
                  type="text"
                  name="bankAccount"
                  value={formData.bankAccount}
                  onChange={handleInputChange}
                  placeholder="buyer@oaxis or IBAN"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-agri-green"
                  required
                />
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-bold text-slate-700 mb-4">Address Details</h3>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Street Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="City/Street Address"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-agri-green"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="City"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-agri-green"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">State</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder="State"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-agri-green"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-agri-green text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 transition disabled:opacity-50"
                >
                  {loading ? '⏳ Saving...' : '💾 Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    // Reset form to original values
                    if (profile) {
                      setFormData({
                        name: profile.name || '',
                        email: profile.email || '',
                        bankAccount: profile.bankAccount || '',
                        address: profile.address || '',
                        city: profile.city || '',
                        state: profile.state || '',
                      });
                    }
                  }}
                  className="flex-1 bg-slate-600 text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 transition"
                >
                  ❌ Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
