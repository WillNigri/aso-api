import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// GET /api/search?task=X&chain=Y - Search by task/chain
router.get('/', async (req: Request, res: Response) => {
  try {
    const { task, chain, category } = req.query;

    const where: {
      AND?: Array<{
        OR?: Array<{
          name?: { contains: string; mode: 'insensitive' };
          description?: { contains: string; mode: 'insensitive' };
          capabilities?: { has: string };
        }>;
        chains?: { has: string };
        category?: { equals: string; mode: 'insensitive' };
      }>;
    } = { AND: [] };

    if (task) {
      where.AND!.push({
        OR: [
          { name: { contains: task as string, mode: 'insensitive' } },
          { description: { contains: task as string, mode: 'insensitive' } },
          { capabilities: { has: task as string } },
        ],
      });
    }

    if (chain) {
      where.AND!.push({
        chains: { has: chain as string },
      });
    }

    if (category) {
      where.AND!.push({
        category: { equals: category as string, mode: 'insensitive' },
      });
    }

    const tools = await prisma.tool.findMany({
      where: where.AND!.length > 0 ? where : undefined,
      include: {
        reviews: {
          select: { rating: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    const results = tools.map((tool) => {
      const reviewCount = tool.reviews.length;
      const rating =
        reviewCount > 0
          ? Math.round(
              (tool.reviews.reduce((sum, r) => sum + r.rating, 0) /
                reviewCount) *
                10
            ) / 10
          : 0;

      return {
        id: tool.id,
        slug: tool.slug,
        name: tool.name,
        category: tool.category,
        description: tool.description,
        chains: tool.chains,
        capabilities: tool.capabilities,
        llmsTxtUrl: `/api/tools/${tool.slug}/llms.txt`,
        rating,
        reviewCount,
      };
    });

    res.json({
      query: { task, chain, category },
      results,
      count: results.length,
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// GET /api/find?need=X&chain=Y - Capability-based matching
router.get('/find', async (req: Request, res: Response) => {
  try {
    const { need, chain } = req.query;

    if (!need) {
      res.status(400).json({ error: 'Missing required parameter: need' });
      return;
    }

    const needStr = (need as string).toLowerCase();

    // Map common needs to capabilities
    const capabilityMap: { [key: string]: string[] } = {
      send: ['send_tokens', 'transfer'],
      swap: ['swap', 'exchange', 'trade'],
      sign: ['sign', 'sign_message', 'sign_transaction'],
      wallet: ['create_wallet', 'wallet', 'account'],
      nft: ['mint_nft', 'nft', 'erc721'],
      deploy: ['deploy', 'deploy_contract'],
      bridge: ['bridge', 'cross_chain'],
      stake: ['stake', 'staking'],
      lend: ['lend', 'lending', 'borrow'],
      query: ['query', 'read', 'fetch'],
    };

    // Find matching capabilities
    let matchCapabilities: string[] = [needStr];
    for (const [key, values] of Object.entries(capabilityMap)) {
      if (needStr.includes(key) || values.some((v) => needStr.includes(v))) {
        matchCapabilities = [...matchCapabilities, ...values];
      }
    }

    // Find tools with matching capabilities
    const tools = await prisma.tool.findMany({
      where: {
        AND: [
          {
            OR: [
              ...matchCapabilities.map((cap) => ({
                capabilities: { has: cap },
              })),
              { description: { contains: needStr, mode: 'insensitive' as const } },
            ],
          },
          chain ? { chains: { has: chain as string } } : {},
        ],
      },
      include: {
        reviews: {
          select: { rating: true },
        },
      },
    });

    // Sort by rating and review count
    const results = tools
      .map((tool) => {
        const reviewCount = tool.reviews.length;
        const rating =
          reviewCount > 0
            ? Math.round(
                (tool.reviews.reduce((sum, r) => sum + r.rating, 0) /
                  reviewCount) *
                  10
              ) / 10
            : 0;

        // Calculate relevance score
        const capabilityMatches = tool.capabilities.filter((c) =>
          matchCapabilities.includes(c.toLowerCase())
        ).length;

        return {
          id: tool.id,
          slug: tool.slug,
          name: tool.name,
          category: tool.category,
          description: tool.description,
          chains: tool.chains,
          capabilities: tool.capabilities,
          quickstart: tool.quickstart,
          sdkInstall: tool.sdkInstall,
          llmsTxtUrl: `/api/tools/${tool.slug}/llms.txt`,
          rating,
          reviewCount,
          relevanceScore: capabilityMatches * 2 + rating + reviewCount * 0.1,
        };
      })
      .sort((a, b) => b.relevanceScore - a.relevanceScore);

    res.json({
      need,
      chain: chain || null,
      matches: results,
      count: results.length,
      suggestion:
        results.length > 0
          ? `Best match: ${results[0].name}. Get instructions at ${results[0].llmsTxtUrl}`
          : 'No matching tools found',
    });
  } catch (error) {
    console.error('Find error:', error);
    res.status(500).json({ error: 'Find failed' });
  }
});

export default router;
