import express from 'express'
import { protect, authorize } from '../middleware/auth.js'
import Job from '../models/job.js'
import User from '../models/User.js'
import Company from '../models/Company.js'
import Category from '../models/Category.js'
import Country from '../models/Country.js'
import City from '../models/City.js'

const router = express.Router()

router.use(protect, authorize('admin'))

router.get('/analytics', async (req, res) => {
  try {
    const totalJobs = await Job.countDocuments()
    const totalUsers = await User.countDocuments()
    const totalEmployers = await User.countDocuments({ role: 'employer' })
    const featuredJobs = await Job.countDocuments({ isFeatured: true })
    const pendingJobs = await Job.countDocuments({ status: 'inactive' })

    res.json({
      success: true,
      data: { totalJobs, totalUsers, totalEmployers, featuredJobs, pendingJobs }
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

router.delete('/jobs/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' })
    }
    await job.deleteOne()
    res.json({ success: true, message: 'Job deleted' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort('-createdAt')
    res.json({ success: true, data: users })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }
    await user.deleteOne()
    res.json({ success: true, message: 'User deleted' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

router.post('/settings', async (req, res) => {
  try {
    res.json({ success: true, message: 'Settings endpoint is ready.' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

export default router
