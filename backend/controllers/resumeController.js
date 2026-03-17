const { prisma } = require('../config/database');
const geminiService = require('../services/geminiService');

// POST /api/resume/analyze
const analyzeResume = async (req, res) => {
  try {
    const { resumeText, fileName } = req.body;

    if (!resumeText || resumeText.trim().length < 50) {
      return res.status(400).json({ message: 'Resume text is too short or missing' });
    }

    // Build AI prompt
    const prompt = `You are an expert career coach and resume analyst. Analyze the following resume text and respond ONLY with valid JSON.

Resume:
"""
${resumeText.slice(0, 3000)}
"""

Respond with this exact JSON structure:
{
  "skills": ["skill1", "skill2", ...],
  "missingSkills": ["missing1", "missing2", ...],
  "suggestions": ["suggestion1", "suggestion2", ...],
  "summary": "2-3 sentence overall assessment"
}

- skills: list of technical and soft skills found in the resume (max 15)
- missingSkills: important skills missing for modern job market (max 10)
- suggestions: actionable improvement tips (max 8)
- summary: brief overall assessment`;

    const { Groq } = require('groq-sdk');
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: 'You are a resume analysis expert. Always respond with valid JSON only.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 1024,
    });

    const text = completion.choices[0].message.content.trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid AI response format');

    const analysis = JSON.parse(jsonMatch[0]);

    // Find recommended courses based on missing skills
    const missingSkills = analysis.missingSkills || [];
    let recommendedCourses = [];
    if (missingSkills.length > 0) {
      const searchTerms = missingSkills.slice(0, 5);
      recommendedCourses = await prisma.course.findMany({
        where: {
          OR: searchTerms.map(skill => ({
            OR: [
              { title: { contains: skill } },
              { tags: { contains: skill.toLowerCase() } },
              { category: { contains: skill } },
            ],
          })),
        },
        take: 6,
        select: { id: true, title: true, thumbnail: true, category: true, difficulty: true, price: true, rating: true },
      });
    }

    // Save analysis to DB
    const saved = await prisma.resumeAnalysis.create({
      data: {
        userId: req.user.id,
        fileName: fileName || 'resume.pdf',
        skills: JSON.stringify(analysis.skills || []),
        missingSkills: JSON.stringify(analysis.missingSkills || []),
        suggestions: JSON.stringify(analysis.suggestions || []),
        rawText: resumeText.slice(0, 5000),
      },
    });

    res.json({
      id: saved.id,
      skills: analysis.skills || [],
      missingSkills: analysis.missingSkills || [],
      suggestions: analysis.suggestions || [],
      summary: analysis.summary || '',
      recommendedCourses,
    });
  } catch (error) {
    console.error('Resume analyze error:', error);
    res.status(500).json({ message: 'Failed to analyze resume. Please try again.' });
  }
};

// GET /api/resume/history
const getHistory = async (req, res) => {
  try {
    const analyses = await prisma.resumeAnalysis.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { id: true, fileName: true, skills: true, createdAt: true },
    });
    res.json(analyses.map(a => ({ ...a, skills: JSON.parse(a.skills) })));
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch history' });
  }
};

module.exports = { analyzeResume, getHistory };
