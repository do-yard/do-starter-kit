import { withAuth } from 'lib/auth/withAuth';
import { createSubscription } from './createSubscription';

export const POST = withAuth(createSubscription);
