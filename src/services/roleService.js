import { request } from '@/api/client';
import { createResourceService } from './resourceService';

export const roleService = {
  ...createResourceService('roles'),

  /** Full permission catalog grouped by resource. */
  permissions: () => request({ method: 'GET', url: '/roles/permissions' }),
};

export default roleService;
