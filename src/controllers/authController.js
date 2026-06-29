import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export const register = async (req, res) => {
  try {
    const { name, username, email, password, role, avatar } = req.body;

    if (role === 'admin') {
      const existingAdmin = await User.findOne({ role: 'admin' });
      if (existingAdmin) {
        return res.status(400).json({
          success: false,
          message: 'Only one admin account is allowed.'
        });
      }

      if (!username) {
        return res.status(400).json({
          success: false,
          message: 'Admin username is required.'
        });
      }
    }

    // Check if user exists by email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    if (username) {
      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
        return res.status(400).json({
          success: false,
          message: 'Username is already taken'
        });
      }
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: 'Server is not configured correctly: JWT_SECRET is missing.'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      username,
      email,
      password: hashedPassword,
      role: role || 'jobseeker',
      avatar
    });

    // Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const adminStatus = async (req, res) => {
  try {
    const existingAdmin = await User.exists({ role: 'admin' });
    res.json({
      success: true,
      exists: Boolean(existingAdmin)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    // Find user by email or username
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }]
    }).select('+password');
    if (!user || !user.password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const JWT_SECRET = process.env.JWT_SECRET
    if (!JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: 'Server is not configured correctly: JWT_SECRET is missing.'
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const googleAuth = async (req, res) => {
  try {
    const { email, name, avatar } = req.body;
    
    console.log('Google auth request received:', { email, name })
    
    // Validate required fields
    if (!email || !name) {
      console.error('Missing required fields:', { email, name })
      return res.status(400).json({
        success: false,
        message: 'Email and name are required'
      });
    }
    
    // Find or create user
    let user = await User.findOne({ email });
    
    if (!user) {
      console.log('Creating new user from Google auth:', { email, name })
      // Create new user from Google auth
      user = await User.create({
        name,
        email,
        avatar: avatar || null,
        role: 'employer' // Default role for Google sign-up (can be changed)
      });
      console.log('User created successfully:', user._id)
    } else {
      const needsProfileSync = user.name !== name || user.avatar !== (avatar || null) || user.role !== 'employer'
      if (needsProfileSync) {
        user.name = name
        user.avatar = avatar || null
        user.role = user.role || 'employer'
        await user.save()
      }
      console.log('User already exists:', user._id)
    }
    
    // Generate JWT
    const jwtToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    console.log('JWT token generated for user:', user._id)
    
    res.json({
      success: true,
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Google auth error:', error)
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, email, username, avatar, currentPassword, newPassword, confirmPassword } = req.body

    const user = await User.findById(req.user.id).select('+password')
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ email })
      if (existingEmail && existingEmail._id.toString() !== user._id.toString()) {
        return res.status(400).json({
          success: false,
          message: 'Email is already in use.'
        })
      }
      user.email = email
    }

    if (username && username !== user.username) {
      const existingUsername = await User.findOne({ username })
      if (existingUsername && existingUsername._id.toString() !== user._id.toString()) {
        return res.status(400).json({
          success: false,
          message: 'Username is already taken.'
        })
      }
      user.username = username
    }

    if (name) {
      user.name = name
    }

    if (avatar !== undefined) {
      user.avatar = avatar
    }

    if (currentPassword || newPassword || confirmPassword) {
      if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({
          success: false,
          message: 'Please provide current password, new password, and confirmation.'
        })
      }

      if (!user.password) {
        return res.status(400).json({
          success: false,
          message: 'Password change is not available for this account.'
        })
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password)
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect.'
        })
      }

      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message: 'New password and confirmation do not match.'
        })
      }

      user.password = await bcrypt.hash(newPassword, 10)
    }

    await user.save()

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const logout = async (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
};