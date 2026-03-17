import { useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Sparkles, Save, Trash2, ChevronRight, Clock, Code, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { projectService } from '../services/projectService';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';

const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'];
const TOPICS = ['React', 'Python', 'Node.js', 'Machine Learning', 'TypeScript', 'Flutter', 'Java', 'SQL', 'Next.js', 'Vue.js'];

const diffColor = {
  Beginner: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  Intermediate: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
  Advanced: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
};

const ProjectGeneratorPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [project, setProject] = useState(null);
  const [savedProjects, setSavedProjects] = useState([]);
  const [showSaved, setShowSaved] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Briefcase className="h-16 w-16 text-gray-300" />
        <p className="text-xl text-gray-600 dark:text-gray-400">Please login to use Project Generator</p>
        <Button onClick={() => navigate('/login')}>Login</Button>
      </div>
    );
  }

  const handleGenerate = async () => {
    if (!topic.trim()) { setError('Please enter a topic'); return; }
    setLoading(true);
    setError('');
    setProject(null);
    setSaved(false);
    try {
      const data = await projectService.generate(topic.trim(), difficulty);
      setProject(data.project);
    } catch (err) {
      setError(err.message || 'Failed to generate project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!project) return;
    setSaving(true);
    try {
      await projectService.save({
        title: project.title,
        description: project.description,
        topic,
        difficulty,
        steps: project.steps,
      });
      setSaved(true);
    } catch (err) {
      setError('Failed to save project');
    } finally {
      setSaving(false);
    }
  };

  const loadSaved = async () => {
    try {
      const data = await projectService.getAll();
      setSavedProjects(data);
      setShowSaved(true);
    } catch { /* silent */ }
  };

  const handleDelete = async (id) => {
    try {
      await projectService.delete(id);
      setSavedProjects(prev => prev.filter(p => p.id !== id));
    } catch { /* silent */ }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="text-4xl font-bold gradient-text mb-3">Mini Project Generator</h1>
          <p className="text-gray-500 dark:text-gray-400">Get AI-generated project ideas with step-by-step guidance to build your portfolio.</p>
        </motion.div>

        {/* Generator Form */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-6">
          <div className="mb-5">
            <label className="block text-sm font-medium mb-2">Topic / Technology</label>
            <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              placeholder="e.g. React, Python, Machine Learning..."
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500" />
            {/* Quick topic chips */}
            <div className="flex flex-wrap gap-2 mt-3">
              {TOPICS.map(t => (
                <button key={t} onClick={() => setTopic(t)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    topic === t ? 'bg-primary-500 text-white border-primary-500' : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-primary-400'
                  }`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Difficulty Level</label>
            <div className="flex gap-3">
              {DIFFICULTIES.map(d => (
                <button key={d} onClick={() => setDifficulty(d)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${
                    difficulty === d ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary-300'
                  }`}>
                  {d}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <div className="flex gap-3">
            <Button onClick={handleGenerate} loading={loading} disabled={loading} className="flex-1">
              <Sparkles className="h-4 w-4 mr-2" />
              {loading ? 'Generating...' : 'Generate Project'}
            </Button>
            <Button variant="outline" onClick={loadSaved}>My Projects</Button>
          </div>
        </motion.div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-10">
            <Loader className="h-10 w-10 text-primary-500 animate-spin mx-auto mb-3" />
            <p className="text-gray-500">AI is crafting your project idea...</p>
          </div>
        )}

        {/* Generated Project */}
        {project && !loading && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-primary-500 to-accent-500 p-6 text-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${diffColor[difficulty]}`}>{difficulty}</span>
                    {project.estimatedTime && (
                      <span className="flex items-center gap-1 text-xs text-white/80"><Clock className="h-3 w-3" />{project.estimatedTime}</span>
                    )}
                  </div>
                  <h2 className="text-2xl font-bold">{project.title}</h2>
                </div>
                <Code className="h-8 w-8 text-white/60 flex-shrink-0" />
              </div>
            </div>

            <div className="p-6 space-y-6">
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{project.description}</p>

              {project.techStack?.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2 text-sm uppercase tracking-wider text-gray-500">Tech Stack</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.techStack.map((t, i) => (
                      <span key={i} className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-full text-sm font-medium">{t}</span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider text-gray-500">Step-by-Step Guide</h3>
                <ol className="space-y-3">
                  {project.steps?.map((step, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{step}</p>
                    </li>
                  ))}
                </ol>
              </div>

              {project.learningOutcomes?.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2 text-sm uppercase tracking-wider text-gray-500">What You'll Learn</h3>
                  <ul className="space-y-1">
                    {project.learningOutcomes.map((o, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <ChevronRight className="h-4 w-4 text-primary-500 flex-shrink-0" />{o}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button onClick={handleSave} loading={saving} disabled={saved || saving} variant={saved ? 'secondary' : 'primary'}>
                  <Save className="h-4 w-4 mr-2" />
                  {saved ? 'Saved!' : 'Save Project'}
                </Button>
                <Button variant="outline" onClick={handleGenerate}>Regenerate</Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Saved Projects */}
        {showSaved && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
            <h2 className="text-xl font-bold mb-4">Saved Projects ({savedProjects.length})</h2>
            {savedProjects.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No saved projects yet.</p>
            ) : (
              <div className="space-y-4">
                {savedProjects.map(p => (
                  <div key={p.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${diffColor[p.difficulty] || diffColor.Intermediate}`}>{p.difficulty}</span>
                          <span className="text-xs text-gray-400">{p.topic}</span>
                        </div>
                        <h3 className="font-bold">{p.title}</h3>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{p.description}</p>
                      </div>
                      <button onClick={() => handleDelete(p.id)}
                        className="p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex-shrink-0">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ProjectGeneratorPage;
