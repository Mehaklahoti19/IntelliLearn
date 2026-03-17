const dotenv = require('dotenv');
dotenv.config();

// Ensure DATABASE_URL is always set before Prisma loads
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:./dev.db';
}

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { execSync } = require('child_process');
const { PrismaClient } = require('@prisma/client');

const app = express();

// Middleware
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

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Something went wrong!' });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

async function startServer() {
  // Run migrations first
  try {
    console.log('Running database migrations...');
    execSync('npx prisma migrate deploy', {
      stdio: 'inherit',
      cwd: __dirname,
      env: { ...process.env },
    });
    console.log('✅ Migrations complete');
  } catch (err) {
    console.error('❌ Migration error:', err.message);
    // Don't exit — tables may already exist
  }

  // Verify DB connection
  const prisma = new PrismaClient();
  try {
    await prisma.$connect();
    await prisma.user.count();
    console.log('✅ Database connected and tables verified');
    await prisma.$disconnect();
  } catch (err) {
    console.error('❌ Database check failed:', err.message);
    await prisma.$disconnect();
    process.exit(1);
  }

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📚 Environment: ${process.env.NODE_ENV}`);
  });
}

process.on('uncaughtException', (err) => console.error('Uncaught Exception:', err));
process.on('unhandledRejection', (reason) => console.error('Unhandled Rejection:', reason));

startServer();
