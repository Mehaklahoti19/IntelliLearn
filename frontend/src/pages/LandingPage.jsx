import { motion } from 'framer-motion';
import { GraduationCap, Sparkles, Brain, Target, Award, Users, Star, ArrowRight, Search } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';

const LandingPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const features = [
    {
      icon: <Brain className="h-8 w-8" />,
      title: 'AI-Powered Tutor',
      description: 'Get personalized help from our intelligent AI tutor available 24/7.',
    },
    {
      icon: <Sparkles className="h-8 w-8" />,
      title: 'Smart Notes',
      description: 'Automatically generate comprehensive notes from any course content.',
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: 'Custom Quizzes',
      description: 'Practice with AI-generated quizzes tailored to your learning progress.',
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: 'Certificates',
      description: 'Earn recognized certificates upon completing courses and assessments.',
    },
  ];

  const stats = [
    { value: '50,000+', label: 'Students Enrolled' },
    { value: '200+', label: 'Expert Courses' },
    { value: '4.8★', label: 'Average Rating' },
    { value: '95%', label: 'Completion Rate' },
  ];

  const testimonials = [
    {
      name: 'Priya Sharma',
      role: 'Software Developer',
      content: 'IntelliLearn transformed how I learn. The AI tutor explains concepts better than any textbook!',
      rating: 5,
    },
    {
      name: 'Rahul Mehta',
      role: 'Data Scientist',
      content: 'The personalized learning path helped me master Python in just 3 months. Highly recommended!',
      rating: 5,
    },
    {
      name: 'Ananya Patel',
      role: 'UX Designer',
      content: 'Amazing platform! The AI-generated notes save me hours of study time.',
      rating: 5,
    },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/courses?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-dark py-20 px-4">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-secondary-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center justify-center space-x-3 mb-6">
              <GraduationCap className="h-16 w-16 text-primary-500" />
              <h1 className="text-6xl md:text-7xl font-bold gradient-text">
                IntelliLearn
              </h1>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Master Skills with<br />
              <span className="gradient-text">AI Powered Learning</span>
            </h2>
            
            <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto">
              Experience the future of education with personalized AI tutoring, 
              smart note generation, and adaptive learning paths designed just for you.
            </p>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-12">
              <div className="relative flex items-center">
                <Search className="absolute left-4 h-6 w-6 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="What do you want to learn today?"
                  className="w-full pl-12 pr-4 py-4 rounded-full bg-white/10 backdrop-blur-lg border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  type="submit"
                  className="absolute right-2 gradient-button px-8 py-2 rounded-full flex items-center space-x-2"
                >
                  <span>Search</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </form>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" onClick={() => navigate('/courses')}>
                Explore Courses
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate('/signup')}>
                Start Free Trial
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4 bg-white dark:bg-gray-900 border-b dark:border-gray-800">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <p className="text-3xl font-bold gradient-text">{stat.value}</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Why Choose <span className="gradient-text">IntelliLearn?</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Cutting-edge AI technology meets world-class education
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass p-8 rounded-2xl card-hover"
              >
                <div className="text-primary-500 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Loved by <span className="gradient-text">Students</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Join thousands of successful learners worldwide
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg card-hover"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-6 italic">
                  "{testimonial.content}"
                </p>
                <div>
                  <p className="font-bold">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary-600 to-accent-600">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Start Your Learning Journey?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join IntelliLearn today and experience the power of AI-driven education
            </p>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => navigate('/signup')}
              className="bg-white text-primary-600 hover:bg-gray-100"
            >
              Get Started Free
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
