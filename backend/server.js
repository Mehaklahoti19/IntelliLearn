const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { connectDB } = require('./config/database');

// Load environment variables FIRST
dotenv.config();

// Ensure DATABASE_URL is always set (required by Prisma)
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:./dev.db';
}

// Connect to database and run migrations
async function initializeDatabase() {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    // Run migrations programmatically
    await prisma.$connect();
    console.log('✅ Database connected');
    
    // Try to query users table to check if it exists
    try {
      await prisma.user.count();
      console.log('✅ Database tables verified');
    } catch (error) {
      if (error.code === 'P2021' || error.message.includes('does not exist')) {
        console.warn('⚠️  Database tables missing. Running migrations...');
        const { execSync } = require('child_process');
        try {
          execSync('npx prisma migrate deploy', { stdio: 'inherit', cwd: __dirname });
          console.log('✅ Migrations completed successfully');
        } catch (migrationError) {
          console.error('❌ Migration failed:', migrationError.message);
          throw migrationError;
        }
      } else {
        throw error;
      }
    }
    
    await prisma.$disconnect();
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    return false;
  }
}

// Connect to database
initializeDatabase().then((success) => {
  if (!success) {
    console.error('Failed to initialize database');
    process.exit(1);
  }
  return connectDB();
}).then(() => {
  console.log('Database initialized');
}).catch((err) => {
  console.error('Failed to connect to database:', err);
  process.exit(1);
});

const app = express();

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = process.env.NODE_ENV === 'production'
      ? [
          process.env.FRONTEND_URL,
          /https:\/\/.*\.vercel\.app$/,
        ]
      : ['http://localhost:5173', 'http://localhost:3000'];

    const isAllowed = allowedOrigins.some((allowed) =>
      allowed instanceof RegExp ? allowed.test(origin) : allowed === origin
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

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'IntelliLearn API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: process.env.NODE_ENV === 'development' 
      ? err.message 
      : 'Something went wrong!',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 Environment: ${process.env.NODE_ENV}`);
  console.log('Server instance created and listening');
});

// Handle server errors
server.on('error', (error) => {
  console.error('Server error:', error);
  process.exit(1);
});

// Keep server running
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
