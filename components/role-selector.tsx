'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

type UserRole = 'farmer' | 'buyer' | 'consumer' | 'admin';

interface RoleOption {
  id: UserRole;
  label: string;
  emoji: string;
  description: string;
  color: string;
}

const roles: RoleOption[] = [
  {
    id: 'farmer',
    label: 'Farmer',
    emoji: '👨‍🌾',
    description: 'List crops and receive offers from buyers',
    color: 'from-green-500 to-green-600',
  },
  {
    id: 'buyer',
    label: 'Buyer',
    emoji: '🏪',
    description: 'Browse crops and make offers to farmers',
    color: 'from-blue-500 to-blue-600',
  },
  {
    id: 'consumer',
    label: 'Consumer',
    emoji: '👥',
    description: 'Purchase fresh crops directly',
    color: 'from-orange-500 to-orange-600',
  },
  {
    id: 'admin',
    label: 'Administrator',
    emoji: '🔐',
    description: 'Manage marketplace and transactions',
    color: 'from-red-500 to-red-600',
  },
];

export function RoleSelector() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleSelect = async (role: UserRole) => {
    setIsLoading(true);
    setSelectedRole(role);
    // Navigate to role-specific login
    router.push(`/${role}/login`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-agri-green/10 via-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-agri-green mb-4">
            🌾 JanDhan Plus Marketplace
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Select your role to get started. Whether you're a farmer looking to sell, a buyer looking to purchase, or a consumer seeking fresh products, we have the right platform for you.
          </p>
        </div>

        {/* Role Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => handleRoleSelect(role.id)}
              disabled={isLoading && selectedRole !== role.id}
              className={`relative group overflow-hidden rounded-lg shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {/* Background Gradient */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${role.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
              />

              {/* Content */}
              <div className="relative bg-white p-8 text-center">
                {/* Emoji */}
                <div className="text-6xl mb-4">{role.emoji}</div>

                {/* Role Name */}
                <h2 className="text-2xl font-bold text-slate-800 mb-2">
                  {role.label}
                </h2>

                {/* Description */}
                <p className="text-slate-600 text-sm mb-6">{role.description}</p>

                {/* Button */}
                <button
                  onClick={() => handleRoleSelect(role.id)}
                  disabled={isLoading && selectedRole !== role.id}
                  className={`w-full py-2 px-4 rounded-lg font-bold text-white transition-all duration-300 group-hover:translate-y-1 bg-gradient-to-br ${role.color} hover:shadow-lg disabled:opacity-50`}
                >
                  {isLoading && selectedRole === role.id ? (
                    <>
                      <span className="inline-block mr-2">⏳</span>
                      Loading...
                    </>
                  ) : (
                    <>
                      <span className="inline-block mr-2">→</span>
                      Login as {role.label}
                    </>
                  )}
                </button>
              </div>

              {/* Hover Border */}
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-current rounded-lg transition-colors duration-300" />
            </button>
          ))}
        </div>

        {/* Footer Info */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <h3 className="text-lg font-bold text-agri-green mb-2">🔒 Secure</h3>
              <p className="text-slate-600 text-sm">
                OTP-based phone authentication for maximum security
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-agri-green mb-2">⚡ Fast</h3>
              <p className="text-slate-600 text-sm">
                Instant registration and account setup in seconds
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-agri-green mb-2">💼 Professional</h3>
              <p className="text-slate-600 text-sm">
                Complete profile management and transaction history
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Info */}
        <div className="text-center text-slate-600 text-sm">
          <p>
            🔐 Your data is secure and encrypted. We never share your information with third parties.
          </p>
        </div>
      </div>
    </div>
  );
}
