import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export const requestOTP = (email) => api.post('/auth/request-otp', { email });
export const verifyOTP = (email, otp) => api.post('/auth/verify-otp', { email, otp });
export const logout = () => api.post('/auth/logout');
export const getMe = () => api.get('/auth/me');
export const updateUsername = (username) => api.patch('/users/me/username', { username });
export const updateNickname = (nickname) => api.patch('/users/me/nickname', { nickname });
export const updateProfileNote = (profileNote) => api.patch('/users/me/profile-note', { profileNote });

export const updateAvatar = async (avatarId) => {
  const payload = { avatarId };
  try {
    return await api.patch('/users/me/avatar', payload);
  } catch (error) {
    const status = error?.response?.status;
    if (status === 404 || status === 405 || status === 410) {
      return await api.patch('/users/me', payload);
    }
    throw error;
  }
};
export const updateTimezone = (timezone) => api.patch('/users/me/timezone', { timezone });

export const getPosts = (page) => api.get(`/posts?page=${page}`);
export const createPost = (content) => api.post('/posts', { content });
export const toggleReaction = (id, type) => api.post(`/posts/${id}/reactions/${type}`);
export const deletePost = (id) => api.delete(`/posts/${id}`);

export const getComments = (postId, page = 1) => api.get(`/posts/${postId}/comments?page=${page}`);
export const createComment = (postId, content) => api.post(`/posts/${postId}/comments`, { content });
export const updateComment = (id, content) => api.patch(`/comments/${id}`, { content });
export const deleteComment = (id) => api.delete(`/comments/${id}`);
export const voteComment = (id, value) => api.put(`/comments/${id}/vote`, { value });

export const reportEntity = (targetType, targetId, reason) => api.post('/reports', { targetType, targetId, reason });

export const getJournal = (dateKey) => api.get('/journal', { params: { date: dateKey } });
export const upsertJournal = (dateKey, content) => api.put('/journal', { dateKey, content });
export const deleteJournal = (dateKey) => api.delete('/journal', { params: { date: dateKey } });
export const getStreak = () => api.get('/streak');
export const getStreakStatus = (dateKey, config = {}) => api.get('/streak/status', {
  ...config,
  params: {
    ...(config.params || {}),
    date: dateKey,
  },
});

export default api;
