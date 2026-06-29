import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  slug: {
    type: String,
    unique: true,
    required: true
  },
  website: String,
  logo: String,
  description: String,
  industry: String,
  size: String,
  foundedYear: Number,
  locations: [{
    country: String,
    city: String
  }],
  socialMedia: {
    linkedin: String,
    twitter: String,
    facebook: String
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  reviews: [{
    user: String,
    rating: Number,
    comment: String,
    date: Date
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.model('Company', companySchema);