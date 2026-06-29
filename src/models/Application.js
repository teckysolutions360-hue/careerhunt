import mongoose from 'mongoose'

const applicationSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: String,
  resumeUrl: String,
  message: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
})

export default mongoose.model('Application', applicationSchema)
