import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables FIRST, before any other imports
config({ path: join(__dirname, '../../../.env') });

import { register } from 'tsconfig-paths';

register({
  baseUrl: join(__dirname, '..'),
  paths: {
    '@whats-up-addis/database': ['../../packages/database/src/client.ts'],
    '@whats-up-addis/shared': ['../../packages/shared/src/index.ts'],
  },
});

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './middleware/error-handler.js';
import { notFoundHandler } from './middleware/not-found.js';
import healthRoutes from './routes/health.routes.js';
import authRoutes from './routes/auth.routes.js';
import eventRoutes from './routes/event.routes.js';
import categoryRoutes from './routes/category.routes.js';
import adminRoutes from './routes/admin.routes.js';
import commentRoutes from './routes/comment.routes.js';
import ratingRoutes from './routes/rating.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import contactRoutes from './routes/contact.routes.js';
import usersRoutes from './routes/users.routes.js';

const app = express();
const PORT = process.env.API_PORT || 3001;

// Trust proxy - required for Railway and other cloud platforms
// In production, trust the first proxy (the load balancer/reverse proxy)
// In development, don't trust any proxies
const isProduction = process.env.NODE_ENV === 'production';
app.set('trust proxy', isProduction ? 1 : false);

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check routes (no /api prefix for standard health endpoints)
app.use('/', healthRoutes);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api', commentRoutes);
app.use('/api', ratingRoutes);
app.use('/api/contact', contactRoutes);

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 API server running on http://localhost:${PORT}`);
});
