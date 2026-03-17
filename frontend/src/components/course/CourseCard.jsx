import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Clock, User, ChevronRight, Bookmark } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800';

const formatINR = (usd) => {
  const inr = Math.round(usd * 83);
  return `₹${inr.toLocaleString('en-IN')}`;
};

const CourseCard = ({ course, onBookmarkChange }) => {
  const { isAuthenticated } = useAuth();
  const [imgSrc, setImgSrc] = useState(course.thumbnail || FALLBACK_IMG);
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarking, setBookmarking] = useState(false);

  const handleBookmark = async (e) => {
    e.preventDefault();
    if (!isAuthenticated || bookmarking) return;
    setBookmarking(true);
    try {
      const res = await userService.bookmarkCourse(course.id);
      setBookmarked(res.bookmarked);
      onBookmarkChange?.();
    } catch {
      // silent
    } finally {
      setBookmarking(false);
    }
  };

  const difficultyColor = {
    Beginner: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    Intermediate: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
    Advanced: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  }[course.difficulty] || 'bg-gray-100 text-gray-600';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, transition: { duration: 0.25 } }}
      className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col"
    >
      {/* Thumbnail */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={imgSrc}
          alt={course.title}
          onError={() => setImgSrc(FALLBACK_IMG)}
          className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-3 right-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-primary-600 dark:text-primary-400">
          {formatINR(course.price)}
        </div>
        {isAuthenticated && (
          <button
            onClick={handleBookmark}
            className={`absolute top-3 left-3 p-2 rounded-full backdrop-blur-sm transition-colors ${
              bookmarked
                ? 'bg-primary-500 text-white'
                : 'bg-white/80 dark:bg-gray-900/80 text-gray-600 hover:text-primary-500'
            }`}
            title={bookmarked ? 'Remove bookmark' : 'Bookmark'}
          >
            <Bookmark className={`h-4 w-4 ${bookmarked ? 'fill-white' : ''}`} />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-5 space-y-3 flex flex-col flex-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full truncate max-w-[60%]">
            {course.category}
          </span>
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${difficultyColor}`}>
            {course.difficulty}
          </span>
        </div>

        <h3 className="text-base font-bold text-gray-900 dark:text-white line-clamp-2 flex-1">
          {course.title}
        </h3>

        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <User className="h-4 w-4 mr-1 flex-shrink-0" />
          <span className="truncate">{course.instructor}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="ml-1 font-medium">{course.rating?.toFixed(1)}</span>
            <span className="ml-1 text-gray-400">({course.reviews?.length || 0})</span>
          </div>
          <div className="flex items-center text-gray-500 dark:text-gray-400">
            <Clock className="h-4 w-4 mr-1" />
            {course.duration}h
          </div>
        </div>

        <Link
          to={`/courses/${course.id}`}
          className="gradient-button w-full flex items-center justify-center space-x-2 mt-auto"
        >
          <span>View Course</span>
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </motion.div>
  );
};

export default CourseCard;
