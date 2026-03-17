import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, CheckCircle, TrendingUp, Award, Clock, Bookmark, Flame, PlayCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import Loading from '../components/common/Loading';
import CourseCard from '../components/course/CourseCard';
import SkeletonCard from '../components/common/SkeletonCard';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800';

const DashboardPage = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadDashboard(); }, []);

  const loadDashboard = async () => {
    try {
      const data = await userService.getDashboard();
      setDashboardData(data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading fullScreen />;
  if (!dashboardData) return <div className="min-h-screen flex items-center justify-center"><p>Error loading dashboard</p></div>;

  const { stats, enrolledCourses, bookmarkedCourses, recommendedCourses } = dashboardData;

  // Sort by last accessed for "continue learning"
  const inProgress = enrolledCourses
    .filter(e => e.progress > 0 && e.progress < 100)
    .sort((a, b) => new Date(b.lastAccessedAt) - new Date(a.lastAccessedAt));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold gradient-text mb-1">Welcome back, {user?.name}!</h1>
          <p className="text-gray-500 dark:text-gray-400">Keep up the great work on your learning journey.</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={<BookOpen />} label="Enrolled" value={stats.enrolled} color="primary" />
          <StatCard icon={<CheckCircle />} label="Completed" value={stats.completed} color="green" />
          <StatCard icon={<TrendingUp />} label="Avg Progress" value={`${stats.averageProgress}%`} color="blue" />
          <StatCard icon={<Flame />} label="Streak" value={`${stats.learningStreak} days`} color="accent" />
        </div>

        {/* Continue Learning */}
        {inProgress.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-5 flex items-center gap-2">
              <PlayCircle className="h-6 w-6 text-primary-500" /> Continue Learning
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {inProgress.slice(0, 3).map(({ course, progress, lastAccessedAt }) => (
                <Link key={course.id} to={`/courses/${course.id}`}
                  className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="relative h-36">
                    <img src={course.thumbnail || FALLBACK_IMG} alt={course.title}
                      onError={(e) => { e.target.src = FALLBACK_IMG; }}
                      className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <PlayCircle className="h-12 w-12 text-white" />
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-sm mb-1 line-clamp-1">{course.title}</h3>
                    <p className="text-xs text-gray-500 mb-2">{course.instructor}</p>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-1">
                      <div className="bg-gradient-to-r from-primary-500 to-accent-500 h-2 rounded-full transition-all"
                        style={{ width: `${progress}%` }} />
                    </div>
                    <p className="text-xs text-gray-500">{progress}% complete</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* All Enrolled Courses */}
        <section>
          <h2 className="text-2xl font-bold mb-5">My Courses</h2>
          {enrolledCourses.length === 0 ? (
            <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-xl">
              <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">You haven't enrolled in any courses yet.</p>
              <Link to="/courses" className="text-primary-500 hover:underline text-sm mt-2 inline-block">Browse Courses</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {enrolledCourses.map(({ course, progress }) => (
                <Link key={course.id} to={`/courses/${course.id}`}
                  className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <img src={course.thumbnail || FALLBACK_IMG} alt={course.title}
                    onError={(e) => { e.target.src = FALLBACK_IMG; }}
                    className="w-full h-36 object-cover" />
                  <div className="p-4">
                    <h3 className="font-bold mb-1 line-clamp-1">{course.title}</h3>
                    <p className="text-sm text-gray-500 mb-3">{course.instructor}</p>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-1">
                      <div className="bg-gradient-to-r from-primary-500 to-accent-500 h-2 rounded-full"
                        style={{ width: `${progress}%` }} />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>{progress}% complete</span>
                      {progress === 100 && <span className="text-green-500 font-medium flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Done</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Bookmarked Courses */}
        {bookmarkedCourses?.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-5 flex items-center gap-2">
              <Bookmark className="h-6 w-6 text-primary-500" /> Bookmarked Courses
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {bookmarkedCourses.map(({ course }) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </section>
        )}

        {/* Recommended */}
        {recommendedCourses?.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-5">Recommended For You</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {recommendedCourses.map(course => <CourseCard key={course.id} course={course} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }) => {
  const colors = {
    primary: 'from-primary-500 to-primary-600',
    green: 'from-green-500 to-green-600',
    blue: 'from-blue-500 to-blue-600',
    accent: 'from-accent-500 to-accent-600',
  };
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -4 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md">
      <div className={`inline-flex p-2.5 rounded-lg bg-gradient-to-r ${colors[color]} text-white mb-3`}>{icon}</div>
      <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </motion.div>
  );
};

export default DashboardPage;
