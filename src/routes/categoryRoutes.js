import express from 'express'
import Category from '../models/Category.js'

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort('name')
    res.json({ success: true, data: categories })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

router.get('/:slug', async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug })
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' })
    }
    res.json({ success: true, data: category })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

export default router
