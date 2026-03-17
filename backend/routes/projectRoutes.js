const express = require('express');
const router = express.Router();
const { generateProject, saveProject, getSavedProjects, deleteProject } = require('../controllers/projectController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.post('/generate', generateProject);
router.post('/save', saveProject);
router.get('/', getSavedProjects);
router.delete('/:id', deleteProject);

module.exports = router;
