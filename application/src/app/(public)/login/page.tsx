import LoginForm from 'components/LoginForm/LoginForm';
import React from 'react';

export const dynamic = 'force-dynamic';
/**
 * Public login page.
 * Render the login form with the corresponding layout.
 */
const LoginPage: React.FC = () => {
  return <LoginForm />;
};

export default LoginPage;
