import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    index: true
  },
  slug: {
    type: String,
    unique: true,
    required: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  companyName: {
    type: String,
    trim: true,
    default: ''
  },
  companySlug: String,
  companyWebsite: String,
  companyLogo: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  category: {
    type: String,
    required: true
  },
  subcategory: String,
  country: {
    type: String,
    required: true
  },
  state: String,
  city: {
    type: String
  },
  address: String,
  location: String,
  employmentType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'internship', 'freelance', 'temporary'],
    required: true
  },
  workMode: {
    type: String,
    enum: ['remote', 'onsite', 'hybrid', 'not-specified'],
    default: 'not-specified'
  },
  salaryMin: Number,
  salaryMax: Number,
  salaryCurrency: {
    type: String,
    default: 'USD'
  },
  salaryPeriod: {
    type: String,
    enum: ['hour', 'day', 'week', 'month', 'year'],
    default: 'year'
  },
  experienceLevel: {
    type: String,
    enum: ['entry', 'junior', 'mid', 'senior', 'lead', 'executive']
  },
  experienceMin: Number,
  educationLevel: {
    type: String,
    enum: ['high-school', 'bachelors', 'masters', 'phd']
  },
  skills: [String],
  requiredSkills: [String],
  responsibilities: [String],
  requirements: [String],
  preferredQualifications: [String],
  qualifications: [String],
  benefits: [String],
  vacancies: {
    type: Number,
    default: 1
  },
  applicationUrl: String,
  applicationEmail: String,
  whatsappNumber: String,
  applicationDeadline: Date,
  validThrough: Date,
  sourceName: String,
  sourceUrl: String,
  sourceDate: Date,
  lastVerifiedAt: Date,
  jobStatus: {
    type: String,
    enum: ['active', 'expired', 'filled', 'paused', 'removed', 'inactive'],
    default: 'active'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'expired', 'filled', 'paused', 'removed'],
    default: 'active'
  },
  description: String,
  summary: String,
  companyDescription: String,
  marketContext: String,
  keywords: [String],
  tags: [String],
  isFeatured: {
    type: Boolean,
    default: false
  },
  featured: {
    type: Boolean,
    default: false
  },
  isUrgent: {
    type: Boolean,
    default: false
  },
  urgent: {
    type: Boolean,
    default: false
  },
  postedDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: Date,
  views: {
    type: Number,
    default: 0
  },
  applications: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application'
  }],
  metaTitle: String,
  metaDescription: String,
  canonicalUrl: String
}, {
  timestamps: true
});

// Indexes for better performance
jobSchema.index({ title: 'text', description: 'text', requirements: 'text' });
jobSchema.index({ country: 1, city: 1 });
jobSchema.index({ category: 1 });
jobSchema.index({ postedDate: -1 });
jobSchema.index({ isFeatured: -1 });

export default mongoose.model('Job', jobSchema);