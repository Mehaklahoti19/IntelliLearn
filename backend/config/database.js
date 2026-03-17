const { PrismaClient } = require('@prisma/client');

// Singleton — created lazily so DATABASE_URL is set first
let prisma;

const getPrisma = () => {
  if (!prisma) {
    prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });
  }
  return prisma;
};

// Proxy so existing code using `prisma.user.xxx` still works
const prismaProxy = new Proxy({}, {
  get(_, prop) {
    return getPrisma()[prop];
  },
});

const connectDB = async () => {
  try {
    await getPrisma().$connect();
    console.log('✅ SQLite Database Connected');
    process.on('SIGINT', async () => { await getPrisma().$disconnect(); process.exit(0); });
    process.on('SIGTERM', async () => { await getPrisma().$disconnect(); process.exit(0); });
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    process.exit(1);
  }
};

module.exports = { prisma: prismaProxy, connectDB, getPrisma };
