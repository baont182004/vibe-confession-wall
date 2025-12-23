import api from './api';

export const getWeeklyPlan = (weekId) => api.get('/weekly-plan', { params: { weekId } });
export const addWeeklyItem = (payload) => api.post('/weekly-plan/items', payload);
export const updateWeeklyItem = (id, payload) => api.patch(`/weekly-plan/items/${id}`, payload);
export const deleteWeeklyItem = (id) => api.delete(`/weekly-plan/items/${id}`);
export const closeWeeklyPlan = (weekId) => api.post('/weekly-plan/close', { weekId });
export const reopenWeeklyPlan = (weekId) => api.post('/weekly-plan/reopen', { weekId });
