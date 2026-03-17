import api from './api';

export const userService = {
  // Get dashboard data
  getDashboard: async () => {
    const response = await api.get('/user/dashboard');
    return response.data;
  },

  // Enroll in course
  enrollCourse: async (courseId) => {
    const response = await api.put('/user/enroll', { courseId });
    return response.data;
  },

  // Update course progress
  updateProgress: async (courseId, progress, lessonId = null) => {
    const response = await api.put('/user/progress', { courseId, progress, lessonId });
    return response.data;
  },

  // Bookmark course
  bookmarkCourse: async (courseId) => {
    const response = await api.put('/user/bookmark', { courseId });
    return response.data;
  },

  // Submit quiz result
  submitQuizResult: async (quizId, score) => {
    const response = await api.post('/user/quiz-result', { quizId, score });
    return response.data;
  },

  // Get certificate for completed course
  getCertificate: async (courseId) => {
    const response = await api.get(`/user/certificate/${courseId}`);
    return response.data;
  },
};
