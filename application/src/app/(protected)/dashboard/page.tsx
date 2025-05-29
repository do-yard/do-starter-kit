import { auth } from 'lib/auth/auth';
import DashboardPageClient from './DashboardPageClient';

export default async function DashboardPage() {
  const session = await auth();
  return <DashboardPageClient userEmail={session?.user.email ?? ''} />;
}
