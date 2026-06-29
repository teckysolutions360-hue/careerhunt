import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  password: {
    type: String,
    select: false
  },
  role: {
    type: String,
    enum: ['admin', 'employer', 'jobseeker'],
    default: 'jobseeker'
  },
  googleId: String,
  avatar: String,
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.model('User', userSchema);