'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/use-auth';
import { useRouter } from 'next/navigation';

interface LoginComponentProps {
  userType: 'farmer' | 'buyer' | 'consumer' | 'admin';
  redirectPath: string;
  title: string;
  emoji: string;
  description: string;
}

export function LoginComponent({ userType, redirectPath, title, emoji, description }: LoginComponentProps) {
  const router = useRouter();
  const { login, sendOTP } = useAuth();
  
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [step, setStep] = useState<'phone' | 'otp' | 'details'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    bankAccount: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phone || phone.length !== 10) {
      alert('❌ Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    const success = await sendOTP(phone, userType);
    if (success) {
      setStep('otp');
    }
    setLoading(false);
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      alert('❌ Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    const name = mode === 'signup' ? signupData.name : undefined;
    const email = mode === 'signup' ? signupData.email : undefined;
    const bankAccount = mode === 'signup' ? signupData.bankAccount : undefined;
    const success = await login(phone, otp, userType, name, email, bankAccount);
    if (success) {
      router.push(redirectPath);
    }
    setLoading(false);
  };

  const handleBackToPhone = () => {
    setOtp('');
    setStep('phone');
  };

  const handleBackToMode = () => {
    setPhone('');
    setOtp('');
    setSignupData({ name: '', email: '', bankAccount: '' });
    setStep('phone');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-agri-green/5 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-agri-green to-green-600 p-8 text-white text-center">
            <div className="text-5xl mb-4">{emoji}</div>
            <h1 className="text-3xl font-bold mb-2">{title}</h1>
            <p className="opacity-90">{description}</p>
          </div>

          {/* Mode Selector */}
          {step === 'phone' && (
            <div className="flex gap-2 p-4 bg-slate-100">
              <button
                onClick={() => setMode('login')}
                className={`flex-1 py-2 rounded-lg font-bold transition ${
                  mode === 'login'
                    ? 'bg-agri-green text-white'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                🔓 Login
              </button>
              <button
                onClick={() => setMode('signup')}
                className={`flex-1 py-2 rounded-lg font-bold transition ${
                  mode === 'signup'
                    ? 'bg-agri-green text-white'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                ✍️ Sign Up
              </button>
            </div>
          )}

          {/* Form */}
          <div className="p-8">
            {step === 'phone' && (
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="9876543210"
                    className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-agri-green text-lg"
                    autoFocus
                  />
                  <p className="text-xs text-slate-600 mt-1">Enter your 10-digit mobile number</p>
                </div>

                {mode === 'signup' && (
                  <>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={signupData.name}
                        onChange={(e) => setSignupData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter your full name"
                        className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-agri-green"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Email (Optional)
                      </label>
                      <input
                        type="email"
                        value={signupData.email}
                        onChange={(e) => setSignupData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="your.email@example.com"
                        className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-agri-green"
                      />
                    </div>

                    {(userType === 'farmer' || userType === 'buyer') && (
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                          Bank Account / UPI *
                        </label>
                        <input
                          type="text"
                          value={signupData.bankAccount}
                          onChange={(e) => setSignupData(prev => ({ ...prev, bankAccount: e.target.value }))}
                          placeholder="upi@bank or account number"
                          className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-agri-green"
                        />
                      </div>
                    )}
                  </>
                )}

                <button
                  type="submit"
                  disabled={loading || (mode === 'signup' && !signupData.name)}
                  className="w-full bg-agri-green text-white py-3 rounded-lg font-bold hover:opacity-90 transition disabled:opacity-50 text-lg"
                >
                  {loading ? '⏳ Sending OTP...' : '📱 Send OTP'}
                </button>
              </form>
            )}

            {step === 'otp' && (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <p className="text-sm text-slate-700">
                    OTP sent to <span className="font-bold">{phone}</span>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Enter OTP *
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-agri-green text-center text-2xl tracking-widest font-mono"
                    autoFocus
                  />
                  <p className="text-xs text-slate-600 mt-1">Check your SMS for the code</p>
                </div>

                {mode === 'signup' && (
                  <div className="bg-slate-50 p-3 rounded-lg text-sm">
                    <p className="font-bold text-slate-700 mb-2">Account Details:</p>
                    <p>📱 Phone: {phone}</p>
                    <p>👤 Name: {signupData.name}</p>
                    {signupData.email && <p>📧 Email: {signupData.email}</p>}
                    {signupData.bankAccount && <p>🏦 Bank: {signupData.bankAccount}</p>}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-agri-green text-white py-3 rounded-lg font-bold hover:opacity-90 transition disabled:opacity-50 text-lg"
                >
                  {loading ? '⏳ Verifying...' : mode === 'signup' ? '✅ Create Account' : '✅ Login'}
                </button>

                <button
                  type="button"
                  onClick={handleBackToPhone}
                  className="w-full bg-slate-200 text-slate-700 py-2 rounded-lg font-bold hover:bg-slate-300 transition"
                >
                  ← Change Phone
                </button>
              </form>
            )}
          </div>

          {/* Footer */}
          <div className="bg-slate-50 px-8 py-4 border-t text-center text-sm text-slate-600">
            <p>Secure login with OTP verification</p>
            <p className="mt-1 text-xs">Your data is protected and encrypted</p>
          </div>
        </div>
      </div>
    </div>
  );
}
