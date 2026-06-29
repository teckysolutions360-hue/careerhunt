import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import authRoutes from './src/routes/authRoutes.js';
import jobRoutes from './src/routes/jobRoutes.js';
import categoryRoutes from './src/routes/categoryRoutes.js';
import countryRoutes from './src/routes/countryRoutes.js';
import cityRoutes from './src/routes/cityRoutes.js';
import companyRoutes from './src/routes/companyRoutes.js';
import applicationRoutes from './src/routes/applicationRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';
import blogRoutes from './src/routes/blogRoutes.js';
import salaryGuideRoutes from './src/routes/salaryGuideRoutes.js';
import uploadRoutes from './src/routes/uploadRoutes.js';

dotenv.config();

if (!process.env.JWT_SECRET) {
  console.error('Missing required environment variable: JWT_SECRET')
  process.exit(1)
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(compression());
const corsOptions = {
  credentials: true
}

// Allow dynamic localhost origins during development so multiple dev ports work
if (process.env.NODE_ENV === 'production') {
  corsOptions.origin = [
    process.env.FRONTEND_URL,
    'https://careerhunt.onlie'
  ].filter(Boolean)
} else {
  corsOptions.origin = (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl) or any localhost origin for dev
    if (!origin) return callback(null, true)
    if (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) return callback(null, true)
    // Fallback to allow explicit FRONTEND_URL if set
    if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) return callback(null, true)
    return callback(new Error('Not allowed by CORS'))
  }
}

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting (disabled for development)
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 100
// });
// app.use('/api', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes); // Support legacy or direct auth requests without /api prefix
app.use('/api/jobs', jobRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/countries', countryRoutes);
app.use('/api/cities', cityRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/salary-guide', salaryGuideRoutes);
app.use('/api/uploads', uploadRoutes);

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/careerhunt';

if (!MONGODB_URI) {
  console.error('MongoDB URI is not configured. Set MONGODB_URI or MONGO_URI in server/.env or environment variables.');
  process.exit(1);
}

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});