import { LoginComponent } from '@/components/login-component';

export default function FarmerLogin() {
  return (
    <LoginComponent
      userType="farmer"
      redirectPath="/farmer"
      title="👨‍🌾 Farmer Login"
      emoji="👨‍🌾"
    />
  );
}
