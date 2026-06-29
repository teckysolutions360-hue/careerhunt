import express from 'express'
import Country from '../models/Country.js'

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const countries = await Country.find().sort('name')
    res.json({ success: true, data: countries })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

router.get('/:slug', async (req, res) => {
  try {
    const country = await Country.findOne({ slug: req.params.slug })
    if (!country) {
      return res.status(404).json({ success: false, message: 'Country not found' })
    }
    res.json({ success: true, data: country })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

export default router
