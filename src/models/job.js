import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    index: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  companyWebsite: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  category: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  city: {
    type: String
  },
  location: String,
  employmentType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'internship', 'freelance'],
    required: true
  },
  workMode: {
    type: String,
    enum: ['remote', 'onsite', 'hybrid'],
    required: true
  },
  salaryMin: Number,
  salaryMax: Number,
  salaryCurrency: {
    type: String,
    default: 'USD'
  },
  description: String,
  summary: String,
  responsibilities: [String],
  requirements: [String],
  preferredQualifications: [String],
  requiredSkills: [String],
  benefits: [String],
  experienceLevel: {
    type: String,
    enum: ['entry', 'junior', 'mid', 'senior', 'lead', 'executive']
  },
  educationLevel: {
    type: String,
    enum: ['high-school', 'bachelors', 'masters', 'phd']
  },
  vacancies: {
    type: Number,
    default: 1
  },
  applicationEmail: String,
  applicationUrl: String,
  applicationDeadline: Date,
  companyDescription: String,
  keywords: [String],
  tags: [String],
  isFeatured: {
    type: Boolean,
    default: false
  },
  isUrgent: {
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
  status: {
    type: String,
    enum: ['active', 'inactive', 'expired'],
    default: 'active'
  },
  slug: {
    type: String,
    unique: true,
    required: true
  },
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