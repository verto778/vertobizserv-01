
import AdminUserManagement from '@/components/admin/AdminUserManagement';
import SuperAdminRoute from '@/components/admin/SuperAdminRoute';

const AdminPanel = () => {
  return (
    <SuperAdminRoute>
      <AdminUserManagement />
    </SuperAdminRoute>
  );
};

export default AdminPanel;
