'use client';

import DashboardLayout from 'components/dashboard/DashboardLayout';

/**
 * Layout wrapper del dashboard.
 * Inyecta el layout de Dashboard y renderiza su contenido hijo.
 *
 * @param children - Contenido de las páginas dentro del layout de dashboard.
 */
export default function DashboardLayoutWrapper({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
