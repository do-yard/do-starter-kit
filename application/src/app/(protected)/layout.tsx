'use client';

import MaterialThemeProvider from 'components/Theme/Theme';

// This layout wraps all protected routes and could handle authentication
// Each section (like dashboard) can have its own specific layout
export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  // Here you could add authentication logic
  // For example, redirect to login if not authenticated

  return (
    <MaterialThemeProvider>
      {/* Common elements for all protected routes could go here */}
      {children}
    </MaterialThemeProvider>
  );
}
