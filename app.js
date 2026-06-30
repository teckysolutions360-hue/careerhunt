import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import authRoutes from './src/routes/authRoutes.js';
import blogRoutes from './src/routes/blogRoutes.js';
import categoryRoutes from './src/routes/categoryRoutes.js';
import cityRoutes from './src/routes/cityRoutes.js';
import companyRoutes from './src/routes/companyRoutes.js';
import countryRoutes from './src/routes/countryRoutes.js';
import jobRoutes from './src/routes/jobRoutes.js';
import salaryGuideRoutes from './src/routes/salaryGuideRoutes.js';
import uploadRoutes from './src/routes/uploadRoutes.js';
import applicationRoutes from './src/routes/applicationRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';

const app = express();

app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression());

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'CareerHunt API Running'
  });
});

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cities', cityRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/countries', countryRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/salary-guides', salaryGuideRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/admin', adminRoutes);

app.use('/api', (req, res) => {
  res.status(404).json({ success: false, message: 'API route not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack || err);
  res.status(500).json({ success: false, message: err.message || 'Internal server error' });
});

export default app;
