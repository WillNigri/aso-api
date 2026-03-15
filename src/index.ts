import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { publicRateLimit, authRateLimit, strictRateLimit } from './middleware/rateLimit';

import directoryRoutes from './routes/directory';
import toolsRoutes from './routes/tools';
import searchRoutes from './routes/search';
import agentsRoutes from './routes/agents';
import reviewsRoutes from './routes/reviews';
import companiesRoutes from './routes/companies';
import metaRoutes from './routes/meta';

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy for rate limiting behind reverse proxy
app.set('trust proxy', 1);

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: [
      'https://agenticsearchoptimization.ai',
      'http://localhost:3000',
      'http://localhost:5500',
      'http://127.0.0.1:5500',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Agent-Key'],
  })
);
app.use(express.json());

// Add agent-friendly headers to all responses
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Agent-Friendly', 'true');
  res.setHeader('X-LLMs-Txt', '/llms.txt');
  res.setHeader('X-API-Version', '1.0');
  next();
});

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Root-level agent discovery files
app.get('/llms.txt', metaRoutes);
app.get('/agents.json', metaRoutes);
app.get('/.well-known/ai-plugin.json', metaRoutes);

// Public routes (rate limited)
app.use('/api/directory', publicRateLimit, directoryRoutes);
app.use('/api/tools', publicRateLimit, toolsRoutes);
app.use('/api/search', publicRateLimit, searchRoutes);
app.use('/api/find', publicRateLimit, searchRoutes);
app.use('/api/stats', publicRateLimit, metaRoutes);
app.use('/api/agent-instructions', publicRateLimit, metaRoutes);
app.use('/api/sitemap.xml', publicRateLimit, metaRoutes);

// Agent routes
app.post('/api/agents/register', strictRateLimit, agentsRoutes);
app.use('/api/agents', authRateLimit, agentsRoutes);
app.use('/api/reviews', authRateLimit, reviewsRoutes);
app.post('/api/tools/suggest', authRateLimit, reviewsRoutes);

// Company routes
app.post('/api/companies/register', strictRateLimit, companiesRoutes);
app.post('/api/companies/login', strictRateLimit, companiesRoutes);
app.use('/api/companies', authRateLimit, companiesRoutes);
app.post('/api/reviews/:id/respond', authRateLimit, companiesRoutes);
app.put('/api/responses/:id', authRateLimit, companiesRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`ASO API running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Directory: http://localhost:${PORT}/api/directory`);
});

export default app;
