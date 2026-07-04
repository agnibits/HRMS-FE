import { request } from '@/api/client';
import { createResourceService } from './resourceService';

export const userService = {
  ...createResourceService('users'),

  setRoles: (id, roleIds) =>
    request({ method: 'PUT', url: `/users/${id}/roles`, data: { roleIds } }),

  updateMyProfile: (data) =>
    request({ method: 'PATCH', url: '/users/me/profile', data }),
};

export default userService;
