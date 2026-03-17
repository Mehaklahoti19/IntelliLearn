const authService = require('../services/authService');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    console.log('Registration attempt:', { name, email });

    // Check if user already exists
    const userExists = await authService.findUserByEmail(email);
    if (userExists) {
      console.log('User already exists:', email);
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await authService.hashPassword(password);

    // Create user
    const user = await authService.createUser({
      name,
      email,
      password: hashedPassword,
    });
    
    console.log('User created successfully:', user.email);

    // Generate token
    const token = authService.generateToken(user.id);

    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      token,
    });
  } catch (error) {
    console.error('Register error:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await authService.findUserByEmail(email);

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await authService.comparePassword(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = authService.generateToken(user.id);

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await authService.findUserById(req.user.id);
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  register,
  login,
  getMe,
};
