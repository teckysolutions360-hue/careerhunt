import express from 'express'
import Application from '../models/Application.js'

const router = express.Router()

router.post('/', async (req, res) => {
  try {
    const application = await Application.create(req.body)
    res.status(201).json({ success: true, data: application })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

router.get('/job/:jobId', async (req, res) => {
  try {
    const applications = await Application.find({ jobId: req.params.jobId }).sort('-createdAt')
    res.json({ success: true, data: applications })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

export default router
