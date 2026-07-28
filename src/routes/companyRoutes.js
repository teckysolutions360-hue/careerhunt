import express from 'express'
import Company from '../models/Company.js'
import Job from '../models/job.js'

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const companies = await Company.find().sort('name')
    const companiesWithJobCount = await Promise.all(
      companies.map(async (company) => {
        const jobCount = await Job.countDocuments({ companyId: company._id, status: 'active' })
        return {
          ...company.toObject(),
          jobCount,
        }
      })
    )

    res.json({ success: true, data: companiesWithJobCount })
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
