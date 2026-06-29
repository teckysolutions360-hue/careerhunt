import mongoose from 'mongoose'

const citySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  countryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Country',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

citySchema.index({ name: 1, slug: 1 })

export default mongoose.model('City', citySchema)
