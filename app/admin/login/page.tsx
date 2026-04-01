import { LoginComponent } from '@/components/login-component';

export default function AdminLogin() {
  return (
    <LoginComponent
      userType="admin"
      redirectPath="/admin"
      title="🔐 Admin Login"
      emoji="🔐"
      description="Manage marketplace and verify transactions"
    />
  );
}
