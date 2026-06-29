import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import Job from '../models/Job.js';
import Company from '../models/Company.js';
import slugify from 'slugify';
import User from '../models/User.js';

export const resolveEmployerCompanyDetails = (user, jobData = {}) => {
  const fallbackName = user?.name || user?.username || user?.email?.split('@')[0] || 'Employer'
  const companyName = jobData.companyName || fallbackName || 'Default Company'

  return {
    companyName,
    companyWebsite: jobData.companyWebsite,
    companyDescription: jobData.companyDescription || `Company profile for ${companyName}`,
  }
}

export const createJob = async (req, res) => {
  try {
    const jobData = { ...req.body };
    
    // Generate slug
    const slug = slugify(jobData.title, { lower: true, strict: true }) + '-' + Date.now();
    jobData.slug = slug;
    
    const { companyName, companyWebsite, companyDescription } = resolveEmployerCompanyDetails(req.user, jobData);

    // Set company based on user role
    if (req.user.role === 'employer') {
      let employerCompany = null;

      if (req.user.companyId) {
        employerCompany = await Company.findById(req.user.companyId);
      }

      if (!employerCompany) {
        if (req.user && req.user.companyId) {
          // The stored companyId references a missing company; clear it before recreating.
          req.user.companyId = undefined;
        }

        employerCompany = await Company.create({
          name: companyName,
          slug: `${slugify(companyName, { lower: true, strict: true })}-${Date.now()}`,
          website: companyWebsite,
          description: companyDescription
        });

        try {
          await User.findByIdAndUpdate(req.user.id, { companyId: employerCompany._id });
          req.user.companyId = employerCompany._id;
        } catch (err) {
          console.error('Failed to assign companyId to user:', err);
        }
      }

      jobData.companyId = employerCompany._id;
      jobData.createdBy = req.user.id;
    } else if (req.user.role === 'admin') {
      // For admins, use provided companyId when valid, otherwise fall back to a system admin company.
      if (!jobData.companyId || !mongoose.Types.ObjectId.isValid(jobData.companyId)) {
        let adminCompany = await Company.findOne({ name: 'System Admin Company' });
        if (!adminCompany) {
          adminCompany = await Company.create({
            name: 'System Admin Company',
            slug: 'system-admin-company',
            description: 'Company for jobs posted by administrators'
          });
        }
        jobData.companyId = adminCompany._id;
      }
      jobData.createdBy = req.user.id;
    }
    
    // Validate companyId is set
    if (!jobData.companyId) {
      return res.status(400).json({
        success: false,
        message: 'Company ID is required to create a job'
      });
    }
    
    if (!jobData.city && jobData.cityName) {
      jobData.city = jobData.cityName;
      delete jobData.cityName;
    }
    if (!jobData.country) jobData.country = 'Not Specified';
    if (!jobData.category) jobData.category = 'General';

    const job = new Job(jobData);
    await job.save();
    
    res.status(201).json({
      success: true,
      data: job
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getJobs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      keyword,
      country,
      city,
      company,
      createdBy,
      category,
      employmentType,
      workMode,
      experienceLevel,
      salaryMin,
      salaryMax,
      sort = '-postedDate'
    } = req.query;

    const query = { status: 'active' };
    
    // Search by keyword
    if (keyword) {
      query.$text = { $search: keyword };
    }
    
    // Filters
    if (country) query.country = country;
    if (city) query.city = city;
    if (company) {
      if (company === 'null' || company === 'undefined' || !mongoose.Types.ObjectId.isValid(company)) {
        // Invalid company filter should never return all jobs.
        return res.json({
          success: true,
          data: [],
          pagination: {
            page: 1,
            limit: 0,
            total: 0,
            pages: 0
          }
        });
      }
      query.companyId = company;
    }

    if (req.user && req.user.role === 'employer') {
      // Employers should only be able to query their own job posts from the dashboard.
      query.createdBy = req.user.id;
    } else if (createdBy && mongoose.Types.ObjectId.isValid(createdBy)) {
      query.createdBy = createdBy;
    }

    if (category) query.category = category;
    if (employmentType) query.employmentType = employmentType;
    if (workMode) query.workMode = workMode;
    if (experienceLevel) query.experienceLevel = experienceLevel;
    if (salaryMin) query.salaryMin = { $gte: parseInt(salaryMin) };
    if (salaryMax) query.salaryMax = { $lte: parseInt(salaryMax) };
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const jobs = await Job.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('companyId', 'name logo')
      .populate('createdBy', 'name username avatar email role');
    
    const total = await Job.countDocuments(query);
    
    res.json({
      success: true,
      data: jobs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getJobBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    
    const job = await Job.findOne({ slug, status: 'active' })
      .populate('companyId', 'name logo website description')
      .populate('createdBy', 'name username avatar email role');
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }
    // NOTE: view counting is handled via dedicated endpoint to avoid double-counting
    
    // Get similar jobs
    const similarJobs = await Job.find({
      category: job.category,
      _id: { $ne: job._id },
      status: 'active'
    })
      .limit(5)
      .populate('companyId', 'name logo');
    
    res.json({
      success: true,
      data: job,
      similarJobs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const incrementJobView = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, message: 'Job id required' });
    }

    const updated = await Job.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    ).select('views');

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    res.json({ success: true, data: { views: updated.views } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { companyWebsite, companyName, ...updates } = req.body;
    
    if (companyWebsite !== undefined) {
      updates.companyWebsite = companyWebsite;
    }

    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }
    
    // Update linked company details when provided.
    if (job.companyId && (companyWebsite !== undefined || companyName !== undefined)) {
      const companyUpdates = {};
      if (companyWebsite !== undefined) companyUpdates.website = companyWebsite;
      if (companyName !== undefined) {
        companyUpdates.name = companyName;
        companyUpdates.slug = `${slugify(companyName, { lower: true, strict: true })}-${Date.now()}`;
      }
      if (Object.keys(companyUpdates).length > 0) {
        try {
          await Company.findByIdAndUpdate(job.companyId, companyUpdates, {
            new: true,
            runValidators: true
          });
        } catch (companyErr) {
          if (companyErr.code === 11000) {
            return res.status(400).json({
              success: false,
              message: 'Company name already exists. Please choose a different name.'
            });
          }
          throw companyErr;
        }
      }
    }

    // Check permissions
    if (req.user.role === 'employer') {
      const isOwner = job.createdBy && job.createdBy.toString() === req.user.id.toString();
      const isCompanyMatch = req.user.companyId && job.companyId && job.companyId.toString() === req.user.companyId.toString();

      if (!isOwner && !isCompanyMatch) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this job'
        });
      }
      // Prevent employer from changing the company association.
      delete updates.companyId;
    } else if (req.user.role === 'admin') {
      // Admins can update jobs but prevent unauthorized company changes.
      delete updates.companyId;
    }
    
    // Filter out undefined values to prevent validation errors
    const cleanedUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );
    
    const updatedJob = await Job.findByIdAndUpdate(
      id,
      cleanedUpdates,
      { new: true, runValidators: true }
    );
    
    if (!updatedJob) {
      return res.status(404).json({
        success: false,
        message: 'Failed to update job'
      });
    }
    
    res.json({
      success: true,
      data: updatedJob
    });
  } catch (error) {
    console.error('updateJob error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.toString() : undefined
    });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    
    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }
    
    // Check permissions
    if (req.user.role === 'employer') {
      const isOwner = job.createdBy && job.createdBy.toString() === req.user.id.toString();
      const isCompanyMatch = req.user.companyId && job.companyId && job.companyId.toString() === req.user.companyId.toString();

      if (!isOwner && !isCompanyMatch) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to delete this job'
        });
      }
    }
    // Admins can delete any job
    
    await job.deleteOne();
    
    res.json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getFeaturedJobs = async (req, res) => {
  try {
    const { limit = 6 } = req.query;
    
    const jobs = await Job.find({ 
      status: 'active',
      isFeatured: true 
    })
      .sort('-postedDate')
      .limit(parseInt(limit))
      .populate('companyId', 'name logo')
      .populate('createdBy', 'name username avatar email role isActive createdAt');
    
    res.json({
      success: true,
      data: jobs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getTopJobs = async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    const jobs = await Job.find({ status: 'active' })
      .sort('-views')
      .limit(parseInt(limit))
      .populate('companyId', 'name logo')
      .populate('createdBy', 'name username avatar email role');

    res.json({
      success: true,
      data: jobs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};