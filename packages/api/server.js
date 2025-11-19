import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import dotenv from 'dotenv';
import frameworksRouter from './routes/frameworks.js';
import scoresRouter from './routes/scores.js';
import characteristicsRouter from './routes/characteristics.js';
import statsRouter from './routes/stats.js';

dotenv.config({ path: '../../.env' });

const app = new Hono();

// Middleware
app.use('/*', cors());

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.route('/api/v1/frameworks', frameworksRouter);
app.route('/api/v1/scores', scoresRouter);
app.route('/api/v1/characteristics', characteristicsRouter);
app.route('/api/v1/stats', statsRouter);

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not found' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Server error:', err);
  return c.json({ error: 'Internal server error', message: err.message }, 500);
});

const port = parseInt(process.env.API_PORT || '3000');
const host = process.env.API_HOST || 'localhost';

console.log(`🚀 API server starting on http://${host}:${port}`);

serve({
  fetch: app.fetch,
  port,
  hostname: host
});
