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
  signup: (phone: string, name: string, role: string, email?: string, bankAccount?: string) => Promise<boolean>;
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
      // First, check if we have a token stored in sessionStorage
      const storedToken = typeof window !== 'undefined' ? sessionStorage.getItem('sessionToken') : null;
      
      const res = await fetch('/api/auth/verify-session', {
        credentials: 'include',
        headers: storedToken ? { 'X-Session-Token': storedToken } : {},
      });
      const data = await res.json();
      
      if (data.success && data.authenticated) {
        setUser(data.user);
        setAuthenticated(true);
        // Make sure token is in sessionStorage
        if (storedToken) {
          sessionStorage.setItem('sessionToken', storedToken);
        }
      } else {
        setUser(null);
        setAuthenticated(false);
        // Clear any stored token
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('sessionToken');
        }
      }
    } catch (error) {
      console.error('Failed to verify session:', error);
      setUser(null);
      setAuthenticated(false);
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('sessionToken');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const sendOTP = useCallback(async (phone: string, userType: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
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
          credentials: 'include',
          body: JSON.stringify({ phone, otp, userType, name, email, bankAccount }),
        });

        const data = await res.json();
        if (data.success) {
          setUser(data.user);
          setAuthenticated(true);
          
          // Store token in sessionStorage for fallback
          if (data.sessionToken && typeof window !== 'undefined') {
            sessionStorage.setItem('sessionToken', data.sessionToken);
            console.log('✅ Session token stored:', data.sessionToken.substring(0, 20) + '...');
          }
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
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      setUser(null);
      setAuthenticated(false);
      // Clear stored token
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('sessionToken');
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, []);

  const signup = useCallback(
    async (phone: string, name: string, role: string, email?: string, bankAccount?: string): Promise<boolean> => {
      try {
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ phone, name, role, email, bankAccount }),
        });

        const data = await res.json();
        if (data.success) {
          alert(`✅ ${data.message}`);
          return true;
        } else {
          alert(`❌ ${data.error}`);
          return false;
        }
      } catch (error) {
        console.error('Sign-up failed:', error);
        alert('❌ Sign-up failed. Please try again.');
        return false;
      }
    },
    []
  );

  return {
    user,
    loading,
    authenticated,
    login,
    logout,
    signup,
    sendOTP,
  };
}
