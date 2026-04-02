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
}

const roles: RoleInfo[] = [
  {
    id: 'farmer',
    label: 'Farmer',
    emoji: '👨‍🌾',
    description: 'List crops and receive offers',
  },
  {
    id: 'buyer',
    label: 'Buyer',
    emoji: '🏪',
    description: 'Browse crops and make offers',
  },
];

type AuthFlow = 'role' | 'signup' | 'login-phone' | 'login-otp';

export default function UnifiedLoginPage() {
  const router = useRouter();
  const { signup, sendOTP, login } = useAuth();

  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [flow, setFlow] = useState<AuthFlow>('role');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    bankAccount: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const selectedRoleInfo = roles.find((r) => r.id === selectedRole);

  // Step 1: Role Select
  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setFlow('signup'); // Go to sign-up first
    setPhone('');
    setOtp('');
    setSignupData({ name: '', email: '', bankAccount: '' });
    setError('');
    setMessage('');
  };

  // Step 2: Sign-up submission
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!signupData.name || !phone || !signupData.bankAccount) {
      setError('❌ Please fill all required fields');
      return;
    }

    if (phone.length !== 10) {
      setError('❌ Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    const success = await signup(phone, signupData.name, selectedRole!, signupData.email, signupData.bankAccount);
    setLoading(false);

    if (success) {
      setMessage('✅ Sign-up successful! You can now log in.');
      // Clear form and go to login screen
      setTimeout(() => {
        setPhone('');
        setSignupData({ name: '', email: '', bankAccount: '' });
        setFlow('login-phone');
        setMessage('');
      }, 2000);
    }
  };

  // Step 3: Login - Send OTP
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!phone || phone.length !== 10) {
      setError('❌ Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    const success = await sendOTP(phone, selectedRole!);
    setLoading(false);

    if (success) {
      setMessage('✅ OTP sent to your phone!');
      setFlow('login-otp');
    }
  };

  // Step 4: Login - Verify OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!otp || otp.length !== 6) {
      setError('❌ Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    const success = await login(phone, otp, selectedRole!);
    setLoading(false);

    if (success) {
      setMessage('🎉 Login successful! Redirecting...');
      setTimeout(() => {
        router.push(`/${selectedRole}`);
      }, 1000);
    }
  };

  const handleBackToRole = () => {
    setFlow('role');
    setSelectedRole(null);
    setPhone('');
    setOtp('');
    setSignupData({ name: '', email: '', bankAccount: '' });
    setError('');
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-agri-green/10 via-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-agri-green mb-2">
            🌾 JanDhan Plus
          </h1>
          <p className="text-slate-600">Agricultural Marketplace</p>
        </div>

        <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
          {/* Role Selection */}
          {flow === 'role' ? (
            <div className="p-8">
              <h2 className="text-2xl font-bold text-center text-slate-800 mb-8">
                Select Your Role
              </h2>

              <div className="space-y-4">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => handleRoleSelect(role.id)}
                    className="w-full p-6 rounded-lg border-2 border-slate-200 hover:border-agri-green hover:bg-agri-green/5 transition-all text-left"
                  >
                    <div className="text-3xl mb-2">{role.emoji}</div>
                    <h3 className="text-lg font-bold text-slate-800">{role.label}</h3>
                    <p className="text-sm text-slate-600">{role.description}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-8">
              {/* Header with Role */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{selectedRoleInfo?.emoji}</span>
                  <h2 className="text-2xl font-bold text-slate-800">
                    {selectedRoleInfo?.label}
                  </h2>
                </div>
                <button
                  onClick={handleBackToRole}
                  className="text-slate-600 hover:text-slate-800 text-xl"
                >
                  ✕
                </button>
              </div>

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

              {/* Sign-Up Flow */}
              {flow === 'signup' && (
                <form onSubmit={handleSignup} className="space-y-4">
                  <h3 className="text-xl font-bold text-slate-800 mb-4">
                    📝 Create Your Account
                  </h3>

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
                      className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-agri-green"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={signupData.name}
                      onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
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
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
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
                      onChange={(e) => setSignupData({ ...signupData, bankAccount: e.target.value })}
                      placeholder="yourname@upi or Bank Account"
                      className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-agri-green"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-agri-green to-green-600 text-white font-bold py-3 rounded-lg hover:opacity-90 transition disabled:opacity-50"
                  >
                    {loading ? '⏳ Signing up...' : '✍️ Create Account'}
                  </button>

                  <p className="text-center text-slate-600 text-sm">
                    Already registered?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setFlow('login-phone');
                        setPhone('');
                        setError('');
                        setMessage('');
                      }}
                      className="text-agri-green font-bold hover:underline"
                    >
                      Log in instead
                    </button>
                  </p>
                </form>
              )}

              {/* Login - Phone Input */}
              {flow === 'login-phone' && (
                <form onSubmit={handleSendOTP} className="space-y-4">
                  <h3 className="text-xl font-bold text-slate-800 mb-4">
                    🔓 Login to Your Account
                  </h3>

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
                      className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-agri-green"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-agri-green to-green-600 text-white font-bold py-3 rounded-lg hover:opacity-90 transition disabled:opacity-50"
                  >
                    {loading ? '⏳ Sending OTP...' : '📱 Send OTP'}
                  </button>

                  <p className="text-center text-slate-600 text-sm">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setFlow('signup');
                        setPhone('');
                        setError('');
                        setMessage('');
                      }}
                      className="text-agri-green font-bold hover:underline"
                    >
                      Sign up here
                    </button>
                  </p>
                </form>
              )}

              {/* Login - OTP Verification */}
              {flow === 'login-otp' && (
                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  <h3 className="text-xl font-bold text-slate-800 mb-4">
                    ✅ Verify OTP
                  </h3>

                  <p className="text-slate-600 text-sm">
                    Enter the 6-digit OTP sent to <strong>{phone}</strong>
                  </p>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      OTP *
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
                      className="w-full px-4 py-3 text-center text-2xl border-2 border-slate-300 rounded-lg focus:outline-none focus:border-agri-green tracking-widest"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-agri-green to-green-600 text-white font-bold py-3 rounded-lg hover:opacity-90 transition disabled:opacity-50"
                  >
                    {loading ? '⏳ Verifying...' : '✅ Verify OTP'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFlow('login-phone');
                      setOtp('');
                      setError('');
                    }}
                    className="w-full text-agri-green font-bold py-2 hover:underline"
                  >
                    ← Back to Phone Number
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-slate-600 text-xs mt-6">
          🔒 Your data is secure and encrypted
        </p>
      </div>
    </div>
  );
}
