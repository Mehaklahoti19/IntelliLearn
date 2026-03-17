import api from './api';

export const courseService = {
  // Get all courses with filters
  getCourses: async (filters = {}) => {
    const response = await api.get('/courses', { params: filters });
    return response.data;
  },

  // Get single course
  getCourse: async (courseId) => {
    const response = await api.get(`/courses/${courseId}`);
    return response.data;
  },

  // Add review to course
  addReview: async (courseId, reviewData) => {
    const response = await api.post(`/courses/${courseId}/reviews`, reviewData);
    return response.data;
  },
};
