const { prisma } = require('../config/database');

// @desc    Get all courses with filters
// @route   GET /api/courses
// @access  Public
const getCourses = async (req, res) => {
  try {
    const { category, difficulty, search, minPrice, maxPrice, sort } = req.query;

    // Build query
    let where = {};

    if (category) {
      where.category = category;
    }

    if (difficulty) {
      where.difficulty = difficulty;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = Number(minPrice);
      if (maxPrice) where.price.lte = Number(maxPrice);
    }

    // Sort options
    let orderBy = {};
    if (sort === 'price-low') {
      orderBy.price = 'asc';
    } else if (sort === 'price-high') {
      orderBy.price = 'desc';
    } else if (sort === 'rating') {
      orderBy.rating = 'desc';
    } else if (sort === 'popular') {
      orderBy.enrolledStudents = 'desc';
    }

    const courses = await prisma.course.findMany({
      where,
      orderBy,
      include: {
        reviews: {
          include: {
            user: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    res.json({
      count: courses.length,
      courses,
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ message: 'Server error fetching courses' });
  }
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public
const getCourse = async (req, res) => {
  try {
    const course = await prisma.course.findUnique({
      where: { id: req.params.id },
      include: {
        syllabus: {
          orderBy: { order: 'asc' },
        },
        reviews: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json(course);
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ message: 'Server error fetching course' });
  }
};

// @desc    Create new course
// @route   POST /api/courses
// @access  Private/Admin
const createCourse = async (req, res) => {
  try {
    const { syllabus, ...courseData } = req.body;
    
    const course = await prisma.course.create({
      data: {
        ...courseData,
        syllabus: syllabus ? {
          create: syllabus.map((lesson, index) => ({
            ...lesson,
            order: index + 1,
          }))
        } : undefined,
      },
      include: {
        syllabus: true,
      },
    });
    
    res.status(201).json(course);
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ message: 'Server error creating course' });
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private/Admin
const updateCourse = async (req, res) => {
  try {
    const { syllabus, ...courseData } = req.body;
    
    const course = await prisma.course.update({
      where: { id: req.params.id },
      data: courseData,
    });

    res.json(course);
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ message: 'Server error updating course' });
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private/Admin
const deleteCourse = async (req, res) => {
  try {
    await prisma.course.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ message: 'Server error deleting course' });
  }
};

// @desc    Add course review
// @route   POST /api/courses/:id/reviews
// @access  Private
const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const courseId = req.params.id;

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user already reviewed
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_courseId: {
          userId: req.user.id,
          courseId: courseId,
        },
      },
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You already reviewed this course' });
    }

    // Create review
    await prisma.review.create({
      data: {
        userId: req.user.id,
        courseId: courseId,
        rating,
        comment,
      },
    });

    // Update average rating
    const reviews = await prisma.review.findMany({
      where: { courseId },
    });

    const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
    const newRating = parseFloat((totalRating / reviews.length).toFixed(1));

    await prisma.course.update({
      where: { id: courseId },
      data: { rating: newRating },
    });

    res.status(201).json({ message: 'Review added successfully' });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ message: 'Server error adding review' });
  }
};

module.exports = {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  addReview,
};
