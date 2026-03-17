import api from './api';

export const projectService = {
  generate: async (topic, difficulty) => {
    const res = await api.post('/projects/generate', { topic, difficulty });
    return res.data;
  },
  save: async (project) => {
    const res = await api.post('/projects/save', project);
    return res.data;
  },
  getAll: async () => {
    const res = await api.get('/projects');
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/projects/${id}`);
    return res.data;
  },
};
