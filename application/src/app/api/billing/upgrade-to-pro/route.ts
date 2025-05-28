import { withAuth } from 'lib/auth/withAuth';
import { upgradeToPro } from './upgradeToPro';

export const POST = withAuth(upgradeToPro);
