import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import Job from '../models/job.js';
import Company from '../models/Company.js';
import slugify from 'slugify';
import User from '../models/User.js';

export const normalizeCompanyId = (companyId) => {
  if (!companyId) return null;
  if (typeof companyId === 'object' && companyId?.toString) {
    const normalized = companyId.toString();
    return mongoose.Types.ObjectId.isValid(normalized) ? normalized : null;
  }
  if (typeof companyId !== 'string') return null;
  const trimmed = companyId.trim();
  return mongoose.Types.ObjectId.isValid(trimmed) ? trimmed : null;
};

export const resolveEmployerCompanyDetails = (user, jobData = {}) => {
  const fallbackName = user?.name || user?.username || user?.email?.split('@')[0] || 'Employer'
  const companyName = jobData.companyName || fallbackName || 'Default Company'

  return {
    companyName,
    companyWebsite: jobData.companyWebsite,
    companyDescription: jobData.companyDescription || `Company profile for ${companyName}`,
  }
}

const normalizeEmploymentTypeValue = (value) => {
  const raw = String(value || '').trim().toUpperCase();
  const map = {
    FULL_TIME: 'full-time',
    PART_TIME: 'part-time',
    CONTRACTOR: 'contract',
    TEMPORARY: 'temporary',
    INTERN: 'internship',
    VOLUNTEER: 'volunteer',
    PER_DIEM: 'per-diem',
    OTHER: 'other',
  };

  return map[raw] || raw.toLowerCase().replace(/[_\s]+/g, '-');
};

const normalizeWorkModeValue = (value) => {
  const raw = String(value || '').trim().toLowerCase();
  if (['remote', 'telecommute', 'work-from-home'].includes(raw)) return 'remote';
  if (['onsite', 'on-site', 'on site'].includes(raw)) return 'onsite';
  if (['hybrid', 'mixed'].includes(raw)) return 'hybrid';
  if (!raw) return 'not-specified';
  return raw;
};

const normalizeSalaryPeriodValue = (value) => {
  const raw = String(value || '').trim().toUpperCase();
  const map = {
    HOUR: 'hour',
    DAY: 'day',
    WEEK: 'week',
    MONTH: 'month',
    YEAR: 'year',
  };

  return map[raw] || 'year';
};

const normalizeExperienceLevelValue = (value) => {
  const raw = String(value || '').trim().toLowerCase();
  if (['entry-level', 'entry level'].includes(raw)) return 'entry';
  if (['junior'].includes(raw)) return 'junior';
  if (['mid-level', 'mid level'].includes(raw)) return 'mid';
  if (['senior'].includes(raw)) return 'senior';
  if (['manager'].includes(raw)) return 'lead';
  if (['director'].includes(raw)) return 'executive';
  if (['not-specified', 'not specified', 'n/a'].includes(raw)) return undefined;
  return raw;
};

const normalizeEducationLevelValue = (value) => {
  const raw = String(value || '').trim().toLowerCase();
  if (['high school', 'high-school'].includes(raw)) return 'high-school';
  if (['diploma'].includes(raw)) return 'diploma';
  if (['associate degree', 'associate-degree'].includes(raw)) return 'associate-degree';
  if (["bachelor's degree", "bachelors degree", 'bachelors', 'bachelor degree'].includes(raw)) return 'bachelors';
  if (["master's degree", "masters degree", 'masters'].includes(raw)) return 'masters';
  if (['doctorate', "doctor's degree", 'phd'].includes(raw)) return 'doctorate';
  if (['professional certification', 'certification'].includes(raw)) return 'professional-certification';
  if (['not specified', 'not-specified', 'n/a'].includes(raw)) return 'not-specified';
  return raw;
};

export const normalizeJobPayload = (jobData = {}, user = {}, companyDetails = {}) => {
  const normalized = { ...jobData };
  const resolvedCompanyDetails = {
    companyName: companyDetails.companyName || jobData.companyName || user?.name || user?.username || user?.email?.split('@')[0] || 'Default Company',
    companyWebsite: companyDetails.companyWebsite || jobData.companyWebsite,
    companyDescription: companyDetails.companyDescription || jobData.companyDescription || `Company profile for ${companyDetails.companyName || jobData.companyName || user?.name || user?.username || user?.email?.split('@')[0] || 'Default Company'}`,
  };

  if (resolvedCompanyDetails.companyName) {
    normalized.companyName = resolvedCompanyDetails.companyName;
  }

  if (resolvedCompanyDetails.companyWebsite) {
    normalized.companyWebsite = resolvedCompanyDetails.companyWebsite;
  }

  if (resolvedCompanyDetails.companyDescription) {
    normalized.companyDescription = resolvedCompanyDetails.companyDescription;
  }

  if (!normalized.companySlug && normalized.companyName) {
    normalized.companySlug = slugify(normalized.companyName, { lower: true, strict: true });
  }

  if (!normalized.category) normalized.category = 'General';
  if (!normalized.salaryCurrency) normalized.salaryCurrency = 'USD';
  if (!normalized.salaryPeriod) normalized.salaryPeriod = 'year';
  if (!normalized.applicationMethod) normalized.applicationMethod = 'company-website';
  if (normalized.whatsappNumber === undefined) normalized.whatsappNumber = '';
  if (!normalized.vacancies) normalized.vacancies = 1;
  if (!normalized.workMode) normalized.workMode = 'not-specified';
  if (!normalized.employmentType) normalized.employmentType = 'full-time';
  if (!normalized.experienceLevel) normalized.experienceLevel = 'mid';
  if (!normalized.educationLevel) normalized.educationLevel = 'bachelors';
  if (!normalized.description && normalized.summary) normalized.description = normalized.summary;
  if (!normalized.summary && normalized.description) normalized.summary = normalized.description;
  if (typeof normalized.responsibilities === 'string') {
    normalized.responsibilities = normalized.responsibilities.split('\n').map((item) => item.trim()).filter(Boolean);
  }
  if (typeof normalized.requirements === 'string') {
    normalized.requirements = normalized.requirements.split('\n').map((item) => item.trim()).filter(Boolean);
  }
  if (typeof normalized.preferredQualifications === 'string') {
    normalized.preferredQualifications = normalized.preferredQualifications.split('\n').map((item) => item.trim()).filter(Boolean);
  }
  if (typeof normalized.benefits === 'string') {
    normalized.benefits = normalized.benefits.split('\n').map((item) => item.trim()).filter(Boolean);
  }
  if (typeof normalized.requiredSkills === 'string') {
    normalized.requiredSkills = normalized.requiredSkills.split(/[\n,]+/).map((item) => item.trim()).filter(Boolean);
  }
  if (typeof normalized.skills === 'string') {
    normalized.skills = normalized.skills.split(/[\n,]+/).map((item) => item.trim()).filter(Boolean);
  }
  if (typeof normalized.keywords === 'string') {
    normalized.keywords = normalized.keywords.split(',').map((item) => item.trim()).filter(Boolean);
  }
  if (typeof normalized.tags === 'string') {
    normalized.tags = normalized.tags.split(',').map((item) => item.trim()).filter(Boolean);
  }

  normalized.employmentType = normalizeEmploymentTypeValue(normalized.employmentType);
  normalized.workMode = normalizeWorkModeValue(normalized.workMode);
  normalized.salaryPeriod = normalizeSalaryPeriodValue(normalized.salaryPeriod);
  normalized.experienceLevel = normalizeExperienceLevelValue(normalized.experienceLevel) || normalized.experienceLevel;
  normalized.educationLevel = normalizeEducationLevelValue(normalized.educationLevel) || normalized.educationLevel;

  if (normalized.marketContext !== undefined) {
    normalized.marketContext = typeof normalized.marketContext === 'string' ? normalized.marketContext.trim() : '';
  }

  if (normalized.featured !== undefined) normalized.isFeatured = Boolean(normalized.featured);
  if (normalized.urgent !== undefined) normalized.isUrgent = Boolean(normalized.urgent);
  if (normalized.jobStatus) normalized.status = normalized.jobStatus;
  if (!normalized.jobStatus && normalized.status) normalized.jobStatus = normalized.status;
  if (!normalized.validThrough && normalized.applicationDeadline) {
    normalized.validThrough = normalized.applicationDeadline;
  }

  if (normalized.applicationDeadline) {
    normalized.applicationDeadline = new Date(normalized.applicationDeadline);
  }
  if (normalized.validThrough) {
    normalized.validThrough = new Date(normalized.validThrough);
  }
  if (normalized.postedDate) {
    normalized.postedDate = new Date(normalized.postedDate);
  }
  if (normalized.expiryDate) {
    normalized.expiryDate = new Date(normalized.expiryDate);
  }
  if (normalized.sourceDate) {
    normalized.sourceDate = new Date(normalized.sourceDate);
  }
  if (normalized.lastVerifiedAt) {
    normalized.lastVerifiedAt = new Date(normalized.lastVerifiedAt);
  }

  return normalized;
}

export const scoreRelatedJob = (sourceJob = {}, candidateJob = {}) => {
  const sourceCategory = String(sourceJob.category || '').trim().toLowerCase();
  const candidateCategory = String(candidateJob.category || '').trim().toLowerCase();
  const sourceCity = String(sourceJob.city || '').trim().toLowerCase();
  const candidateCity = String(candidateJob.city || '').trim().toLowerCase();
  const sourceCountry = String(sourceJob.country || '').trim().toLowerCase();
  const candidateCountry = String(candidateJob.country || '').trim().toLowerCase();
  const sourceSkills = Array.isArray(sourceJob.requiredSkills) ? sourceJob.requiredSkills : [];
  const candidateSkills = Array.isArray(candidateJob.requiredSkills) ? candidateJob.requiredSkills : [];
  const sourceExperience = String(sourceJob.experienceLevel || '').trim().toLowerCase();
  const candidateExperience = String(candidateJob.experienceLevel || '').trim().toLowerCase();
  const sourceCompanyId = String(sourceJob.companyId || '').trim();
  const candidateCompanyId = String(candidateJob.companyId || '').trim();

  let score = 0;

  if (sourceCategory && candidateCategory && sourceCategory === candidateCategory) score += 30;
  if (sourceCity && candidateCity && sourceCity === candidateCity) score += 22;
  if (sourceCountry && candidateCountry && sourceCountry === candidateCountry) score += 12;

  const overlap = sourceSkills.filter((skill) => {
    const normalizedSkill = String(skill || '').trim().toLowerCase();
    return normalizedSkill && candidateSkills.some((candidateSkill) => String(candidateSkill || '').trim().toLowerCase() === normalizedSkill);
  }).length;
  score += overlap * 12;

  if (sourceExperience && candidateExperience && sourceExperience === candidateExperience) score += 8;
  if (sourceCompanyId && candidateCompanyId && sourceCompanyId === candidateCompanyId) score += 6;

  return score;
};

export const createJob = async (req, res) => {
  try {
    const jobData = { ...req.body };
    
    // Generate slug
    const slug = slugify(jobData.title, { lower: true, strict: true }) + '-' + Date.now();
    jobData.slug = slug;
    
    const { companyName, companyWebsite, companyDescription } = resolveEmployerCompanyDetails(req.user, jobData);
    const normalizedUserCompanyId = normalizeCompanyId(req.user?.companyId);
    const providedCompanyId = normalizeCompanyId(jobData.companyId);
    const explicitCompanyName = typeof req.body.companyName === 'string' && req.body.companyName.trim() !== '';
    const normalizedJobData = normalizeJobPayload(jobData, req.user, { companyName, companyWebsite, companyDescription });
    Object.assign(jobData, normalizedJobData);

    if (companyName) {
      jobData.companyName = companyName;
    }

    // Set company based on user role
    if (req.user.role === 'employer') {
      // If the employer explicitly provided a company name for this job, create a new
      // per-job Company record and DO NOT attach it to the employer user's companyId.
      if (explicitCompanyName) {
        const perJobCompany = await Company.create({
          name: companyName,
          slug: `${slugify(companyName, { lower: true, strict: true })}-${Date.now()}`,
          website: companyWebsite,
          description: companyDescription
        });

        jobData.companyId = perJobCompany._id;
        jobData.createdBy = req.user.id;
      } else {
        let employerCompany = null;

        if (normalizedUserCompanyId) {
          employerCompany = await Company.findById(normalizedUserCompanyId);
        }

        if (!employerCompany) {
          if (req.user && normalizedUserCompanyId) {
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
      }
    } else if (req.user.role === 'admin') {
      // For admins, use a valid provided companyId when present; otherwise fall back to a system admin company.
      if (providedCompanyId) {
        jobData.companyId = providedCompanyId;
      } else {
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

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

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

    const normalizeQueryValue = (value) => Array.isArray(value) ? value[0] : value || '';
    const normalizeFilterValue = (value) => normalizeQueryValue(value).trim().replace(/\s+/g, ' ');
    const normalizedCountry = normalizeFilterValue(country);
    const normalizedCity = normalizeFilterValue(city);

    const query = { status: 'active' };
    
    // Search by keyword
    if (normalizeQueryValue(keyword)) {
      query.$text = { $search: normalizeQueryValue(keyword) };
    }
    
    // Filters
    if (normalizedCountry) {
      const countryValue = normalizedCountry.toLowerCase();
      const countryAliases = ['uae', 'united arab emirates', 'united arab emirates (uae)'];

      if (countryAliases.includes(countryValue)) {
        query.country = { $in: [/uae/i, /united arab emirates/i, /united arab emirates \(uae\)/i] };
      } else {
        query.country = { $regex: escapeRegExp(normalizedCountry), $options: 'i' };
      }
    }

    if (normalizedCity) {
      query.city = {
        $regex: escapeRegExp(normalizedCity),
        $options: 'i'
      };
    }

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

    const relatedJobs = await Job.find({
      _id: { $ne: job._id },
      status: 'active'
    })
      .populate('companyId', 'name logo website description')
      .limit(25)
      .lean();

    const scoredJobs = relatedJobs
      .map((candidate) => ({
        ...candidate,
        score: scoreRelatedJob(job.toObject ? job.toObject() : job, candidate)
      }))
      .filter((candidate) => candidate.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map(({ score, ...candidate }) => candidate);

    res.json({
      success: true,
      data: job,
      relatedJobs: scoredJobs.length ? scoredJobs : relatedJobs.slice(0, 6)
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

    if (companyName !== undefined) {
      updates.companyName = companyName;
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