const { Groq } = require('groq-sdk');

// Groq Cloud API - FREE, Fast, No Quotas!
const GROQ_API_KEY = process.env.GROQ_API_KEY || 'gsk_xxxxxxxxxxxxx';
const GROQ_MODEL = 'llama-3.1-8b-instant'; // Current free Llama 3.1 model (2026)

// Initialize Groq client
const groq = new Groq({ apiKey: GROQ_API_KEY });

class GroqService {
  constructor() {
    console.log('Groq AI initialized with model:', GROQ_MODEL);
    if (!GROQ_API_KEY || GROQ_API_KEY.includes('gsk_') && GROQ_API_KEY.length < 20) {
      console.warn('⚠️  Warning: GROQ_API_KEY not configured. Get your FREE key from https://console.groq.com/keys');
    }
  }

  // AI Tutor Chat - Answer learning questions
  async chatTutor(message, context = '') {
    try {
      const systemPrompt = `You are an intelligent AI tutor for IntelliLearn, a modern learning platform. Your goal is to help students learn effectively.`;
      
      const userPrompt = `${context ? `Context: The student is learning about "${context}".

` : ''}Student question: ${message}

Provide a clear, educational, and encouraging response. Break down complex concepts into easy-to-understand explanations. Use examples when helpful.`;

      console.log('Sending request to Groq API...');
      
      const completion = await groq.chat.completions.create({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 512
      });
      
      console.log('Groq API response received successfully!');
      return completion.choices[0].message.content;
    } catch (error) {
      console.error('Groq API Error:', error.message);
      
      if (error.status === 401) {
        throw new Error('Groq API key is invalid. Please check your GROQ_API_KEY in .env file');
      }
      if (error.status === 429) {
        throw new Error('Rate limit exceeded. Please wait a moment.');
      }
      
      throw new Error(`AI service unavailable: ${error.message}`);
    }
  }

  // Generate Notes from course content
  async generateNotes(courseTitle, syllabusContent) {
    try {
      const prompt = `Generate comprehensive study notes for the course "${courseTitle}".

Course syllabus/content:
${syllabusContent}

Create well-structured notes with:
1. Key concepts and definitions
2. Important points to remember
3. Practical examples
4. Common pitfalls to avoid
5. Summary of main takeaways

Format the notes using markdown with clear headings, bullet points, and code blocks where applicable. Make it concise yet comprehensive.`;

      console.log('Generating notes with Groq API...');
      
      const completion = await groq.chat.completions.create({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: 'You are an expert educational content creator.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1024
      });
      
      console.log('Notes generated successfully!');
      return completion.choices[0].message.content;
    } catch (error) {
      console.error('Groq Notes Generation Error:', error);
      throw new Error('Failed to generate notes');
    }
  }

  // Generate Quiz from course topic
  async generateQuiz(courseTitle, topic, numQuestions = 5) {
    try {
      const prompt = `Generate a quiz with ${numQuestions} multiple-choice questions about "${topic}" from the course "${courseTitle}".

For each question, provide:
1. The question text
2. 4 answer options (A, B, C, D)
3. Mark the correct answer
4. A brief explanation of why it's correct

Format the response as JSON with this exact structure:
{
  "questions": [
    {
      "question": "Question text here",
      "options": [
        {"text": "Option A", "isCorrect": false},
        {"text": "Option B", "isCorrect": true},
        {"text": "Option C", "isCorrect": false},
        {"text": "Option D", "isCorrect": false}
      ],
      "explanation": "Explanation here"
    }
  ]
}

Ensure questions vary in difficulty and test different aspects of understanding.`;

      console.log('Generating quiz with Groq API...');
      
      const completion = await groq.chat.completions.create({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: 'You are an expert quiz creator.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1024
      });
      
      const text = completion.choices[0].message.content.trim();
      
      // Extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        console.log('Quiz generated successfully!');
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Invalid response format from AI');
    } catch (error) {
      console.error('Groq Quiz Generation Error:', error);
      throw new Error('Failed to generate quiz');
    }
  }

  // Code Explainer
  async explainCode(code, language = 'javascript') {
    try {
      const prompt = `Explain the following ${language} code in detail:

\`\`\`${language}
${code}
\`\`\`

Provide:
1. A high-level overview of what the code does
2. Line-by-line or section-by-section explanation
3. Key concepts and techniques used
4. Best practices followed or improvements that could be made
5. Potential use cases

Make the explanation beginner-friendly but also include insights for advanced developers.`;

      console.log('Explaining code with Groq API...');
      
      const completion = await groq.chat.completions.create({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: 'You are an expert programmer and teacher.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1024
      });
      
      console.log('Code explanation generated successfully!');
      return completion.choices[0].message.content;
    } catch (error) {
      console.error('Groq Code Explanation Error:', error);
      throw new Error('Failed to explain code');
    }
  }

  // Learning Roadmap Generator
  async generateRoadmap(careerGoal, currentLevel = 'beginner') {
    try {
      const prompt = `Create a comprehensive learning roadmap for someone who wants to become a ${careerGoal}. Current skill level: ${currentLevel}.

Structure the roadmap as follows:

1. **Overview**: Brief description of the role and what it entails
2. **Prerequisites**: What should be learned before starting
3. **Learning Phases** (divide into 3-4 phases):
   - Phase name
   - Duration estimate
   - Topics to cover
   - Projects to build
   - Resources/recommendations
4. **Key Skills**: List of essential skills to master
5. **Project Ideas**: 3-5 portfolio project suggestions
6. **Next Steps**: Career advice and job search tips

Format using markdown with clear headings and bullet points. Be specific and actionable.`;

      console.log('Generating roadmap with Groq API...');
      
      const completion = await groq.chat.completions.create({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: 'You are an expert career counselor and educator.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1024
      });
      
      console.log('Roadmap generated successfully!');
      return completion.choices[0].message.content;
    } catch (error) {
      console.error('Groq Roadmap Generation Error:', error);
      throw new Error('Failed to generate roadmap');
    }
  }

  // Course Recommender
  async recommendCourses(interests, completedCourses = []) {
    try {
      const interestsStr = Array.isArray(interests) ? interests.join(', ') : interests;
      const completedStr = completedCourses.length > 0 
        ? `Already completed: ${completedCourses.join(', ')}.` 
        : '';

      const prompt = `Based on the following interests: ${interestsStr}
${completedStr}

Recommend 5-7 courses that would be perfect for this learner. For each recommendation, provide:
1. Course title
2. Brief description (1-2 sentences)
3. Why it's recommended
4. Difficulty level (Beginner/Intermediate/Advanced)
5. Estimated duration

Format as JSON:
{
  "recommendations": [
    {
      "title": "Course Title",
      "description": "Description",
      "reason": "Why recommended",
      "difficulty": "Level",
      "duration": "X hours"
    }
  ]
}`;

      console.log('Generating course recommendations with Groq API...');
      
      const completion = await groq.chat.completions.create({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: 'You are an expert educational advisor.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1024
      });
      
      const text = completion.choices[0].message.content.trim();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        console.log('Course recommendations generated successfully!');
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Invalid response format from AI');
    } catch (error) {
      console.error('Groq Course Recommendation Error:', error);
      throw new Error('Failed to recommend courses');
    }
  }
}

module.exports = new GroqService();
