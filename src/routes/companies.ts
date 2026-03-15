import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { companyAuth, CompanyRequest } from '../middleware/companyAuth';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production';
const JWT_EXPIRES_IN = '7d';

// Helper to extract string param
function getParam(param: string | string[] | undefined): string {
  if (Array.isArray(param)) return param[0];
  return param || '';
}

// POST /api/companies/register - Register company
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password, domain } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ error: 'name, email, and password are required' });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ error: 'Password must be at least 8 characters' });
      return;
    }

    // Check if email already exists
    const existing = await prisma.company.findUnique({
      where: { email },
    });

    if (existing) {
      res.status(409).json({ error: 'Email already registered' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const company = await prisma.company.create({
      data: {
        name,
        email,
        password: hashedPassword,
        domain: domain || null,
      },
    });

    const token = jwt.sign(
      { id: company.id, email: company.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(201).json({
      id: company.id,
      name: company.name,
      email: company.email,
      token,
      message: 'Company registered successfully',
    });
  } catch (error) {
    console.error('Company registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /api/companies/login - Login and get JWT
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'email and password are required' });
      return;
    }

    const company = await prisma.company.findUnique({
      where: { email },
    });

    if (!company) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const validPassword = await bcrypt.compare(password, company.password);

    if (!validPassword) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign(
      { id: company.id, email: company.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      id: company.id,
      name: company.name,
      email: company.email,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// GET /api/companies/me - Get current company info
router.get('/me', companyAuth, async (req: CompanyRequest, res: Response) => {
  try {
    const company = await prisma.company.findUnique({
      where: { id: req.company!.id },
      include: {
        tools: {
          select: {
            id: true,
            slug: true,
            name: true,
          },
        },
        responses: {
          include: {
            review: {
              select: {
                id: true,
                title: true,
                rating: true,
                tool: {
                  select: { slug: true, name: true },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!company) {
      res.status(404).json({ error: 'Company not found' });
      return;
    }

    res.json({
      id: company.id,
      name: company.name,
      email: company.email,
      domain: company.domain,
      verified: company.verified,
      claimedTools: company.tools,
      responses: company.responses,
    });
  } catch (error) {
    console.error('Company fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch company info' });
  }
});

// POST /api/companies/claim/:slug - Claim a tool listing
router.post(
  '/claim/:slug',
  companyAuth,
  async (req: CompanyRequest, res: Response) => {
    try {
      const slug = getParam(req.params.slug);

      const tool = await prisma.tool.findUnique({
        where: { slug },
      });

      if (!tool) {
        res.status(404).json({ error: 'Tool not found' });
        return;
      }

      if (tool.claimedBy) {
        res.status(409).json({ error: 'Tool already claimed by another company' });
        return;
      }

      await prisma.tool.update({
        where: { slug },
        data: { claimedBy: req.company!.id },
      });

      res.json({
        message: `Successfully claimed ${tool.name}`,
        toolSlug: slug,
      });
    } catch (error) {
      console.error('Claim error:', error);
      res.status(500).json({ error: 'Failed to claim tool' });
    }
  }
);

// POST /api/reviews/:id/respond - Respond to a review
router.post(
  '/reviews/:id/respond',
  companyAuth,
  async (req: CompanyRequest, res: Response) => {
    try {
      const id = getParam(req.params.id);
      const { body } = req.body;

      if (!body || typeof body !== 'string') {
        res.status(400).json({ error: 'Response body is required' });
        return;
      }

      const review = await prisma.review.findUnique({
        where: { id },
        include: {
          tool: true,
        },
      });

      if (!review) {
        res.status(404).json({ error: 'Review not found' });
        return;
      }

      // Check if company owns the tool
      if (review.tool.claimedBy !== req.company!.id) {
        res.status(403).json({
          error: 'You can only respond to reviews on tools you have claimed',
        });
        return;
      }

      // Check if already responded
      const existing = await prisma.companyResponse.findUnique({
        where: { reviewId: id },
      });

      if (existing) {
        res.status(409).json({
          error: 'You have already responded to this review. Use PUT to update.',
          responseId: existing.id,
        });
        return;
      }

      const response = await prisma.companyResponse.create({
        data: {
          reviewId: id,
          companyId: req.company!.id,
          body,
        },
      });

      res.status(201).json({
        id: response.id,
        message: 'Response submitted successfully',
      });
    } catch (error) {
      console.error('Response error:', error);
      res.status(500).json({ error: 'Failed to submit response' });
    }
  }
);

// PUT /api/responses/:id - Update response
router.put(
  '/responses/:id',
  companyAuth,
  async (req: CompanyRequest, res: Response) => {
    try {
      const id = getParam(req.params.id);
      const { body } = req.body;

      if (!body || typeof body !== 'string') {
        res.status(400).json({ error: 'Response body is required' });
        return;
      }

      const response = await prisma.companyResponse.findUnique({
        where: { id },
      });

      if (!response) {
        res.status(404).json({ error: 'Response not found' });
        return;
      }

      if (response.companyId !== req.company!.id) {
        res.status(403).json({ error: 'You can only update your own responses' });
        return;
      }

      await prisma.companyResponse.update({
        where: { id },
        data: { body },
      });

      res.json({ message: 'Response updated successfully' });
    } catch (error) {
      console.error('Response update error:', error);
      res.status(500).json({ error: 'Failed to update response' });
    }
  }
);

export default router;
