import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
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
import './db.js';

if (!process.env.JWT_SECRET) {
  console.warn('Missing required environment variable: JWT_SECRET');
  console.warn('Auth routes may fail without JWT_SECRET configured.');
}

const app = express();

// Middleware
app.use(helmet());
app.use(compression());
const corsOptions = {
  credentials: true,
};

if (process.env.NODE_ENV === 'production') {
  corsOptions.origin = [
    process.env.FRONTEND_URL,
    'https://careerhunt.online',
    'https://www.careerhunt.online',
    'https://careerhunt.onlie',
  ].filter(Boolean);
} else {
  corsOptions.origin = (origin, callback) => {
    if (!origin) return callback(null, true);
    if (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) return callback(null, true);
    if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  };
}

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);
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

app.get('/', (req, res) => {
  res.send('CareerHunt API server is running.');
});

export default app;
