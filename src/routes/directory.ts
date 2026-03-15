import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// Helper to extract string param
function getParam(param: string | string[] | undefined): string {
  if (Array.isArray(param)) return param[0];
  return param || '';
}

interface ToolWithStats {
  id: string;
  slug: string;
  name: string;
  category: string;
  url: string;
  description: string;
  chains: string[];
  pricing: string;
  quickstart: string | null;
  capabilities: string[];
  authMethod: string | null;
  sdkInstall: string | null;
  llmsTxtUrl: string;
  agentCompatible: boolean;
  rating: number;
  reviewCount: number;
}

interface DirectoryResponse {
  categories: {
    [key: string]: ToolWithStats[];
  };
  meta: {
    totalTools: number;
    totalReviews: number;
    lastUpdated: string;
  };
}

async function getToolsWithStats(): Promise<ToolWithStats[]> {
  const tools = await prisma.tool.findMany({
    include: {
      reviews: {
        select: {
          rating: true,
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });

  return tools.map((tool) => {
    const reviewCount = tool.reviews.length;
    const rating =
      reviewCount > 0
        ? Math.round(
            (tool.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount) *
              10
          ) / 10
        : 0;

    return {
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
    };
  });
}

// GET /api/directory - Full directory with aggregated ratings
router.get('/', async (_req: Request, res: Response) => {
  try {
    const tools = await getToolsWithStats();

    const categories: { [key: string]: ToolWithStats[] } = {};
    tools.forEach((tool) => {
      if (!categories[tool.category]) {
        categories[tool.category] = [];
      }
      categories[tool.category].push(tool);
    });

    const totalReviews = tools.reduce((sum, t) => sum + t.reviewCount, 0);

    const response: DirectoryResponse = {
      categories,
      meta: {
        totalTools: tools.length,
        totalReviews,
        lastUpdated: new Date().toISOString(),
      },
    };

    res.json(response);
  } catch (error) {
    console.error('Directory fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch directory' });
  }
});

// GET /api/directory/:category - Tools in a category
router.get('/:category', async (req: Request, res: Response) => {
  try {
    const category = getParam(req.params.category);

    const tools = await prisma.tool.findMany({
      where: {
        category: {
          equals: category,
          mode: 'insensitive',
        },
      },
      include: {
        reviews: {
          select: {
            rating: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    if (tools.length === 0) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    const toolsWithStats = tools.map((tool) => {
      const reviewCount = tool.reviews.length;
      const rating =
        reviewCount > 0
          ? Math.round(
              (tool.reviews.reduce((sum: number, r) => sum + r.rating, 0) /
                reviewCount) *
                10
            ) / 10
          : 0;

      return {
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
      };
    });

    res.json({
      category,
      tools: toolsWithStats,
      count: toolsWithStats.length,
    });
  } catch (error) {
    console.error('Category fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch category' });
  }
});

export default router;
