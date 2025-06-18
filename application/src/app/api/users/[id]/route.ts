import { withAuth } from 'lib/auth/withAuth';
import { updateUser } from './updateUser';
import { USER_ROLES } from 'lib/auth/roles';

export const PATCH = withAuth(updateUser, { allowedRoles: [USER_ROLES.ADMIN] });
