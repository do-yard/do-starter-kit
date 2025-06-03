import { withAuth } from 'lib/auth/withAuth';
import { getSubscription } from './getSubscription';

export const GET = withAuth(getSubscription);
