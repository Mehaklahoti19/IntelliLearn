import api from './api';

export const aiService = {
  // Chat with AI tutor
  chatWithAI: async (message, courseId = null, chatId = null) => {
    const response = await api.post('/ai/chat', { message, courseId, chatId });
    return response.data;
  },

  // Generate notes from course
  generateNotes: async (courseId) => {
    const response = await api.post('/ai/notes', { courseId });
    return response.data;
  },

  // Generate quiz from course
  generateQuiz: async (courseId, topic = null) => {
    const response = await api.post('/ai/quiz', { courseId, topic });
    return response.data;
  },

  // Explain code
  explainCode: async (code, language = 'javascript') => {
    const response = await api.post('/ai/explain-code', { code, language });
    return response.data;
  },

  // Generate learning roadmap
  generateRoadmap: async (careerGoal, currentLevel = 'beginner') => {
    const response = await api.post('/ai/roadmap', { careerGoal, currentLevel });
    return response.data;
  },

  // Get course recommendations
  recommendCourses: async (interests) => {
    const response = await api.post('/ai/recommend', { interests });
    return response.data;
  },

  // Get chat history
  getChatHistory: async () => {
    const response = await api.get('/ai/chat-history');
    return response.data;
  },

  // Delete chat
  deleteChat: async (chatId) => {
    const response = await api.delete(`/ai/chat/${chatId}`);
    return response.data;
  },
};
