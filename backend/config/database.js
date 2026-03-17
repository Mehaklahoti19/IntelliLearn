const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Connect to database
const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('SQLite Database Connected');
    
    // Keep connection open
    process.on('SIGINT', async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
    process.on('SIGTERM', async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = { prisma, connectDB };
