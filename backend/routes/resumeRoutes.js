const express = require('express');
const router = express.Router();
const { analyzeResume, getHistory } = require('../controllers/resumeController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.post('/analyze', analyzeResume);
router.get('/history', getHistory);

module.exports = router;
