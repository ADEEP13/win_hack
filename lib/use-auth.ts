import { useState, useEffect, useCallback } from 'react';

export interface User {
  id: string;
  phone: string;
  name: string;
  userType: 'farmer' | 'buyer' | 'consumer' | 'admin';
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  authenticated: boolean;
  login: (phone: string, otp: string, userType: string, name?: string, email?: string, bankAccount?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  sendOTP: (phone: string, userType: string) => Promise<boolean>;
}

export function useAuth(): AuthContextType {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  // Verify session on mount
  useEffect(() => {
    verifySession();
  }, []);

  const verifySession = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/verify-session');
      const data = await res.json();
      
      if (data.success && data.authenticated) {
        setUser(data.user);
        setAuthenticated(true);
      } else {
        setUser(null);
        setAuthenticated(false);
      }
    } catch (error) {
      console.error('Failed to verify session:', error);
      setUser(null);
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const sendOTP = useCallback(async (phone: string, userType: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, userType }),
      });
      
      const data = await res.json();
      if (data.success) {
        // Show demo OTP in development
        if (data.demo_otp) {
          console.log(`📱 Demo OTP: ${data.demo_otp}`);
          alert(`📱 Demo OTP: ${data.demo_otp}\\n\\nThe OTP has been sent to your phone.`);
        }
        return true;
      } else {
        alert(`❌ ${data.error}`);
        return false;
      }
    } catch (error) {
      console.error('Failed to send OTP:', error);
      alert('❌ Failed to send OTP. Please try again.');
      return false;
    }
  }, []);

  const login = useCallback(
    async (phone: string, otp: string, userType: string, name?: string, email?: string, bankAccount?: string): Promise<boolean> => {
      try {
        const res = await fetch('/api/auth/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, otp, userType, name, email, bankAccount }),
        });

        const data = await res.json();
        if (data.success) {
          setUser(data.user);
          setAuthenticated(true);
          return true;
        } else {
          alert(`❌ ${data.error}`);
          return false;
        }
      } catch (error) {
        console.error('Login failed:', error);
        alert('❌ Login failed. Please try again.');
        return false;
      }
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      setAuthenticated(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, []);

  return {
    user,
    loading,
    authenticated,
    login,
    logout,
    sendOTP,
  };
}
