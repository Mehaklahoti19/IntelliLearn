// Must be first — sets DATABASE_URL before any Prisma client loads
const dotenv = require('dotenv');
dotenv.config();
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:./dev.db';
}

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { execSync } = require('child_process');
const { connectDB, getPrisma } = require('./config/database');

const app = express();

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const allowedOrigins = process.env.NODE_ENV === 'production'
      ? [process.env.FRONTEND_URL, /https:\/\/.*\.vercel\.app$/]
      : ['http://localhost:5173', 'http://localhost:3000'];
    const isAllowed = allowedOrigins.some((o) =>
      o instanceof RegExp ? o.test(origin) : o === origin
    );
    callback(isAllowed ? null : new Error('Not allowed by CORS'), isAllowed);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/resume', require('./routes/resumeRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'IntelliLearn API is running' });
});

app.use((err, req, res, next) => {
  console.error('Global error:', err.stack);
  res.status(500).json({ message: err.message || 'Something went wrong!' });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

async function startServer() {
  // Step 1: Run migrations
  try {
    console.log('Running database migrations...');
    execSync('npx prisma migrate deploy', {
      stdio: 'inherit',
      cwd: __dirname,
      env: { ...process.env },
    });
    console.log('✅ Migrations complete');
  } catch (err) {
    console.error('⚠️ Migration error (may already be applied):', err.message);
  }

  // Step 2: Connect DB
  await connectDB();

  // Step 3: Verify tables + auto-seed if empty
  const prisma = getPrisma();
  try {
    const courseCount = await prisma.course.count();
    const userCount = await prisma.user.count();
    console.log(`✅ DB ready — ${courseCount} courses, ${userCount} users`);

    if (courseCount === 0) {
      console.log('📦 Empty DB detected, running seeder...');
      try {
        const { seedDatabase } = require('./seeder');
        await seedDatabase();
        console.log('✅ Auto-seed complete');
      } catch (seedErr) {
        console.error('⚠️ Seeder error:', seedErr.message);
      }
    }
  } catch (err) {
    console.error('❌ DB verification failed:', err.message);
    process.exit(1);
  }

  // Step 4: Start listening
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📚 Environment: ${process.env.NODE_ENV}`);
  });
}

process.on('uncaughtException', (err) => console.error('Uncaught Exception:', err));
process.on('unhandledRejection', (reason) => console.error('Unhandled Rejection:', reason));

startServer();
