import { withAuth } from 'lib/auth/withAuth';
import { checkout } from './checkout';

export const POST = withAuth(checkout);
