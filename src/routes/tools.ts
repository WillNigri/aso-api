import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// Helper to extract string param
function getParam(param: string | string[] | undefined): string {
  if (Array.isArray(param)) return param[0];
  return param || '';
}

// GET /api/tools/:slug - Tool detail with reviews and responses
router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const slug = getParam(req.params.slug);

    const tool = await prisma.tool.findUnique({
      where: { slug },
      include: {
        reviews: {
          include: {
            agent: {
              select: { name: true },
            },
            response: {
              include: {
                company: {
                  select: { name: true },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        company: {
          select: { name: true, verified: true },
        },
      },
    });

    if (!tool) {
      res.status(404).json({ error: 'Tool not found' });
      return;
    }

    const reviewCount = tool.reviews.length;
    const rating =
      reviewCount > 0
        ? Math.round(
            (tool.reviews.reduce((sum: number, r) => sum + r.rating, 0) / reviewCount) *
              10
          ) / 10
        : 0;

    // JSON-LD structured data
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: tool.name,
      description: tool.description,
      url: tool.url,
      applicationCategory: tool.category,
      aggregateRating:
        reviewCount > 0
          ? {
              '@type': 'AggregateRating',
              ratingValue: rating.toString(),
              reviewCount: reviewCount.toString(),
              bestRating: '5',
              worstRating: '1',
            }
          : undefined,
    };

    res.json({
      id: tool.id,
      slug: tool.slug,
      name: tool.name,
      category: tool.category,
      url: tool.url,
      description: tool.description,
      chains: tool.chains,
      pricing: tool.pricing,
      quickstart: tool.quickstart,
      capabilities: tool.capabilities,
      authMethod: tool.authMethod,
      sdkInstall: tool.sdkInstall,
      llmsTxtUrl: `/api/tools/${tool.slug}/llms.txt`,
      agentCompatible: true,
      rating,
      reviewCount,
      claimedBy: tool.company
        ? { name: tool.company.name, verified: tool.company.verified }
        : null,
      reviews: tool.reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        title: r.title,
        pros: r.pros,
        cons: r.cons,
        body: r.body,
        tested: r.tested,
        lastTested: r.lastTested,
        agentName: r.agent.name,
        createdAt: r.createdAt,
        response: r.response
          ? {
              body: r.response.body,
              companyName: r.response.company.name,
              createdAt: r.response.createdAt,
            }
          : null,
      })),
      jsonLd,
    });
  } catch (error) {
    console.error('Tool fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch tool' });
  }
});

// GET /api/tools/:slug/reviews - Paginated reviews
router.get('/:slug/reviews', async (req: Request, res: Response) => {
  try {
    const slug = getParam(req.params.slug);
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const skip = (page - 1) * limit;

    const tool = await prisma.tool.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!tool) {
      res.status(404).json({ error: 'Tool not found' });
      return;
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { toolId: tool.id },
        include: {
          agent: {
            select: { name: true },
          },
          response: {
            include: {
              company: {
                select: { name: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.review.count({ where: { toolId: tool.id } }),
    ]);

    res.json({
      reviews: reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        title: r.title,
        pros: r.pros,
        cons: r.cons,
        body: r.body,
        tested: r.tested,
        lastTested: r.lastTested,
        agentName: r.agent.name,
        createdAt: r.createdAt,
        response: r.response
          ? {
              body: r.response.body,
              companyName: r.response.company.name,
              createdAt: r.response.createdAt,
            }
          : null,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Reviews fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// GET /api/tools/:slug/llms.txt - Agent instructions (plain text)
router.get('/:slug/llms.txt', async (req: Request, res: Response) => {
  try {
    const slug = getParam(req.params.slug);

    const tool = await prisma.tool.findUnique({
      where: { slug },
    });

    if (!tool) {
      res.status(404).type('text/plain').send('Tool not found');
      return;
    }

    // If tool has custom llmsTxt, return that
    if (tool.llmsTxt) {
      res.type('text/plain').send(tool.llmsTxt);
      return;
    }

    // Generate default llms.txt
    const lines = [
      `# ${tool.name}`,
      '',
      '## What This Does',
      tool.description,
      '',
    ];

    if (tool.capabilities.length > 0) {
      lines.push('## Capabilities');
      tool.capabilities.forEach((cap) => lines.push(`- ${cap}`));
      lines.push('');
    }

    if (tool.sdkInstall) {
      lines.push('## Quick Start');
      lines.push('```');
      lines.push(tool.sdkInstall);
      lines.push('```');
      lines.push('');
    }

    if (tool.authMethod) {
      lines.push('## Authentication');
      lines.push(`Method: ${tool.authMethod}`);
      lines.push('');
    }

    if (tool.chains.length > 0) {
      lines.push('## Supported Chains');
      tool.chains.forEach((chain) => lines.push(`- ${chain}`));
      lines.push('');
    }

    lines.push('## Pricing');
    lines.push(tool.pricing);
    lines.push('');

    lines.push('## More Info');
    lines.push(tool.url);

    res.type('text/plain').send(lines.join('\n'));
  } catch (error) {
    console.error('LLMs.txt fetch error:', error);
    res.status(500).type('text/plain').send('Error fetching tool instructions');
  }
});

// GET /api/tools/:slug/meta - Open Graph / Twitter card data
router.get('/:slug/meta', async (req: Request, res: Response) => {
  try {
    const slug = getParam(req.params.slug);

    const tool = await prisma.tool.findUnique({
      where: { slug },
      include: {
        reviews: {
          select: { rating: true },
        },
      },
    });

    if (!tool) {
      res.status(404).json({ error: 'Tool not found' });
      return;
    }

    const reviewCount = tool.reviews.length;
    const rating =
      reviewCount > 0
        ? Math.round(
            (tool.reviews.reduce((sum: number, r) => sum + r.rating, 0) / reviewCount) *
              10
          ) / 10
        : 0;

    const ratingText =
      reviewCount > 0 ? `${rating}/5 (${reviewCount} reviews)` : 'No reviews yet';

    res.json({
      title: `${tool.name} - Agentic Search Optimization`,
      description: `${tool.description} | ${ratingText}`,
      og: {
        title: tool.name,
        description: tool.description,
        type: 'website',
        url: `https://agenticsearchoptimization.ai/tools/${tool.slug}`,
      },
      twitter: {
        card: 'summary',
        title: tool.name,
        description: tool.description,
      },
      canonical: `https://agenticsearchoptimization.ai/tools/${tool.slug}`,
    });
  } catch (error) {
    console.error('Meta fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch meta' });
  }
});

export default router;
