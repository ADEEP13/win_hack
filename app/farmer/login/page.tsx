'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function FarmerLogin() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to unified login page
    router.replace('/login?role=farmer');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-600">Redirecting to unified login...</p>
    </div>
  );
}
