import express from 'express'

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    res.json({
      success: true,
      data: [
        {
          id: 'sample-blog-1',
          title: 'How to land your next tech role',
          excerpt: 'Insights for job seekers and employers from the modern job board ecosystem.',
          slug: 'how-to-land-your-next-tech-role'
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
        id: req.params.slug,
        title: 'Featured blog post',
        content: 'Content coming soon for blog article ' + req.params.slug
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

export default router
