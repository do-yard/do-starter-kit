import { withAuth } from 'lib/api/withAuth';
import { updateUserProfile } from './updateUserProfile';

export const PATCH = withAuth(updateUserProfile);
