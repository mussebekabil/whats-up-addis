import { Router } from 'express';
import { prisma } from '@whats-up-addis/database';

const router = Router();

/**
 * Health check endpoint
 * Returns detailed health status including database connectivity
 */
router.get('/health', async (_req, res) => {
  const healthcheck = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    database: 'checking...',
  };

  try {
    // Check database connectivity
    await prisma.$queryRaw`SELECT 1`;
    healthcheck.database = 'connected';
    res.status(200).json(healthcheck);
  } catch {
    healthcheck.status = 'error';
    healthcheck.database = 'disconnected';
    res.status(503).json(healthcheck);
  }
});

/**
 * Liveness probe endpoint (for Railway/K8s)
 * Simple check if the application is running
 */
router.get('/healthz', (_req, res) => {
  res.status(200).send('OK');
});

/**
 * Readiness probe endpoint (for Railway/K8s)
 * Checks if the application is ready to serve traffic
 */
router.get('/ready', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).send('READY');
  } catch {
    res.status(503).send('NOT READY');
  }
});

export default router;
