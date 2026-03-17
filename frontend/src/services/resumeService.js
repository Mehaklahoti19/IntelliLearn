import api from './api';

export const resumeService = {
  analyze: async (resumeText, fileName) => {
    const res = await api.post('/resume/analyze', { resumeText, fileName });
    return res.data;
  },
  getHistory: async () => {
    const res = await api.get('/resume/history');
    return res.data;
  },
};
