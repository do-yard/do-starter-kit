import { withAuth } from 'lib/auth/withAuth';
import { createCustomer } from './createCustomer';

export const POST = withAuth(createCustomer);
