const geminiService = require('../services/geminiService');
const { prisma } = require('../config/database');

// @desc    Chat with AI tutor
// @route   POST /api/ai/chat
// @access  Private
const chatWithAI = async (req, res) => {
  try {
    console.log('📩 Received chat request from user:', req.user?.id);
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const { message, courseId, chatId } = req.body;

    // Validate input
    if (!message || message.trim() === '') {
      console.log('❌ Validation failed: Message is required');
      return res.status(400).json({ message: 'Message is required' });
    }

    console.log('✅ Input validated. Message:', message.substring(0, 50) + '...');

    // Get course context if provided
    let context = '';
    if (courseId) {
      try {
        const course = await prisma.course.findUnique({
          where: { id: courseId },
        });
        if (course) {
          context = `${course.title} - ${course.description}`;
          console.log('📚 Course context added:', course.title);
        }
      } catch (dbError) {
        console.error('⚠️  Database error fetching course:', dbError.message);
        // Continue without course context
      }
    }

    // Generate AI response
    console.log('🤖 Calling Groq AI service...');
    const aiResponse = await geminiService.chatTutor(message, context);
    console.log('✅ AI response received, length:', aiResponse.length);

    // Save to chat history
    let chatHistory;
    try {
      if (chatId) {
        chatHistory = await prisma.chatHistory.findUnique({
          where: { id: chatId },
        });
        
        if (chatHistory) {
          const messages = JSON.parse(chatHistory.messages);
          messages.push(
            { role: 'user', content: message },
            { role: 'assistant', content: aiResponse }
          );
          
          await prisma.chatHistory.update({
            where: { id: chatId },
            data: { messages: JSON.stringify(messages) },
          });
          console.log('💬 Updated existing chat:', chatId);
        } else {
          // Create new chat if chatId not found
          chatHistory = await prisma.chatHistory.create({
            data: {
              userId: req.user.id,
              messages: JSON.stringify([
                { role: 'user', content: message },
                { role: 'assistant', content: aiResponse },
              ]),
              courseId: courseId || undefined,
            },
          });
          console.log('💬 Created new chat (chatId not found):', chatHistory.id);
        }
      } else {
        // Create new chat
        chatHistory = await prisma.chatHistory.create({
          data: {
            userId: req.user.id,
            title: message.substring(0, 30) + '...',
            messages: JSON.stringify([
              { role: 'user', content: message },
              { role: 'assistant', content: aiResponse },
            ]),
            courseId: courseId || undefined,
          },
        });
        console.log('💬 Created new chat:', chatHistory.id);
      }
    } catch (dbError) {
      console.error('⚠️  Database error saving chat history:', dbError.message);
      // Continue without saving to database - still return AI response
      chatHistory = { id: null };
    }

    console.log('✅ Successfully processed chat request');
    res.json({
      response: aiResponse,
      chatId: chatHistory?.id || null,
    });
  } catch (error) {
    console.error('❌ AI Chat error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error type:', error.constructor.name);
    
    // Check for specific error types
    let errorMessage = 'Failed to get AI response';
    let statusCode = 500;
    
    if (error.message && error.message.includes('rate limit')) {
      errorMessage = 'AI Tutor is currently at capacity due to API rate limits. Please wait a moment and try again.';
    } else if (error.message && error.message.includes('quota')) {
      errorMessage = 'AI Tutor quota exceeded. Please try again in a few minutes or contact support.';
    } else if (error.message && error.message.includes('API key')) {
      errorMessage = 'AI service configuration error. Please contact support.';
    } else if (error.message && error.message.includes('400')) {
      errorMessage = 'Invalid request to AI service. Please try again.';
      statusCode = 400;
    }
    
    // Fallback response for frontend
    res.status(statusCode).json({ 
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      fallback: true
    });
  }
};

// @desc    Generate AI notes from course
// @route   POST /api/ai/notes
// @access  Private
const generateNotes = async (req, res) => {
  try {
    console.log('📝 Generating notes for course:', req.body.courseId);
    
    const { courseId } = req.body;

    // Validate input
    if (!courseId) {
      console.log('❌ Validation failed: Course ID required');
      return res.status(400).json({ message: 'Course ID is required' });
    }

    // Fetch course with syllabus
    console.log('📚 Fetching course from database...');
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { syllabus: true },
    });

    if (!course) {
      console.log('❌ Course not found:', courseId);
      return res.status(404).json({ message: 'Course not found' });
    }

    console.log('✅ Course found:', course.title);

    // Prepare syllabus content
    const syllabusContent = course.syllabus
      .map((item, index) => `${index + 1}. ${item.title}\n   ${item.content}`)
      .join('\n\n');

    // Generate notes using Groq AI
    console.log('🤖 Calling Groq API to generate notes...');
    const notes = await geminiService.generateNotes(course.title, syllabusContent);
    console.log('✅ Notes generated successfully, length:', notes.length);

    res.json({
      courseId: course.id,
      courseTitle: course.title,
      notes,
      message: 'Notes generated successfully',
    });
  } catch (error) {
    console.error('❌ Generate Notes error:', error);
    console.error('Error stack:', error.stack);
    
    let errorMessage = 'Failed to generate notes';
    let statusCode = 500;
    
    if (error.message && error.message.includes('Course not found')) {
      errorMessage = 'Course not found';
      statusCode = 404;
    } else if (error.message && error.message.includes('API')) {
      errorMessage = 'AI service unavailable. Please try again.';
    }
    
    res.status(statusCode).json({ 
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Generate AI quiz from course
// @route   POST /api/ai/quiz
// @access  Private
const generateQuiz = async (req, res) => {
  try {
    console.log('🎯 Generating quiz for course:', req.body.courseId);
    
    const { courseId, topic } = req.body;

    // Validate input
    if (!courseId) {
      console.log('❌ Validation failed: Course ID required');
      return res.status(400).json({ message: 'Course ID is required' });
    }

    // Fetch course
    console.log('📚 Fetching course from database...');
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      console.log('❌ Course not found:', courseId);
      return res.status(404).json({ message: 'Course not found' });
    }

    console.log('✅ Course found:', course.title);

    const quizTopic = topic || course.title;
    
    // Generate quiz using Groq AI
    console.log('🤖 Calling Groq API to generate quiz...');
    const quizData = await geminiService.generateQuiz(course.title, quizTopic);
    console.log('✅ Quiz generated successfully');
    console.log('📊 Quiz data:', JSON.stringify(quizData, null, 2));

    // Save quiz to database
    console.log('💾 Saving quiz to database...');
    const quiz = await prisma.quiz.create({
      data: {
        courseId: courseId,
        title: `${course.title} - ${quizTopic} Quiz`,
        questions: JSON.stringify(quizData.questions),
        generatedByAI: true,
        topic: quizTopic,
      },
    });
    console.log('✅ Quiz saved with ID:', quiz.id);

    // Return the quiz questions directly for immediate display
    res.json({
      quiz: quizData.questions, // Send the actual questions array
      quizId: quiz.id,
      message: 'Quiz generated successfully',
    });
  } catch (error) {
    console.error('❌ Generate Quiz error:', error);
    console.error('Error stack:', error.stack);
    
    let errorMessage = 'Failed to generate quiz';
    let statusCode = 500;
    
    if (error.message && error.message.includes('Course not found')) {
      errorMessage = 'Course not found';
      statusCode = 404;
    } else if (error.message && error.message.includes('API')) {
      errorMessage = 'AI service unavailable. Please try again.';
    } else if (error.code === 'P2003') {
      // Prisma foreign key error
      errorMessage = 'Invalid course reference';
      statusCode = 400;
    }
    
    res.status(statusCode).json({ 
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Explain code with AI
// @route   POST /api/ai/explain-code
// @access  Private
const explainCode = async (req, res) => {
  try {
    const { code, language } = req.body;

    if (!code || code.trim() === '') {
      return res.status(400).json({ message: 'Code is required' });
    }

    const explanation = await geminiService.explainCode(code, language || 'javascript');

    res.json({
      code,
      language: language || 'javascript',
      explanation,
    });
  } catch (error) {
    console.error('Explain Code error:', error);
    res.status(500).json({ message: 'Failed to explain code' });
  }
};

// @desc    Generate learning roadmap
// @route   POST /api/ai/roadmap
// @access  Private
const generateRoadmap = async (req, res) => {
  try {
    const { careerGoal, currentLevel } = req.body;

    if (!careerGoal || careerGoal.trim() === '') {
      return res.status(400).json({ message: 'Career goal is required' });
    }

    const roadmap = await geminiService.generateRoadmap(
      careerGoal,
      currentLevel || 'beginner'
    );

    res.json({
      careerGoal,
      roadmap,
    });
  } catch (error) {
    console.error('Generate Roadmap error:', error);
    res.status(500).json({ message: 'Failed to generate roadmap' });
  }
};

// @desc    Get AI course recommendations
// @route   POST /api/ai/recommend
// @access  Private
const recommendCourses = async (req, res) => {
  try {
    const { interests } = req.body;

    if (!interests) {
      return res.status(400).json({ message: 'Interests are required' });
    }

    // Get completed courses for better recommendations
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        enrolledCourses: {
          include: {
            course: true,
          },
        },
      },
    });
    
    const completedCourses = user.enrolledCourses
      .filter(enrollment => enrollment.progress === 100)
      .map(enrollment => enrollment.course.title);

    const recommendations = await geminiService.recommendCourses(
      interests,
      completedCourses
    );

    res.json({
      recommendations: recommendations.recommendations || [],
    });
  } catch (error) {
    console.error('Recommend Courses error:', error);
    res.status(500).json({ message: 'Failed to recommend courses' });
  }
};

// @desc    Get user's chat history
// @route   GET /api/ai/chat-history
// @access  Private
const getChatHistory = async (req, res) => {
  try {
    const chats = await prisma.chatHistory.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    res.json(chats);
  } catch (error) {
    console.error('Get Chat History error:', error);
    res.status(500).json({ message: 'Failed to fetch chat history' });
  }
};

// @desc    Delete chat
// @route   DELETE /api/ai/chat/:id
// @access  Private
const deleteChat = async (req, res) => {
  try {
    const chat = await prisma.chatHistory.deleteMany({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    res.json({ message: 'Chat deleted successfully' });
  } catch (error) {
    console.error('Delete Chat error:', error);
    res.status(500).json({ message: 'Failed to delete chat' });
  }
};

module.exports = {
  chatWithAI,
  generateNotes,
  generateQuiz,
  explainCode,
  generateRoadmap,
  recommendCourses,
  getChatHistory,
  deleteChat,
};
