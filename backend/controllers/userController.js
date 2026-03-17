const { prisma } = require('../config/database');
const authService = require('../services/authService');
const { createNotification } = require('./notificationController');

// @desc    Get user dashboard data
// @route   GET /api/user/dashboard
// @access  Private
const getDashboard = async (req, res) => {
  try {
    const user = await authService.findUserById(req.user.id);

    const enrolledCount = user.enrolledCourses.length;
    const completedCount = user.enrolledCourses.filter(e => e.progress === 100).length;
    const averageProgress = enrolledCount > 0
      ? Math.round(user.enrolledCourses.reduce((acc, curr) => acc + curr.progress, 0) / enrolledCount)
      : 0;

    let recommendedCourses = [];
    if (user.preferences) {
      try {
        const prefs = JSON.parse(user.preferences);
        if (prefs.interests?.length > 0) {
          recommendedCourses = await prisma.course.findMany({
            where: { category: { in: prefs.interests } },
            take: 6,
          });
        }
      } catch { /* ignore parse error */ }
    }
    if (recommendedCourses.length === 0) {
      recommendedCourses = await prisma.course.findMany({
        orderBy: { enrolledStudents: 'desc' },
        take: 6,
      });
    }

    res.json({
      stats: {
        enrolled: enrolledCount,
        completed: completedCount,
        averageProgress,
        learningStreak: user.learningStreak,
      },
      enrolledCourses: user.enrolledCourses.map(e => ({
        course: e.course,
        progress: e.progress,
        lastAccessedAt: e.lastAccessedAt,
        certificateEarned: e.certificateEarned,
      })),
      bookmarkedCourses: user.bookmarkedCourses.map(b => ({ course: b.course })),
      recommendedCourses,
    });
  } catch (error) {
    console.error('Get Dashboard error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard data' });
  }
};

// @desc    Enroll in course
// @route   PUT /api/user/enroll
// @access  Private
const enrollCourse = async (req, res) => {
  try {
    console.log('📚 Enrollment request - User:', req.user.id, 'Course:', req.body.courseId);
    
    const { courseId } = req.body;

    // Validate input
    if (!courseId) {
      console.log('❌ Validation failed: Course ID required');
      return res.status(400).json({ message: 'Course ID is required' });
    }

    // Check if already enrolled
    console.log('🔍 Checking existing enrollment...');
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: req.user.id,
          courseId: courseId,
        },
      },
    });

    if (existingEnrollment) {
      console.log('⚠️  User already enrolled:', req.user.id, courseId);
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    console.log('✅ No existing enrollment found. Creating new enrollment...');

    // Create enrollment
    await prisma.enrollment.create({
      data: {
        userId: req.user.id,
        courseId: courseId,
        progress: 0,
      },
    });

    console.log('✅ Enrollment created successfully');

    // Increment course enrollment count
    console.log('📊 Updating course enrollment count...');
    await prisma.course.update({
      where: { id: courseId },
      data: { enrolledStudents: { increment: 1 } },
    });

    console.log('✅ Course enrollment count updated');
    console.log('🎉 Enrollment completed successfully!');

    // Create enrollment notification
    try {
      const course = await prisma.course.findUnique({ where: { id: courseId }, select: { title: true } });
      await createNotification(req.user.id, {
        title: 'Enrolled Successfully!',
        message: `You are now enrolled in "${course?.title}". Start learning today!`,
        type: 'info',
        link: `/courses/${courseId}`,
      });
    } catch { /* non-critical */ }

    res.json({ message: 'Successfully enrolled in course', courseId, success: true });
  } catch (error) {
    console.error('❌ Enroll Course error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error type:', error.constructor.name);
    
    let errorMessage = 'Failed to enroll in course';
    let statusCode = 500;
    
    if (error.message && error.message.includes('Already enrolled')) {
      errorMessage = 'Already enrolled in this course';
      statusCode = 400;
    } else if (error.code === 'P2003') {
      // Prisma foreign key error - course doesn't exist
      errorMessage = 'Course not found';
      statusCode = 404;
    } else if (error.code === 'P2002') {
      // Unique constraint failed
      errorMessage = 'Enrollment already exists';
      statusCode = 400;
    }
    
    res.status(statusCode).json({ 
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update course progress
// @route   PUT /api/user/progress
// @access  Private
const updateProgress = async (req, res) => {
  try {
    const { courseId, progress, lessonId, videoSeconds } = req.body;

    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: req.user.id, courseId } },
    });

    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    // Update video progress map if provided
    let videoProgressData = {};
    if (enrollment.videoProgress) {
      try { videoProgressData = JSON.parse(enrollment.videoProgress); } catch { /* ignore */ }
    }
    if (lessonId && videoSeconds !== undefined) {
      videoProgressData[lessonId] = videoSeconds;
    }

    await prisma.enrollment.update({
      where: { userId_courseId: { userId: req.user.id, courseId } },
      data: {
        progress,
        lastAccessedAt: new Date(),
        videoProgress: JSON.stringify(videoProgressData),
        certificateEarned: progress === 100 ? true : enrollment.certificateEarned,
      },
    });

    // Update learning streak
    const lastDate = new Date(enrollment.lastAccessedAt).toDateString();
    const today = new Date().toDateString();
    if (lastDate !== today) {
      await prisma.user.update({
        where: { id: req.user.id },
        data: { learningStreak: { increment: 1 } },
      });
    }

    res.json({ message: 'Progress updated successfully', progress });
  } catch (error) {
    console.error('Update Progress error:', error);
    res.status(500).json({ message: 'Failed to update progress' });
  }
};

// @desc    Bookmark course
// @route   PUT /api/user/bookmark
// @access  Private
const bookmarkCourse = async (req, res) => {
  try {
    const { courseId } = req.body;

    // Check if already bookmarked
    const existingBookmark = await prisma.bookmarkedCourse.findFirst({
      where: {
        userId: req.user.id,
        courseId: courseId,
      },
    });

    if (existingBookmark) {
      // Remove bookmark
      await prisma.bookmarkedCourse.delete({
        where: { id: existingBookmark.id },
      });
      res.json({ message: 'Bookmark removed', bookmarked: false });
    } else {
      // Add bookmark
      await prisma.bookmarkedCourse.create({
        data: {
          userId: req.user.id,
          courseId: courseId,
        },
      });
      res.json({ message: 'Course bookmarked', bookmarked: true });
    }
  } catch (error) {
    console.error('Bookmark Course error:', error);
    res.status(500).json({ message: 'Failed to bookmark course' });
  }
};

// @desc    Submit quiz result
// @route   POST /api/user/quiz-result
// @access  Private
const submitQuizResult = async (req, res) => {
  try {
    const { quizId, score } = req.body;

    await prisma.completedQuiz.create({
      data: {
        userId: req.user.id,
        quizId: quizId,
        score: score,
      },
    });

    res.json({ message: 'Quiz result recorded', score });
  } catch (error) {
    console.error('Submit Quiz Result error:', error);
    res.status(500).json({ message: 'Failed to submit quiz result' });
  }
};

// @desc    Get certificate for completed course
// @route   GET /api/user/certificate/:courseId
// @access  Private
const getCertificate = async (req, res) => {
  try {
    const { courseId } = req.params;

    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: req.user.id, courseId } },
      include: { course: true },
    });

    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    if (enrollment.progress < 100) {
      return res.status(400).json({ message: 'Course not completed yet', progress: enrollment.progress });
    }

    // Mark certificate as earned
    if (!enrollment.certificateEarned) {
      await prisma.enrollment.update({
        where: { userId_courseId: { userId: req.user.id, courseId } },
        data: { certificateEarned: true },
      });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    res.json({
      certificate: {
        studentName: user.name,
        courseName: enrollment.course.title,
        instructor: enrollment.course.instructor,
        completedAt: enrollment.updatedAt,
        certificateId: `CERT-${req.user.id.slice(0, 8).toUpperCase()}-${courseId.slice(0, 8).toUpperCase()}`,
      },
    });
  } catch (error) {
    console.error('Get Certificate error:', error);
    res.status(500).json({ message: 'Failed to get certificate' });
  }
};

module.exports = {
  getDashboard,
  enrollCourse,
  updateProgress,
  bookmarkCourse,
  submitQuizResult,
  getCertificate,
};
