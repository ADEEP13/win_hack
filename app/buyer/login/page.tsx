import { LoginComponent } from '@/components/login-component';

export default function BuyerLogin() {
  return (
    <LoginComponent
      userType="buyer"
      redirectPath="/buyer"
      title="🏪 Buyer Login"
      emoji="🏪"
    />
  );
}
