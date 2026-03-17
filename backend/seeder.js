const { prisma } = require('./config/database');
const bcrypt = require('bcryptjs');

const sampleCourses = [
  {
    title: 'Complete Python Bootcamp: From Zero to Hero',
    description: 'Learn Python from scratch with hands-on projects. Master variables, OOP, file handling, and more.',
    instructor: 'Dr. Angela Yu',
    thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800',
    previewVideo: 'https://www.youtube.com/watch?v=rfscVS0vtbw',
    category: 'Programming', difficulty: 'Beginner', duration: 22, price: 84.99, rating: 4.8,
    tags: JSON.stringify(['python', 'programming', 'beginner']), enrolledStudents: 15420,
    syllabus: [
      { title: 'Introduction to Python', content: 'Setup, variables, data types', duration: 45, order: 1 },
      { title: 'Control Flow', content: 'If statements, loops, logical operators', duration: 60, order: 2 },
      { title: 'Functions & Modules', content: 'Defining functions, imports, scope', duration: 55, order: 3 },
      { title: 'OOP in Python', content: 'Classes, objects, inheritance', duration: 90, order: 4 },
      { title: 'File Handling & APIs', content: 'Read/write files, requests library', duration: 50, order: 5 },
    ],
  },
  {
    title: 'React - The Complete Guide 2024',
    description: 'Master React.js with hooks, context API, Redux Toolkit, and build real-world projects.',
    instructor: 'Maximilian Schwarzmüller',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
    previewVideo: 'https://www.youtube.com/watch?v=w7ejDZ8SWv8',
    category: 'Web Development', difficulty: 'Intermediate', duration: 40, price: 94.99, rating: 4.9,
    tags: JSON.stringify(['react', 'javascript', 'frontend']), enrolledStudents: 23150,
    syllabus: [
      { title: 'React Basics & JSX', content: 'Components, props, state', duration: 60, order: 1 },
      { title: 'Hooks Deep Dive', content: 'useState, useEffect, useContext', duration: 80, order: 2 },
      { title: 'State Management', content: 'Context API and Redux Toolkit', duration: 70, order: 3 },
      { title: 'React Router v6', content: 'Navigation, nested routes, params', duration: 45, order: 4 },
      { title: 'Performance & Testing', content: 'Memoization, lazy loading, Jest', duration: 55, order: 5 },
    ],
  },
  {
    title: 'Machine Learning A-Z: AI, Python & R',
    description: 'Learn ML algorithms in Python and R. Covers supervised, unsupervised learning and neural networks.',
    instructor: 'Kirill Eremenko',
    thumbnail: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800',
    previewVideo: 'https://www.youtube.com/watch?v=GwIo3gDZCVQ',
    category: 'AI/ML', difficulty: 'Advanced', duration: 44, price: 129.99, rating: 4.7,
    tags: JSON.stringify(['machine-learning', 'ai', 'python']), enrolledStudents: 18900,
    syllabus: [
      { title: 'Intro to ML', content: 'Types of ML, workflow overview', duration: 30, order: 1 },
      { title: 'Data Preprocessing', content: 'Cleaning, encoding, scaling', duration: 50, order: 2 },
      { title: 'Regression Models', content: 'Linear, polynomial regression', duration: 65, order: 3 },
      { title: 'Classification', content: 'Logistic regression, SVM, decision trees', duration: 70, order: 4 },
      { title: 'Neural Networks', content: 'Deep learning with TensorFlow', duration: 85, order: 5 },
    ],
  },
  {
    title: 'UI/UX Design Masterclass: Figma & Adobe XD',
    description: 'Design beautiful interfaces and experiences. Build a portfolio with real-world projects.',
    instructor: 'Daniel Walter Scott',
    thumbnail: 'https://images.unsplash.com/photo-1586717791821-3f44a5638d48?w=800',
    previewVideo: 'https://www.youtube.com/watch?v=FTFaEOyKTEU',
    category: 'Design', difficulty: 'Beginner', duration: 28, price: 74.99, rating: 4.6,
    tags: JSON.stringify(['design', 'figma', 'ui-ux']), enrolledStudents: 12300,
    syllabus: [
      { title: 'Design Fundamentals', content: 'Color theory, typography, layout', duration: 40, order: 1 },
      { title: 'Figma Basics', content: 'Frames, auto-layout, components', duration: 55, order: 2 },
      { title: 'Prototyping', content: 'Interactive prototypes and animations', duration: 45, order: 3 },
      { title: 'User Research', content: 'Personas, user journeys, testing', duration: 35, order: 4 },
      { title: 'Portfolio Project', content: 'Complete app design from scratch', duration: 75, order: 5 },
    ],
  },
  {
    title: 'Advanced JavaScript Concepts & Patterns',
    description: 'Deep dive into closures, prototypes, async programming, design patterns and performance.',
    instructor: 'Andrei Neagoie',
    thumbnail: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=800',
    previewVideo: 'https://www.youtube.com/watch?v=Bv_5Zv5c-Ts',
    category: 'Programming', difficulty: 'Advanced', duration: 20, price: 89.99, rating: 4.9,
    tags: JSON.stringify(['javascript', 'advanced', 'patterns']), enrolledStudents: 14200,
    syllabus: [
      { title: 'Execution Context & Closures', content: 'Call stack, scope chain', duration: 35, order: 1 },
      { title: 'Prototypes & Classes', content: 'Prototype chain, ES6 classes', duration: 40, order: 2 },
      { title: 'Async JavaScript', content: 'Promises, async/await, event loop', duration: 50, order: 3 },
      { title: 'Design Patterns', content: 'Module, factory, observer patterns', duration: 55, order: 4 },
      { title: 'Performance', content: 'Debouncing, throttling, memoization', duration: 40, order: 5 },
    ],
  },
  {
    title: 'Node.js & Express: Backend Development Masterclass',
    description: 'Build scalable REST APIs with Node.js, Express, MongoDB, and JWT authentication.',
    instructor: 'Jonas Schmedtmann',
    thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800',
    previewVideo: 'https://www.youtube.com/watch?v=Oe421EPjeBE',
    category: 'Web Development', difficulty: 'Intermediate', duration: 35, price: 89.99, rating: 4.8,
    tags: JSON.stringify(['nodejs', 'express', 'backend', 'api']), enrolledStudents: 19800,
    syllabus: [
      { title: 'Node.js Fundamentals', content: 'Event loop, modules, npm', duration: 50, order: 1 },
      { title: 'Express Framework', content: 'Routing, middleware, error handling', duration: 60, order: 2 },
      { title: 'Database Integration', content: 'MongoDB, Mongoose ODM', duration: 70, order: 3 },
      { title: 'Authentication', content: 'JWT, bcrypt, protected routes', duration: 55, order: 4 },
      { title: 'Deployment', content: 'Heroku, environment variables, CI/CD', duration: 40, order: 5 },
    ],
  },
  {
    title: 'Full Stack Web Development Bootcamp',
    description: 'Complete full-stack course covering HTML, CSS, JavaScript, React, Node.js, and databases.',
    instructor: 'Colt Steele',
    thumbnail: 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=800',
    previewVideo: 'https://www.youtube.com/watch?v=nu_pCVPKzTk',
    category: 'Web Development', difficulty: 'Beginner', duration: 63, price: 109.99, rating: 4.7,
    tags: JSON.stringify(['fullstack', 'html', 'css', 'javascript', 'react']), enrolledStudents: 31200,
    syllabus: [
      { title: 'HTML & CSS Fundamentals', content: 'Semantic HTML, Flexbox, Grid', duration: 80, order: 1 },
      { title: 'JavaScript Essentials', content: 'DOM, events, fetch API', duration: 90, order: 2 },
      { title: 'React Frontend', content: 'Components, hooks, routing', duration: 100, order: 3 },
      { title: 'Node.js Backend', content: 'Express, REST APIs, auth', duration: 90, order: 4 },
      { title: 'Database & Deployment', content: 'SQL, MongoDB, cloud deploy', duration: 70, order: 5 },
    ],
  },
  {
    title: 'Data Science with Python: Complete Bootcamp',
    description: 'Master data analysis, visualization, and machine learning using Python, Pandas, and Scikit-learn.',
    instructor: 'Jose Portilla',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
    previewVideo: 'https://www.youtube.com/watch?v=r-uOLxNrNk8',
    category: 'Data Science', difficulty: 'Intermediate', duration: 30, price: 99.99, rating: 4.7,
    tags: JSON.stringify(['data-science', 'python', 'pandas', 'visualization']), enrolledStudents: 22100,
    syllabus: [
      { title: 'Python for Data Science', content: 'NumPy, Pandas basics', duration: 60, order: 1 },
      { title: 'Data Visualization', content: 'Matplotlib, Seaborn, Plotly', duration: 55, order: 2 },
      { title: 'Statistical Analysis', content: 'Descriptive stats, hypothesis testing', duration: 50, order: 3 },
      { title: 'Machine Learning', content: 'Scikit-learn, model evaluation', duration: 70, order: 4 },
      { title: 'Capstone Project', content: 'End-to-end data science project', duration: 60, order: 5 },
    ],
  },
  {
    title: 'Deep Learning & Neural Networks with TensorFlow',
    description: 'Build and train deep neural networks for image recognition, NLP, and time series forecasting.',
    instructor: 'Andrew Ng',
    thumbnail: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800',
    previewVideo: 'https://www.youtube.com/watch?v=CS4cs9xVecg',
    category: 'AI/ML', difficulty: 'Advanced', duration: 38, price: 139.99, rating: 4.9,
    tags: JSON.stringify(['deep-learning', 'tensorflow', 'neural-networks', 'ai']), enrolledStudents: 16700,
    syllabus: [
      { title: 'Neural Network Basics', content: 'Perceptrons, activation functions', duration: 45, order: 1 },
      { title: 'TensorFlow & Keras', content: 'Building and training models', duration: 70, order: 2 },
      { title: 'CNNs for Vision', content: 'Image classification, object detection', duration: 80, order: 3 },
      { title: 'RNNs & NLP', content: 'Sequence models, text classification', duration: 75, order: 4 },
      { title: 'Model Deployment', content: 'TF Serving, TFLite, cloud deploy', duration: 50, order: 5 },
    ],
  },
  {
    title: 'Java Programming Masterclass',
    description: 'Complete Java course from basics to advanced OOP, data structures, and Spring Boot.',
    instructor: 'Tim Buchalka',
    thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
    previewVideo: 'https://www.youtube.com/watch?v=eIrMbAQSU34',
    category: 'Programming', difficulty: 'Beginner', duration: 80, price: 94.99, rating: 4.6,
    tags: JSON.stringify(['java', 'oop', 'spring', 'backend']), enrolledStudents: 28400,
    syllabus: [
      { title: 'Java Basics', content: 'Variables, data types, operators', duration: 60, order: 1 },
      { title: 'OOP Concepts', content: 'Classes, inheritance, polymorphism', duration: 80, order: 2 },
      { title: 'Collections & Generics', content: 'Lists, maps, sets, iterators', duration: 65, order: 3 },
      { title: 'Spring Boot', content: 'REST APIs, dependency injection', duration: 90, order: 4 },
      { title: 'Database with JPA', content: 'Hibernate, CRUD operations', duration: 70, order: 5 },
    ],
  },
  {
    title: 'TypeScript: The Complete Developer Guide',
    description: 'Master TypeScript with generics, decorators, advanced types, and integration with React and Node.',
    instructor: 'Stephen Grider',
    thumbnail: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800',
    previewVideo: 'https://www.youtube.com/watch?v=BwuLxPH8IDs',
    category: 'Web Development', difficulty: 'Intermediate', duration: 24, price: 84.99, rating: 4.8,
    tags: JSON.stringify(['typescript', 'javascript', 'types']), enrolledStudents: 17300,
    syllabus: [
      { title: 'TypeScript Basics', content: 'Types, interfaces, enums', duration: 50, order: 1 },
      { title: 'Advanced Types', content: 'Generics, union, intersection types', duration: 60, order: 2 },
      { title: 'Classes & Decorators', content: 'OOP in TypeScript, metadata', duration: 55, order: 3 },
      { title: 'TypeScript with React', content: 'Typed components, hooks, props', duration: 65, order: 4 },
      { title: 'TypeScript with Node', content: 'Express APIs, type-safe backend', duration: 50, order: 5 },
    ],
  },
  {
    title: 'Next.js 14: Full Stack React Framework',
    description: 'Build production-ready apps with Next.js 14, App Router, Server Components, and Prisma.',
    instructor: 'Lee Robinson',
    thumbnail: 'https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=800',
    previewVideo: 'https://www.youtube.com/watch?v=ZVnjOPwW4ZA',
    category: 'Web Development', difficulty: 'Intermediate', duration: 18, price: 79.99, rating: 4.8,
    tags: JSON.stringify(['nextjs', 'react', 'fullstack', 'ssr']), enrolledStudents: 13500,
    syllabus: [
      { title: 'App Router Basics', content: 'File-based routing, layouts', duration: 45, order: 1 },
      { title: 'Server Components', content: 'RSC, streaming, suspense', duration: 55, order: 2 },
      { title: 'Data Fetching', content: 'Server actions, fetch, caching', duration: 50, order: 3 },
      { title: 'Authentication', content: 'NextAuth.js, middleware', duration: 45, order: 4 },
      { title: 'Deployment', content: 'Vercel, environment variables', duration: 30, order: 5 },
    ],
  },
  {
    title: 'SQL & Database Design Masterclass',
    description: 'Master SQL from basics to advanced queries, database design, indexing, and PostgreSQL.',
    instructor: 'Mosh Hamedani',
    thumbnail: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800',
    previewVideo: 'https://www.youtube.com/watch?v=7S_tz1z_5bA',
    category: 'Data Science', difficulty: 'Beginner', duration: 16, price: 59.99, rating: 4.7,
    tags: JSON.stringify(['sql', 'database', 'postgresql', 'data']), enrolledStudents: 21000,
    syllabus: [
      { title: 'SQL Fundamentals', content: 'SELECT, WHERE, ORDER BY, LIMIT', duration: 40, order: 1 },
      { title: 'Joins & Subqueries', content: 'INNER, LEFT, RIGHT joins', duration: 55, order: 2 },
      { title: 'Database Design', content: 'Normalization, ERD, relationships', duration: 60, order: 3 },
      { title: 'Advanced SQL', content: 'Window functions, CTEs, indexes', duration: 65, order: 4 },
      { title: 'PostgreSQL', content: 'Setup, JSON support, performance', duration: 45, order: 5 },
    ],
  },
  {
    title: 'DevOps & CI/CD: Docker, Kubernetes & AWS',
    description: 'Learn containerization, orchestration, and cloud deployment with Docker, Kubernetes, and AWS.',
    instructor: 'Mumshad Mannambeth',
    thumbnail: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800',
    previewVideo: 'https://www.youtube.com/watch?v=fqMOX6JJhGo',
    category: 'Web Development', difficulty: 'Advanced', duration: 32, price: 119.99, rating: 4.7,
    tags: JSON.stringify(['devops', 'docker', 'kubernetes', 'aws', 'cicd']), enrolledStudents: 11200,
    syllabus: [
      { title: 'Docker Fundamentals', content: 'Images, containers, Dockerfile', duration: 60, order: 1 },
      { title: 'Docker Compose', content: 'Multi-container apps, networking', duration: 50, order: 2 },
      { title: 'Kubernetes Basics', content: 'Pods, deployments, services', duration: 80, order: 3 },
      { title: 'CI/CD Pipelines', content: 'GitHub Actions, automated testing', duration: 55, order: 4 },
      { title: 'AWS Deployment', content: 'ECS, EKS, load balancers', duration: 65, order: 5 },
    ],
  },
  {
    title: 'Natural Language Processing with Python',
    description: 'Build NLP applications using NLTK, spaCy, Hugging Face Transformers, and fine-tune LLMs.',
    instructor: 'Chris McCormick',
    thumbnail: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800',
    previewVideo: 'https://www.youtube.com/watch?v=X2vAabgKiuM',
    category: 'AI/ML', difficulty: 'Advanced', duration: 26, price: 114.99, rating: 4.6,
    tags: JSON.stringify(['nlp', 'python', 'transformers', 'bert', 'ai']), enrolledStudents: 9400,
    syllabus: [
      { title: 'Text Preprocessing', content: 'Tokenization, stemming, lemmatization', duration: 45, order: 1 },
      { title: 'Classical NLP', content: 'TF-IDF, Naive Bayes, sentiment analysis', duration: 55, order: 2 },
      { title: 'Word Embeddings', content: 'Word2Vec, GloVe, FastText', duration: 50, order: 3 },
      { title: 'Transformers & BERT', content: 'Attention mechanism, fine-tuning', duration: 75, order: 4 },
      { title: 'LLM Applications', content: 'Hugging Face, prompt engineering', duration: 60, order: 5 },
    ],
  },
  {
    title: 'Flutter & Dart: Build iOS & Android Apps',
    description: 'Create beautiful cross-platform mobile apps with Flutter, Dart, Firebase, and state management.',
    instructor: 'Angela Yu',
    thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800',
    previewVideo: 'https://www.youtube.com/watch?v=VPvVD8t02U8',
    category: 'Programming', difficulty: 'Intermediate', duration: 28, price: 89.99, rating: 4.7,
    tags: JSON.stringify(['flutter', 'dart', 'mobile', 'ios', 'android']), enrolledStudents: 14800,
    syllabus: [
      { title: 'Dart Fundamentals', content: 'Variables, functions, OOP in Dart', duration: 50, order: 1 },
      { title: 'Flutter Widgets', content: 'Stateless, stateful, layout widgets', duration: 65, order: 2 },
      { title: 'State Management', content: 'Provider, Riverpod, BLoC', duration: 70, order: 3 },
      { title: 'Firebase Integration', content: 'Auth, Firestore, storage', duration: 60, order: 4 },
      { title: 'App Publishing', content: 'Play Store, App Store deployment', duration: 40, order: 5 },
    ],
  },
  {
    title: 'Graphic Design Bootcamp: Photoshop & Illustrator',
    description: 'Master Adobe Photoshop and Illustrator for logo design, photo editing, and brand identity.',
    instructor: 'Lindsay Marsh',
    thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800',
    previewVideo: 'https://www.youtube.com/watch?v=IyR_uYsRdPs',
    category: 'Design', difficulty: 'Beginner', duration: 20, price: 69.99, rating: 4.5,
    tags: JSON.stringify(['design', 'photoshop', 'illustrator', 'graphic-design']), enrolledStudents: 10600,
    syllabus: [
      { title: 'Photoshop Basics', content: 'Layers, masks, selections', duration: 55, order: 1 },
      { title: 'Photo Editing', content: 'Color correction, retouching', duration: 50, order: 2 },
      { title: 'Illustrator Basics', content: 'Vectors, paths, shapes', duration: 55, order: 3 },
      { title: 'Logo Design', content: 'Brand identity, typography', duration: 60, order: 4 },
      { title: 'Portfolio Project', content: 'Complete brand design project', duration: 65, order: 5 },
    ],
  },
  {
    title: 'Cybersecurity Fundamentals & Ethical Hacking',
    description: 'Learn network security, penetration testing, and ethical hacking with Kali Linux and Metasploit.',
    instructor: 'Nathan House',
    thumbnail: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800',
    previewVideo: 'https://www.youtube.com/watch?v=3Kq1MIfTWCE',
    category: 'Programming', difficulty: 'Intermediate', duration: 30, price: 99.99, rating: 4.6,
    tags: JSON.stringify(['cybersecurity', 'ethical-hacking', 'networking', 'kali']), enrolledStudents: 12900,
    syllabus: [
      { title: 'Network Fundamentals', content: 'TCP/IP, DNS, HTTP, firewalls', duration: 55, order: 1 },
      { title: 'Linux & Kali', content: 'Command line, Kali tools', duration: 60, order: 2 },
      { title: 'Reconnaissance', content: 'OSINT, Nmap, information gathering', duration: 50, order: 3 },
      { title: 'Exploitation', content: 'Metasploit, SQL injection, XSS', duration: 70, order: 4 },
      { title: 'Defense & Hardening', content: 'Firewalls, IDS, security best practices', duration: 55, order: 5 },
    ],
  },
  {
    title: 'AWS Cloud Practitioner & Solutions Architect',
    description: 'Prepare for AWS certifications. Learn EC2, S3, Lambda, RDS, VPC, and cloud architecture.',
    instructor: 'Stephane Maarek',
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
    previewVideo: 'https://www.youtube.com/watch?v=SOTamWNgDKc',
    category: 'Web Development', difficulty: 'Intermediate', duration: 27, price: 109.99, rating: 4.8,
    tags: JSON.stringify(['aws', 'cloud', 'devops', 'certification']), enrolledStudents: 20300,
    syllabus: [
      { title: 'Cloud Fundamentals', content: 'IaaS, PaaS, SaaS, regions, AZs', duration: 40, order: 1 },
      { title: 'Compute & Storage', content: 'EC2, S3, EBS, Lambda', duration: 65, order: 2 },
      { title: 'Networking', content: 'VPC, subnets, security groups', duration: 55, order: 3 },
      { title: 'Databases', content: 'RDS, DynamoDB, ElastiCache', duration: 50, order: 4 },
      { title: 'Architecture & Security', content: 'IAM, CloudWatch, best practices', duration: 60, order: 5 },
    ],
  },
  {
    title: 'Business Analytics & Power BI Masterclass',
    description: 'Transform data into insights using Power BI, DAX, and data modeling for business decisions.',
    instructor: 'Chris Dutton',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
    previewVideo: 'https://www.youtube.com/watch?v=AGrl-H87pRU',
    category: 'Data Science', difficulty: 'Beginner', duration: 18, price: 64.99, rating: 4.6,
    tags: JSON.stringify(['power-bi', 'analytics', 'business', 'data-visualization']), enrolledStudents: 15700,
    syllabus: [
      { title: 'Power BI Basics', content: 'Interface, data import, visuals', duration: 45, order: 1 },
      { title: 'Data Modeling', content: 'Relationships, star schema', duration: 55, order: 2 },
      { title: 'DAX Formulas', content: 'Calculated columns, measures', duration: 60, order: 3 },
      { title: 'Advanced Visuals', content: 'Custom visuals, drill-through', duration: 50, order: 4 },
      { title: 'Publishing & Sharing', content: 'Power BI Service, dashboards', duration: 35, order: 5 },
    ],
  },
];

const seedDatabase = async () => {
  try {
    console.log('Starting database seed...');

    // Clear existing data (preserve order for FK constraints)
    await prisma.resumeAnalysis.deleteMany({});
    await prisma.savedProject.deleteMany({});
    await prisma.notification.deleteMany({});
    await prisma.completedQuiz.deleteMany({});
    await prisma.chatHistory.deleteMany({});
    await prisma.review.deleteMany({});
    await prisma.bookmarkedCourse.deleteMany({});
    await prisma.enrollment.deleteMany({});
    await prisma.quiz.deleteMany({});
    await prisma.lesson.deleteMany({});
    await prisma.course.deleteMany({});
    await prisma.user.deleteMany({});

    console.log('✅ Cleared existing data');

    const hashedPassword = await bcrypt.hash('test123', 10);
    const testUser = await prisma.user.create({
      data: { name: 'Test User', email: 'test@example.com', password: hashedPassword, learningStreak: 5 },
    });
    console.log(`✅ Created test user: ${testUser.email}`);

    for (const courseData of sampleCourses) {
      const { syllabus, ...courseInfo } = courseData;
      await prisma.course.create({
        data: { ...courseInfo, syllabus: { create: syllabus } },
      });
      console.log(`📚 Created: ${courseInfo.title}`);
    }

    // Seed a welcome notification for test user
    await prisma.notification.create({
      data: {
        userId: testUser.id,
        title: 'Welcome to IntelliLearn!',
        message: 'Start your learning journey. Explore courses and use the AI Tutor.',
        type: 'info',
        link: '/courses',
      },
    });

    console.log(`\n✅ Seeded ${sampleCourses.length} courses`);
    console.log('Email: test@example.com | Password: test123');
  } catch (error) {
    console.error('❌ Seed error:', error);
    throw error;
  }
};

// Run directly if called as script
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { seedDatabase };
