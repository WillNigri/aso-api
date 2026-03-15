import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

export interface AgentRequest extends Request {
  agent?: {
    id: string;
    name: string;
  };
}

export async function agentAuth(
  req: AgentRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const apiKey = req.header('X-Agent-Key');

  if (!apiKey) {
    res.status(401).json({ error: 'Missing X-Agent-Key header' });
    return;
  }

  try {
    const agent = await prisma.agent.findUnique({
      where: { apiKey },
      select: { id: true, name: true },
    });

    if (!agent) {
      res.status(401).json({ error: 'Invalid API key' });
      return;
    }

    req.agent = agent;
    next();
  } catch (error) {
    console.error('Agent auth error:', error);
    res.status(500).json({ error: 'Authentication error' });
  }
}
