import React from 'react';
import { AdminGuard } from '../../admin/ui/adminGuard';
import { AdminDashboard } from '../../admin/ui/adminDashboard';

export default function AdminPage() {
  return (
    <main>
      <AdminGuard>
        <AdminDashboard />
      </AdminGuard>
    </main>
  );
}