import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Star, Clock, User, PlayCircle, Brain, MessageSquare,
  FileText, Download, Award, Bookmark, CheckCircle, ChevronDown, ChevronUp
} from 'lucide-react';
import { courseService } from '../services/courseService';
import { aiService } from '../services/aiService';
import { userService } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/common/Loading';
import Button from '../components/common/Button';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800';

const formatINR = (usd) => `₹${Math.round(usd * 83).toLocaleString('en-IN')}`;

// Detect if URL is a YouTube link and return embed URL
const getVideoEmbed = (url) => {
  if (!url) return null;
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?rel=0`;
  return url; // local/hosted video
};

const isYouTube = (url) => url && (url.includes('youtube.com') || url.includes('youtu.be'));

const CourseDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [generating, setGenerating] = useState({ notes: false, quiz: false });
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [quizId, setQuizId] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [expandedLesson, setExpandedLesson] = useState(null);
  const [imgSrc, setImgSrc] = useState(FALLBACK_IMG);
  const videoRef = useRef(null);

  useEffect(() => {
    loadCourse();
  }, [id]);

  const loadCourse = async () => {
    try {
      const data = await courseService.getCourse(id);
      setCourse(data);
      setImgSrc(data.thumbnail || FALLBACK_IMG);
    } catch (error) {
      console.error('Error loading course:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    setEnrolling(true);
    try {
      await userService.enrollCourse(id);
      setEnrolled(true);
    } catch (error) {
      const msg = error.message || '';
      if (msg.includes('Already enrolled')) setEnrolled(true);
      else alert(msg || 'Enrollment failed. Please try again.');
    } finally {
      setEnrolling(false);
    }
  };

  const handleBookmark = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    try {
      const res = await userService.bookmarkCourse(id);
      setBookmarked(res.bookmarked);
    } catch { /* silent */ }
  };

  const generateNotes = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    setGenerating(p => ({ ...p, notes: true }));
    try {
      const data = await aiService.generateNotes(id);
      setNotes(data.notes);
      setShowNotes(true);
    } catch (error) {
      alert(error.message || 'Failed to generate notes.');
    } finally {
      setGenerating(p => ({ ...p, notes: false }));
    }
  };

  const downloadNotes = () => {
    const blob = new Blob([notes], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${course.title.replace(/\s+/g, '_')}_Notes.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateQuiz = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    setGenerating(p => ({ ...p, quiz: true }));
    try {
      const data = await aiService.generateQuiz(id);
      setQuiz(data.quiz);
      setQuizId(data.quizId);
      setSelectedAnswers({});
      setShowResults({});
      setQuizSubmitted(false);
      setQuizScore(0);
    } catch (error) {
      alert(error.message || 'Failed to generate quiz.');
    } finally {
      setGenerating(p => ({ ...p, quiz: false }));
    }
  };

  const handleAnswer = (qIdx, optText) => {
    if (quizSubmitted) return;
    setSelectedAnswers(p => ({ ...p, [qIdx]: optText }));
  };

  const submitQuiz = async () => {
    if (!quiz) return;
    let correct = 0;
    quiz.forEach((q, i) => {
      const selected = selectedAnswers[i];
      const correctOpt = q.options.find(o => o.isCorrect);
      if (selected === correctOpt?.text) correct++;
    });
    const score = Math.round((correct / quiz.length) * 100);
    setQuizScore(score);
    setQuizSubmitted(true);
    // Show all results
    const results = {};
    quiz.forEach((_, i) => { results[i] = true; });
    setShowResults(results);
    // Save to backend
    if (quizId) {
      try { await userService.submitQuizResult(quizId, score); } catch { /* silent */ }
    }
  };

  if (loading) return <Loading fullScreen />;
  if (!course) return <div className="min-h-screen flex items-center justify-center"><p className="text-xl">Course not found</p></div>;

  const embedUrl = getVideoEmbed(course.previewVideo);
  const correctCount = quiz ? quiz.filter((q, i) => {
    const correctOpt = q.options.find(o => o.isCorrect);
    return selectedAnswers[i] === correctOpt?.text;
  }).length : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero */}
      <div className="bg-gradient-dark text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs font-medium px-3 py-1 bg-primary-500/20 text-primary-300 rounded-full">{course.category}</span>
                  <span className="text-xs font-medium px-3 py-1 bg-white/10 text-gray-300 rounded-full">{course.difficulty}</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold mb-4">{course.title}</h1>
                <p className="text-gray-300 mb-6">{course.description}</p>
                <div className="flex flex-wrap gap-4 mb-6 text-sm">
                  <div className="flex items-center gap-1"><User className="h-4 w-4" />{course.instructor}</div>
                  <div className="flex items-center gap-1"><Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />{course.rating?.toFixed(1)}</div>
                  <div className="flex items-center gap-1"><Clock className="h-4 w-4" />{course.duration} hours</div>
                  <div className="flex items-center gap-1 text-xl font-bold text-primary-300">{formatINR(course.price)}</div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button onClick={handleEnroll} disabled={enrolled || enrolling} size="lg">
                    {enrolled ? '✓ Enrolled' : enrolling ? 'Enrolling...' : isAuthenticated ? 'Enroll Now' : 'Login to Enroll'}
                  </Button>
                  {isAuthenticated && (
                    <button onClick={handleBookmark}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${bookmarked ? 'bg-primary-500 border-primary-500 text-white' : 'border-white/30 text-white hover:bg-white/10'}`}>
                      <Bookmark className={`h-5 w-5 ${bookmarked ? 'fill-white' : ''}`} />
                      {bookmarked ? 'Bookmarked' : 'Bookmark'}
                    </button>
                  )}
                  {enrolled && (
                    <Link to={`/certificate/${id}`}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white transition-colors">
                      <Award className="h-5 w-5" /> Get Certificate
                    </Link>
                  )}
                  {course.previewVideo && (
                    <button onClick={() => setShowVideo(!showVideo)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/30 text-white hover:bg-white/10 transition-colors">
                      <PlayCircle className="h-5 w-5" />
                      {showVideo ? 'Hide Preview' : 'Watch Preview'}
                    </button>
                  )}
                </div>
              </div>
              <div>
                {showVideo && embedUrl ? (
                  <div className="rounded-xl overflow-hidden shadow-2xl aspect-video">
                    {isYouTube(course.previewVideo) ? (
                      <iframe src={embedUrl} className="w-full h-full" allowFullScreen title="Course Preview" />
                    ) : (
                      <video ref={videoRef} src={embedUrl} controls className="w-full h-full" />
                    )}
                  </div>
                ) : (
                  <img src={imgSrc} alt={course.title} onError={() => setImgSrc(FALLBACK_IMG)}
                    className="rounded-xl shadow-2xl w-full object-cover max-h-72" />
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
        {/* AI Tools */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-2xl font-bold mb-6">AI Learning Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button onClick={generateNotes} disabled={generating.notes}
              className="glass p-6 rounded-xl card-hover text-left disabled:opacity-60 transition-all">
              <FileText className="h-8 w-8 text-primary-500 mb-3" />
              <h3 className="text-lg font-bold mb-1">Generate Notes</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">AI-powered study notes from this course</p>
              {generating.notes && <p className="text-xs text-primary-500 mt-2 animate-pulse">Generating...</p>}
            </button>
            <button onClick={generateQuiz} disabled={generating.quiz}
              className="glass p-6 rounded-xl card-hover text-left disabled:opacity-60 transition-all">
              <Brain className="h-8 w-8 text-accent-500 mb-3" />
              <h3 className="text-lg font-bold mb-1">Generate Quiz</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Test your knowledge with AI questions</p>
              {generating.quiz && <p className="text-xs text-accent-500 mt-2 animate-pulse">Generating...</p>}
            </button>
            <button onClick={() => navigate('/ai-assistant')}
              className="glass p-6 rounded-xl card-hover text-left transition-all">
              <MessageSquare className="h-8 w-8 text-secondary-500 mb-3" />
              <h3 className="text-lg font-bold mb-1">Ask AI Tutor</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Chat with AI about this course</p>
            </button>
          </div>
        </motion.div>

        {/* Syllabus */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-2xl font-bold mb-6">Course Syllabus</h2>
          <div className="space-y-3">
            {course.syllabus?.map((lesson, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                <button
                  onClick={() => setExpandedLesson(expandedLesson === index ? null : index)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {index + 1}
                    </div>
                    <span className="font-semibold">{lesson.title}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span>{lesson.duration} min</span>
                    {expandedLesson === index ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </button>
                {expandedLesson === index && (
                  <div className="px-5 pb-5 pl-17 text-gray-600 dark:text-gray-400 text-sm border-t dark:border-gray-700 pt-3">
                    {lesson.content}
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Notes Panel */}
        {showNotes && notes && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">AI Generated Notes</h2>
              <div className="flex gap-3">
                <button onClick={downloadNotes}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm">
                  <Download className="h-4 w-4" /> Download PDF
                </button>
                <button onClick={() => setShowNotes(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  Close
                </button>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
              <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200 font-mono leading-relaxed">{notes}</pre>
            </div>
          </motion.div>
        )}

        {/* Quiz Panel */}
        {quiz && quiz.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Brain className="h-7 w-7 text-accent-500" /> AI Quiz
              </h2>
              {quizSubmitted && (
                <div className={`px-4 py-2 rounded-lg font-bold text-lg ${quizScore >= 70 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                  Score: {correctCount}/{quiz.length} ({quizScore}%)
                </div>
              )}
            </div>

            {quizSubmitted && quizScore >= 80 && (
              <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-xl flex items-center gap-3">
                <Award className="h-8 w-8 text-yellow-500 flex-shrink-0" />
                <div>
                  <p className="font-bold text-yellow-700 dark:text-yellow-400">Excellent! You scored {quizScore}%</p>
                  <p className="text-sm text-yellow-600 dark:text-yellow-500">Complete the course to earn your certificate!</p>
                </div>
              </div>
            )}

            <div className="space-y-5">
              {quiz.map((q, index) => {
                const hasAnswered = showResults[index];
                const selectedAnswer = selectedAnswers[index];
                const correctOpt = q.options.find(o => o.isCorrect);

                return (
                  <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                    <div className="flex items-start gap-3 mb-4">
                      <span className="bg-accent-500 text-white w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {index + 1}
                      </span>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{q.question}</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-10">
                      {q.options.map((opt, i) => {
                        const optText = typeof opt === 'string' ? opt : opt.text;
                        const isCorrect = typeof opt === 'object' ? opt.isCorrect : false;
                        const isSelected = selectedAnswer === optText;
                        let cls = 'border-gray-200 dark:border-gray-700 hover:border-primary-400';
                        if (hasAnswered) {
                          if (isCorrect) cls = 'border-green-500 bg-green-50 dark:bg-green-900/20';
                          else if (isSelected) cls = 'border-red-500 bg-red-50 dark:bg-red-900/20';
                        } else if (isSelected) {
                          cls = 'border-primary-500 bg-primary-50 dark:bg-primary-900/20';
                        }
                        return (
                          <button key={i} onClick={() => handleAnswer(index, optText)} disabled={quizSubmitted}
                            className={`p-3 rounded-lg border-2 text-left transition-all ${cls} ${!quizSubmitted ? 'cursor-pointer' : 'cursor-default'}`}>
                            <span className="font-bold text-gray-400 mr-2">{String.fromCharCode(65 + i)}.</span>
                            <span className="text-gray-900 dark:text-white text-sm">{optText}</span>
                            {hasAnswered && isCorrect && <CheckCircle className="inline h-4 w-4 text-green-500 ml-2" />}
                          </button>
                        );
                      })}
                    </div>
                    {hasAnswered && q.explanation && (
                      <div className="mt-3 ml-10 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-gray-700 dark:text-gray-300">
                        <strong>Explanation:</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3 mt-6">
              {!quizSubmitted ? (
                <Button onClick={submitQuiz} disabled={Object.keys(selectedAnswers).length < quiz.length}>
                  Submit Quiz ({Object.keys(selectedAnswers).length}/{quiz.length} answered)
                </Button>
              ) : (
                <Button onClick={() => { setQuiz(null); setQuizSubmitted(false); }}>Close Quiz</Button>
              )}
              <Button variant="outline" onClick={() => { setSelectedAnswers({}); setShowResults({}); setQuizSubmitted(false); setQuizScore(0); }}>
                Reset
              </Button>
            </div>
          </motion.div>
        )}

        {/* Reviews */}
        {course.reviews?.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-2xl font-bold mb-6">Student Reviews</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {course.reviews.slice(0, 4).map((review, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold text-sm">
                      {review.user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{review.user?.name || 'Student'}</p>
                      <div className="flex">
                        {Array.from({ length: review.rating }).map((_, j) => (
                          <Star key={j} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                  </div>
                  {review.comment && <p className="text-sm text-gray-600 dark:text-gray-400">{review.comment}</p>}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CourseDetailsPage;
