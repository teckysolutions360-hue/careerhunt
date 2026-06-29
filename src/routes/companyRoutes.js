import express from 'express'
import Company from '../models/Company.js'

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const companies = await Company.find().sort('name')
    res.json({ success: true, data: companies })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

router.get('/:slug', async (req, res) => {
  try {
    const company = await Company.findOne({ slug: req.params.slug })
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' })
    }
    res.json({ success: true, data: company })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

export default router
