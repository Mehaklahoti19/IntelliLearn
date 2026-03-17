const { prisma } = require('../config/database');
const { Groq } = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// POST /api/projects/generate
const generateProject = async (req, res) => {
  try {
    const { topic, difficulty } = req.body;
    if (!topic) return res.status(400).json({ message: 'Topic is required' });

    const prompt = `Generate a mini coding project idea for topic: "${topic}", difficulty: "${difficulty || 'Intermediate'}".

Respond ONLY with valid JSON:
{
  "title": "Project title",
  "description": "2-3 sentence description of what the project does",
  "techStack": ["tech1", "tech2"],
  "steps": [
    "Step 1: ...",
    "Step 2: ...",
    "Step 3: ...",
    "Step 4: ...",
    "Step 5: ..."
  ],
  "estimatedTime": "X hours",
  "learningOutcomes": ["outcome1", "outcome2", "outcome3"]
}`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: 'You are a software engineering mentor. Respond with valid JSON only.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    const text = completion.choices[0].message.content.trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid AI response');

    const project = JSON.parse(jsonMatch[0]);
    res.json({ project, topic, difficulty: difficulty || 'Intermediate' });
  } catch (error) {
    console.error('Generate project error:', error);
    res.status(500).json({ message: 'Failed to generate project. Please try again.' });
  }
};

// POST /api/projects/save
const saveProject = async (req, res) => {
  try {
    const { title, description, topic, difficulty, steps } = req.body;
    const saved = await prisma.savedProject.create({
      data: {
        userId: req.user.id,
        title,
        description,
        topic,
        difficulty,
        steps: JSON.stringify(steps || []),
      },
    });
    res.json({ message: 'Project saved', project: saved });
  } catch (error) {
    res.status(500).json({ message: 'Failed to save project' });
  }
};

// GET /api/projects
const getSavedProjects = async (req, res) => {
  try {
    const projects = await prisma.savedProject.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json(projects.map(p => ({ ...p, steps: JSON.parse(p.steps) })));
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch projects' });
  }
};

// DELETE /api/projects/:id
const deleteProject = async (req, res) => {
  try {
    await prisma.savedProject.deleteMany({
      where: { id: req.params.id, userId: req.user.id },
    });
    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete project' });
  }
};

module.exports = { generateProject, saveProject, getSavedProjects, deleteProject };
