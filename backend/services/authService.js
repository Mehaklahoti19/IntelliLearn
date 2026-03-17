const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { prisma } = require('../config/database');

class AuthService {
  // Hash password
  async hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  // Compare password
  async comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  // Generate JWT token
  generateToken(userId) {
    const secret = process.env.JWT_SECRET || 'intellilearn-fallback-secret-key-2024';
    return jwt.sign({ id: userId }, secret, { expiresIn: '30d' });
  }

  // Verify JWT token
  verifyToken(token) {
    try {
      const secret = process.env.JWT_SECRET || 'intellilearn-fallback-secret-key-2024';
      return jwt.verify(token, secret);
    } catch (error) {
      return null;
    }
  }

  // Find user by email
  async findUserByEmail(email) {
    return await prisma.user.findUnique({
      where: { email },
    });
  }

  // Find user by ID
  async findUserById(id) {
    return await prisma.user.findUnique({
      where: { id },
      include: {
        enrolledCourses: {
          include: { course: true },
          orderBy: { lastAccessedAt: 'desc' },
        },
        bookmarkedCourses: {
          include: { course: true },
        },
        completedQuizzes: {
          orderBy: { completedAt: 'desc' },
          take: 10,
        },
      },
    });
  }

  // Create user
  async createUser(data) {
    return await prisma.user.create({
      data,
    });
  }
}

module.exports = new AuthService();
