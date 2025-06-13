import ResetPasswordForm from 'components/ResetPasswordForm/ResetPasswordForm';
import { Suspense } from 'react';

/**
 * ResetPasswordPage renders the form for users to reset their password using a token from their email.
 */
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
