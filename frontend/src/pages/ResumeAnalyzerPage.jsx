import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, CheckCircle, AlertCircle, Lightbulb, BookOpen, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { resumeService } from '../services/resumeService';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import CourseCard from '../components/course/CourseCard';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800';

const ResumeAnalyzerPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <FileText className="h-16 w-16 text-gray-300" />
        <p className="text-xl text-gray-600 dark:text-gray-400">Please login to use Resume Analyzer</p>
        <Button onClick={() => navigate('/login')}>Login</Button>
      </div>
    );
  }

  const readFileAsText = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const handleFile = async (file) => {
    if (!file) return;
    const allowed = ['text/plain', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(file.type) && !file.name.match(/\.(txt|pdf|docx)$/i)) {
      setError('Please upload a .txt, .pdf, or .docx file');
      return;
    }
    setFileName(file.name);
    setError('');
    try {
      // For PDF/DOCX we read as text (works for text-based PDFs)
      const text = await readFileAsText(file);
      setResumeText(text);
    } catch {
      setError('Could not read file. Try pasting your resume text below instead.');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleAnalyze = async () => {
    const textToAnalyze = resumeText.trim();
    if (textToAnalyze.length < 50) {
      setError('Please upload a file or paste your resume text (minimum 50 characters)');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await resumeService.analyze(textToAnalyze, fileName || 'resume.txt');
      setResult(data);
    } catch (err) {
      setError(err.message || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="text-4xl font-bold gradient-text mb-3">AI Resume Analyzer</h1>
          <p className="text-gray-500 dark:text-gray-400">Upload your resume and get instant AI-powered feedback, skill gaps, and course recommendations.</p>
        </motion.div>

        {/* Upload Area */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-6">
          {/* Drop Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all mb-6 ${
              dragging ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-primary-400'
            }`}>
            <input ref={fileRef} type="file" accept=".txt,.pdf,.docx" className="hidden"
              onChange={(e) => handleFile(e.target.files[0])} />
            <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
            {fileName ? (
              <p className="text-primary-500 font-medium">{fileName}</p>
            ) : (
              <>
                <p className="text-gray-600 dark:text-gray-400 font-medium">Drop your resume here or click to browse</p>
                <p className="text-sm text-gray-400 mt-1">Supports .txt, .pdf, .docx</p>
              </>
            )}
          </div>

          {/* Or paste text */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Or paste your resume text:
            </label>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              rows={8}
              placeholder="Paste your resume content here..."
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm resize-none"
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <Button onClick={handleAnalyze} loading={loading} disabled={loading} className="w-full">
            {loading ? 'Analyzing...' : 'Analyze Resume'}
          </Button>
        </motion.div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <Loader className="h-10 w-10 text-primary-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-500">AI is analyzing your resume...</p>
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Summary */}
            {result.summary && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary-500" /> Overall Assessment
                </h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{result.summary}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Skills Found */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" /> Skills Detected
                  <span className="ml-auto text-sm font-normal text-gray-400">{result.skills.length} found</span>
                </h2>
                <div className="flex flex-wrap gap-2">
                  {result.skills.map((skill, i) => (
                    <span key={i} className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Missing Skills */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-500" /> Missing Skills
                  <span className="ml-auto text-sm font-normal text-gray-400">{result.missingSkills.length} gaps</span>
                </h2>
                <div className="flex flex-wrap gap-2">
                  {result.missingSkills.map((skill, i) => (
                    <span key={i} className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full text-sm font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Suggestions */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" /> Improvement Suggestions
              </h2>
              <ul className="space-y-3">
                {result.suggestions.map((s, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{s}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommended Courses */}
            {result.recommendedCourses?.length > 0 && (
              <div>
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary-500" /> Recommended Courses to Fill Skill Gaps
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {result.recommendedCourses.map(course => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ResumeAnalyzerPage;
