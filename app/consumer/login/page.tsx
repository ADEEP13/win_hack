import { LoginComponent } from '@/components/login-component';

export default function ConsumerLogin() {
  return (
    <LoginComponent
      userType="consumer"
      redirectPath="/consumer"
      title="🔍 Consumer Login"
      emoji="🔍"
      description="Scan QR codes and trace food from farm to table"
    />
  );
}
