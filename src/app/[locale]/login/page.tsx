import { Suspense } from 'react';
import { AuthForm } from '@/features/auth/components/auth-form/auth-form';

export default function LoginPage() {
  return (
    <Suspense fallback={<section aria-busy="true" />}>
      <AuthForm mode="login" />
    </Suspense>
  );
}
