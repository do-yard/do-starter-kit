import SignUpForm from 'components/SignUpForm/SignUpForm';
import React from 'react';

export const dynamic = 'force-dynamic';
/**
 * User registration page.
 * Presents the same visual characteristics as the landing page, with CTA to initiate the registration.
 *
 * @returns Registration page with benefits presentation and call to action.
 */
const SignupPage: React.FC = () => {
  return <SignUpForm />;
};

export default SignupPage;
