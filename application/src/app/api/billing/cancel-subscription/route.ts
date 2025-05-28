import { withAuth } from 'lib/auth/withAuth';
import { cancelSubscription } from './cancelSubscription';

export const POST = withAuth(cancelSubscription);
