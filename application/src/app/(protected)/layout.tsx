'use client';

import MaterialThemeProvider from 'components/Theme/Theme';

/**
 * Dashboard layout wrapper.
 * Injects the Dashboard layout and renders its child content.
 *
 * @param children - Content of the pages inside the dashboard layout.
 */
export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return <MaterialThemeProvider>{children}</MaterialThemeProvider>;
}
