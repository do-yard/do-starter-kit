'use client';

// This layout wraps all protected routes and could handle authentication
// Each section (like dashboard) can have its own specific layout
export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  // Here you could add authentication logic
  // For example, redirect to login if not authenticated

  return children;
}
