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
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });
  }

  // Verify JWT token
  verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
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
