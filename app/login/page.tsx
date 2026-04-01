'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/use-auth';
import { useRouter } from 'next/navigation';

type UserRole = 'farmer' | 'buyer';

interface RoleInfo {
  id: UserRole;
  label: string;
  emoji: string;
  description: string;
  color: string;
}

const roles: RoleInfo[] = [
  {
    id: 'farmer',
    label: 'Farmer',
    emoji: '👨‍🌾',
    description: 'List crops and receive offers',
    color: 'from-green-500 to-green-600',
  },
  {
    id: 'buyer',
    label: 'Buyer',
    emoji: '🏪',
    description: 'Browse crops and make offers',
    color: 'from-blue-500 to-blue-600',
  },
];

export default function UnifiedLoginPage() {
  const router = useRouter();
  const { login, sendOTP } = useAuth();

  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [mode, setMode] = useState<'role' | 'phone' | 'otp'>('role');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    bankAccount: '',
  });
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const selectedRoleInfo = roles.find((r) => r.id === selectedRole);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setAuthMode('login');
    setMode('phone');
    setError('');
    setMessage('');
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!phone || phone.length !== 10) {
      setError('❌ Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    const success = await sendOTP(phone, selectedRole!);
    if (success) {
      setMessage('✅ OTP sent to your phone!');
      setMode('otp');
    }
    setLoading(false);
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!otp || otp.length !== 6) {
      setError('❌ Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    const name = authMode === 'signup' ? signupData.name : undefined;
    const email = authMode === 'signup' ? signupData.email : undefined;
    const bankAccount = authMode === 'signup' ? signupData.bankAccount : undefined;

    const success = await login(phone, otp, selectedRole!, name, email, bankAccount);
    if (success) {
      setMessage('🎉 Login successful! Redirecting...');
      setTimeout(() => {
        router.push(`/${selectedRole}`);
      }, 1000);
    }
    setLoading(false);
  };

  const handleBackToRole = () => {
    setMode('role');
    setPhone('');
    setOtp('');
    setSignupData({ name: '', email: '', bankAccount: '' });
    setAuthMode('login');
    setError('');
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-agri-green/10 via-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-agri-green mb-2">
            🌾 JanDhan Plus
          </h1>
          <p className="text-slate-600">Unified Marketplace for Agricultural Trading</p>
        </div>

        <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
          {mode === 'role' ? (
            // Role Selection Screen
            <div className="p-8">
              <h2 className="text-2xl font-bold text-center text-slate-800 mb-8">
                Select Your Role to Login
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => handleRoleSelect(role.id)}
                    className={`p-6 rounded-lg border-2 transition-all duration-300 text-left hover:shadow-lg ${
                      selectedRole === role.id
                        ? `border-agri-green bg-agri-green/5`
                        : 'border-slate-200 hover:border-agri-green'
                    }`}
                  >
                    <div className="text-4xl mb-3">{role.emoji}</div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">
                      {role.label}
                    </h3>
                    <p className="text-sm text-slate-600">{role.description}</p>
                  </button>
                ))}
              </div>

              <p className="text-center text-slate-500 text-sm mt-8">
                Click on a role card to proceed with login or registration
              </p>
            </div>
          ) : (
            // Login/Signup Screen
            <div className="p-8">
              {/* Header with Selected Role */}
              <div className="flex items-center justify-between mb-8 pb-6 border-b">
                <div className="flex items-center gap-4">
                  <div className="text-4xl">{selectedRoleInfo?.emoji}</div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">
                      {selectedRoleInfo?.label} Login
                    </h2>
                    <p className="text-slate-600 text-sm">
                      {selectedRoleInfo?.description}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleBackToRole}
                  className="text-slate-600 hover:text-slate-800 font-semibold text-sm"
                >
                  ← Change Role
                </button>
              </div>

              {/* Login/Signup Mode Selector */}
              {mode === 'phone' && (
                <div className="flex gap-2 mb-6 bg-slate-100 p-2 rounded-lg">
                  <button
                    onClick={() => setAuthMode('login')}
                    className={`flex-1 py-2 rounded-lg font-bold transition ${
                      authMode === 'login'
                        ? 'bg-agri-green text-white'
                        : 'bg-transparent text-slate-700 hover:text-agri-green'
                    }`}
                  >
                    🔓 Login
                  </button>
                  <button
                    onClick={() => setAuthMode('signup')}
                    className={`flex-1 py-2 rounded-lg font-bold transition ${
                      authMode === 'signup'
                        ? 'bg-agri-green text-white'
                        : 'bg-transparent text-slate-700 hover:text-agri-green'
                    }`}
                  >
                    ✍️ Sign Up
                  </button>
                </div>
              )}

              {/* Messages */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
                  {error}
                </div>
              )}
              {message && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">
                  {message}
                </div>
              )}

              {/* Phone Input */}
              {mode === 'phone' && (
                <form onSubmit={handleSendOTP} className="space-y-4">
                  {/* Phone Number */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="9876543210"
                      className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-agri-green text-lg"
                      required
                    />
                    <p className="text-xs text-slate-600 mt-1">
                      10-digit mobile number
                    </p>
                  </div>

                  {/* Signup Fields */}
                  {authMode === 'signup' && (
                    <>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={signupData.name}
                          onChange={(e) =>
                            setSignupData({ ...signupData, name: e.target.value })
                          }
                          placeholder="Your Full Name"
                          className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-agri-green"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={signupData.email}
                          onChange={(e) =>
                            setSignupData({ ...signupData, email: e.target.value })
                          }
                          placeholder="your.email@example.com"
                          className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-agri-green"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                          Bank Account / UPI ID *
                        </label>
                        <input
                          type="text"
                          value={signupData.bankAccount}
                          onChange={(e) =>
                            setSignupData({
                              ...signupData,
                              bankAccount: e.target.value,
                            })
                          }
                          placeholder="farmer@oaxis or IBAN"
                          className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-agri-green"
                          required
                        />
                      </div>
                    </>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-agri-green to-green-600 text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 transition disabled:opacity-50"
                  >
                    {loading ? '⏳ Sending OTP...' : '📱 Send OTP'}
                  </button>
                </form>
              )}

              {/* OTP Verification */}
              {mode === 'otp' && (
                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-4">
                    <p className="text-sm text-blue-700 font-semibold">
                      Verification code sent to: <span className="font-mono font-bold">{phone}</span>
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Enter OTP Code *
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
                      className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-agri-green text-center text-3xl font-mono tracking-widest"
                      required
                    />
                    <p className="text-xs text-slate-600 mt-1">6-digit code</p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="w-full bg-gradient-to-r from-agri-green to-green-600 text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 transition disabled:opacity-50"
                  >
                    {loading ? '⏳ Verifying...' : '✓ Verify & Login'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMode('phone');
                      setOtp('');
                      setError('');
                      setMessage('');
                    }}
                    className="w-full text-agri-green font-semibold py-2 hover:underline"
                  >
                    ← Back to Phone Number
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-slate-600 text-sm">
          <p>🔒 Secure OTP authentication • ⚡ Instant registration • 💼 Professional management</p>
        </div>
      </div>
    </div>
  );
}
