import { withAuth } from 'lib/auth/withAuth';
import { getAllUsers } from './getAllUsers';
import { updateUser } from './updateUser';
import { USER_ROLES } from '../../../lib/auth/roles';

export const GET = withAuth(getAllUsers, { allowedRoles: [USER_ROLES.ADMIN] });

export const PATCH = withAuth(updateUser, { allowedRoles: [USER_ROLES.ADMIN] });
