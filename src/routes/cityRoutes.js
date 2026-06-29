import express from 'express'
import City from '../models/City.js'
import Country from '../models/Country.js'

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const cities = await City.find().populate('countryId', 'name slug').sort('name')
    res.json({ success: true, data: cities })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

router.get('/:slug', async (req, res) => {
  try {
    const city = await City.findOne({ slug: req.params.slug }).populate('countryId', 'name slug')
    if (!city) {
      return res.status(404).json({ success: false, message: 'City not found' })
    }
    res.json({ success: true, data: city })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

router.get('/country/:countrySlug', async (req, res) => {
  try {
    const country = await Country.findOne({ slug: req.params.countrySlug })
    if (!country) {
      return res.status(404).json({ success: false, message: 'Country not found' })
    }
    const cities = await City.find({ countryId: country._id }).sort('name')
    res.json({ success: true, data: cities })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

export default router
