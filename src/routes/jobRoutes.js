import express from 'express';
import {
  createJob,
  getJobs,
  getJobBySlug,
  updateJob,
  deleteJob,
  getFeaturedJobs,
  getTopJobs
} from '../controllers/jobController.js';
import { incrementJobView } from '../controllers/jobController.js';
import { protect, authorize, optionalProtect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', optionalProtect, getJobs);
router.get('/featured', getFeaturedJobs);
router.get('/top', getTopJobs);
router.get('/:slug', getJobBySlug);
router.post('/:id/view', incrementJobView);

// Protected routes
router.post('/', protect, authorize('employer', 'admin'), createJob);
router.put('/:id', protect, authorize('employer', 'admin'), updateJob);
router.delete('/:id', protect, authorize('employer', 'admin'), deleteJob);

export default router;