import 'dotenv/config';
import app from './app.js';
import { connectDB } from './db.js';

await connectDB();

export default app;

export const config = {
  runtime: 'nodejs'
};
