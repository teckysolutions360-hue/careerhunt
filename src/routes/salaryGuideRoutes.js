import express from 'express'

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    res.json({
      success: true,
      data: [
        {
          title: 'Next-Gen Salary Guide 2026',
          slug: 'next-gen-salary-guide-2026',
          excerpt: 'Explore salary ranges by role, experience, and location for modern hiring markets.'
        }
      ]
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

router.get('/:slug', async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        title: 'Salary Guide: ' + req.params.slug,
        content: 'Salary guide content is not yet published. Check back later.'
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

export default router
