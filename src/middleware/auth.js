import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token missing'
    })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id).select('-password')
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, user not found'
      })
    }

    req.user = user
    next()
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Not authorized, token invalid'
    })
  }
}

export const optionalProtect = async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return next()
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id).select('-password')
    if (user) {
      req.user = user
    }
  } catch (error) {
    // Ignore invalid token for optional authentication
  }

  next()
}

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: insufficient permissions'
      })
    }

    next()
  }
}
