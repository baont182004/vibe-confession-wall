import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

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

export const uploadAvatar = (file) => {
  const formData = new FormData();
  formData.append('avatar', file);
  return api.post('/users/me/avatar', formData);
};

export const updateAvatar = (payload) => api.patch('/users/me/avatar', payload);
export const updateAvatarDefault = (avatarUrl) => api.patch('/users/me/avatar-default', { avatarUrl });

export const getPosts = (page) => api.get(`/posts?page=${page}`);
export const createPost = (content) => api.post('/posts', { content });
export const toggleReaction = (id, type) => api.post(`/posts/${id}/reactions/${type}`);
export const deletePost = (id) => api.delete(`/posts/${id}`);

export const getComments = (postId, page = 1) => api.get(`/posts/${postId}/comments?page=${page}`);
export const createComment = (postId, content) => api.post(`/posts/${postId}/comments`, { content });
export const updateComment = (id, content) => api.patch(`/comments/${id}`, { content });
export const deleteComment = (id) => api.delete(`/comments/${id}`);
export const voteComment = (id, value) => api.put(`/comments/${id}/vote`, { value });

export const getRooms = () => api.get('/chat/rooms');
export const getChatMessages = (roomId, before) => api.get(`/chat/rooms/${roomId}/messages`, { params: { before } });

export const reportEntity = (targetType, targetId, reason) => api.post('/reports', { targetType, targetId, reason });

export default api;
