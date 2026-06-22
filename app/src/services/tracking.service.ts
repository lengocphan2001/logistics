import api from '../lib/api';
export const trackingService = {
  track: (code: string) => api.get('/tracking/'+code),
};
