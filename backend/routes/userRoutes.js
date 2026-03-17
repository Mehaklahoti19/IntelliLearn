const express = require('express');
const router = express.Router();
const {
  getDashboard,
  enrollCourse,
  updateProgress,
  bookmarkCourse,
  submitQuizResult,
  getCertificate,
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

// All user routes are protected
router.use(protect);

router.get('/dashboard', getDashboard);
router.put('/enroll', enrollCourse);
router.put('/progress', updateProgress);
router.put('/bookmark', bookmarkCourse);
router.post('/quiz-result', submitQuizResult);
router.get('/certificate/:courseId', getCertificate);

module.exports = router;
