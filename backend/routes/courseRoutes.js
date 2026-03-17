const express = require('express');
const router = express.Router();
const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  addReview,
} = require('../controllers/courseController');
const { protect } = require('../middleware/auth');

router.get('/', getCourses);
router.get('/:id', getCourse);
router.post('/', protect, createCourse);
router.put('/:id', protect, updateCourse);
router.delete('/:id', protect, deleteCourse);
router.post('/:id/reviews', protect, addReview);

module.exports = router;
