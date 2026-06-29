import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/careerhunt';

if (!process.env.MONGO_URI && !process.env.MONGODB_URI) {
  console.error('MongoDB URI is not configured. Set MONGODB_URI or MONGO_URI in environment variables.');
  process.exit(1);
}

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

export default mongoose.connection;
