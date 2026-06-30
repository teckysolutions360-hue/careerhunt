import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!MONGODB_URI) {
  throw new Error('MongoDB URI is not configured. Set MONGODB_URI or MONGO_URI in environment variables.');
}

const mongooseOptions = {
  bufferCommands: false,
  serverSelectionTimeoutMS: 5000
};

const cached = global.mongoose || (global.mongoose = { conn: null, promise: null });

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, mongooseOptions).then((mongoose) => mongoose);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default mongoose.connection;
