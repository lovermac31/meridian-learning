'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import AdminDashboardEnhanced from './dashboard-enhanced';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      router.push('/admin/login');
    }
  }, [router]);

  // Show nothing while checking auth (will redirect)
  if (!isAdminAuthenticated()) {
    return null;
  }

  return <AdminDashboardEnhanced />;
}
