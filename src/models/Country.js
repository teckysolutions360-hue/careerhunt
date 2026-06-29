import mongoose from 'mongoose'

const countrySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  code: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
})

export default mongoose.model('Country', countrySchema)
