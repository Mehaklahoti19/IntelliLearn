import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Filter, Search } from 'lucide-react';
import CourseCard from '../components/course/CourseCard';
import SkeletonCard from '../components/common/SkeletonCard';
import { courseService } from '../services/courseService';
import Button from '../components/common/Button';

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ category: '', difficulty: '', search: '' });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, [filters]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await courseService.getCourses(filters);
      setCourses(data.courses || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError(error.message || 'Failed to load courses. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-5xl font-bold gradient-text mb-4">Explore Courses</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">Discover our collection of world-class courses</p>
        </motion.div>

        <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="flex items-center space-x-2">
            <Filter className="h-5 w-5" /><span>Filters</span>
          </Button>
        </div>

        {showFilters && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-8 p-6 glass rounded-xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select value={filters.category} onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="">All Categories</option>
                  <option value="Programming">Programming</option>
                  <option value="Web Development">Web Development</option>
                  <option value="Data Science">Data Science</option>
                  <option value="AI/ML">AI/ML</option>
                  <option value="Design">Design</option>
                  <option value="Business">Business</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Difficulty</label>
                <select value={filters.difficulty} onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="">All Levels</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Sort By</label>
                <select onChange={(e) => handleFilterChange('sort', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="">Default</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : error ? (
          <div className="col-span-full text-center py-16">
            <p className="text-xl text-red-500 mb-2">Failed to load courses</p>
            <p className="text-gray-500 text-sm mb-4">{error}</p>
            <button onClick={fetchCourses} className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
              Retry
            </button>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {courses.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-2xl text-gray-600 dark:text-gray-400">No courses found</p>
                <p className="text-gray-500 mt-2">Try adjusting your filters</p>
              </div>
            ) : (
              courses.map((course) => <CourseCard key={course.id} course={course} />)
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CoursesPage;
