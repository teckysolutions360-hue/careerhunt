import { v2 as cloudinary } from 'cloudinary'
import streamifier from 'streamifier'

export const uploadImage = (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ success: false, message: 'No file uploaded' })
    }

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    })

    const folder = process.env.CLOUDINARY_UPLOAD_FOLDER || 'careerhunt'

    const uploadStream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
      if (error) {
        console.error('Cloudinary upload error (server):', error)
        return res.status(500).json({ success: false, error: error.message || error })
      }
      return res.json({ success: true, secure_url: result.secure_url, public_id: result.public_id })
    })

    streamifier.createReadStream(req.file.buffer).pipe(uploadStream)
  } catch (err) {
    console.error('Upload controller error:', err)
    return res.status(500).json({ success: false, error: err.message || err })
  }
}
