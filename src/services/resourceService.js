import { api, request } from '@/api/client';
import { downloadBlob } from '@/utils/exporters';

/**
 * Factory for the backend's uniform REST convention:
 *   GET    /{resource}?page&limit&sort&search&...filters
 *   POST   /{resource}
 *   GET    /{resource}/{id}
 *   PUT    /{resource}/{id}
 *   DELETE /{resource}/{id}
 *   GET    /{resource}/export   (xlsx)
 *
 * All current and future HRMS modules share this shape, so each module's
 * service is a one-liner (plus any bespoke endpoints).
 */
export function createResourceService(resource) {
  return {
    resource,

    list: (params = {}) => request({ method: 'GET', url: `/${resource}`, params }),

    get: (id) => request({ method: 'GET', url: `/${resource}/${id}` }),

    create: (data) => request({ method: 'POST', url: `/${resource}`, data }),

    update: (id, data) => request({ method: 'PUT', url: `/${resource}/${id}`, data }),

    remove: (id) => request({ method: 'DELETE', url: `/${resource}/${id}` }),

    restore: (id) => request({ method: 'POST', url: `/${resource}/${id}/restore` }),

    async exportExcel(params = {}, filename = `${resource}.xlsx`) {
      const res = await api.get(`/${resource}/export`, { params, responseType: 'blob' });
      downloadBlob(res.data, filename);
    },

    async importFile(file) {
      const form = new FormData();
      form.append('file', file);
      return request({
        method: 'POST',
        url: `/${resource}/import`,
        data: form,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
  };
}

export default createResourceService;
