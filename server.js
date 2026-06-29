import mongoose from 'mongoose';
import app from './app.js';

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/careerhunt';

if (!process.env.JWT_SECRET) {
  console.error('Missing required environment variable: JWT_SECRET');
  process.exit(1);
}

if (!MONGODB_URI) {
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});