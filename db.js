import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!MONGODB_URI) {
  console.warn('MongoDB URI is not configured. Database routes will fail until it is set.');
} else {
  mongoose
    .connect(MONGODB_URI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch((err) => {
      console.error('MongoDB connection error:', err);
    });
}

export default mongoose.connection;
