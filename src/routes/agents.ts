import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../lib/prisma';
import { agentAuth, AgentRequest } from '../middleware/agentAuth';

const router = Router();

// POST /api/agents/register - Register agent and get API key
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, url } = req.body;

    if (!name || typeof name !== 'string') {
      res.status(400).json({ error: 'Agent name is required' });
      return;
    }

    // Check if agent name already exists
    const existing = await prisma.agent.findUnique({
      where: { name },
    });

    if (existing) {
      res.status(409).json({ error: 'Agent name already registered' });
      return;
    }

    // Generate unique API key
    const apiKey = `aso_${uuidv4().replace(/-/g, '')}`;

    const agent = await prisma.agent.create({
      data: {
        name,
        url: url || null,
        apiKey,
      },
    });

    res.status(201).json({
      id: agent.id,
      name: agent.name,
      apiKey: agent.apiKey,
      message: 'Store this API key securely. Use it in the X-Agent-Key header for authenticated requests.',
    });
  } catch (error) {
    console.error('Agent registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// GET /api/agents/me - Get current agent info (requires auth)
router.get('/me', agentAuth, async (req: AgentRequest, res: Response) => {
  try {
    const agent = await prisma.agent.findUnique({
      where: { id: req.agent!.id },
      include: {
        reviews: {
          select: {
            id: true,
            rating: true,
            title: true,
            createdAt: true,
            tool: {
              select: { slug: true, name: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!agent) {
      res.status(404).json({ error: 'Agent not found' });
      return;
    }

    res.json({
      id: agent.id,
      name: agent.name,
      url: agent.url,
      createdAt: agent.createdAt,
      reviewCount: agent.reviews.length,
      reviews: agent.reviews,
    });
  } catch (error) {
    console.error('Agent fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch agent info' });
  }
});

export default router;
