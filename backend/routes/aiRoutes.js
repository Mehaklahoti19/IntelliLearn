const express = require('express');
const router = express.Router();
const {
  chatWithAI,
  generateNotes,
  generateQuiz,
  explainCode,
  generateRoadmap,
  recommendCourses,
  getChatHistory,
  deleteChat,
} = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

// All AI routes are protected
router.use(protect);

router.post('/chat', chatWithAI);
router.post('/notes', generateNotes);
router.post('/quiz', generateQuiz);
router.post('/explain-code', explainCode);
router.post('/roadmap', generateRoadmap);
router.post('/recommend', recommendCourses);
router.get('/chat-history', getChatHistory);
router.delete('/chat/:id', deleteChat);

module.exports = router;
