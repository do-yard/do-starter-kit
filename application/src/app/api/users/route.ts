import { withAuth } from 'lib/auth/withAuth';
import { getAllUsers } from './getAllUsers';
import { updateUser } from './updateUser';

export const GET = withAuth(getAllUsers, { allowedRoles: ['ADMIN'] });

export const PATCH = withAuth(updateUser, { allowedRoles: ['ADMIN'] });