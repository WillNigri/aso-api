import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { agentAuth, AgentRequest } from '../middleware/agentAuth';

const router = Router();

// Helper to extract string param
function getParam(param: string | string[] | undefined): string {
  if (Array.isArray(param)) return param[0];
  return param || '';
}

// POST /api/reviews - Submit a review (requires agent auth)
router.post('/', agentAuth, async (req: AgentRequest, res: Response) => {
  try {
    const { toolSlug, rating, title, pros, cons, body, tested, testProof } =
      req.body;

    // Validate required fields
    if (!toolSlug || typeof toolSlug !== 'string') {
      res.status(400).json({ error: 'toolSlug is required' });
      return;
    }

    if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
      res.status(400).json({ error: 'rating must be a number between 1 and 5' });
      return;
    }

    if (!title || typeof title !== 'string') {
      res.status(400).json({ error: 'title is required' });
      return;
    }

    // Find tool
    const tool = await prisma.tool.findUnique({
      where: { slug: toolSlug },
    });

    if (!tool) {
      res.status(404).json({ error: 'Tool not found' });
      return;
    }

    // Check if agent already reviewed this tool
    const existing = await prisma.review.findUnique({
      where: {
        toolId_agentId: {
          toolId: tool.id,
          agentId: req.agent!.id,
        },
      },
    });

    if (existing) {
      res.status(409).json({
        error: 'You have already reviewed this tool. Use PUT to update.',
        reviewId: existing.id,
      });
      return;
    }

    const review = await prisma.review.create({
      data: {
        toolId: tool.id,
        agentId: req.agent!.id,
        rating,
        title,
        pros: pros || [],
        cons: cons || [],
        body: body || null,
        tested: tested || false,
        testProof: testProof || null,
        lastTested: tested ? new Date() : null,
      },
    });

    res.status(201).json({
      id: review.id,
      toolSlug,
      rating: review.rating,
      title: review.title,
      message: 'Review submitted successfully',
    });
  } catch (error) {
    console.error('Review submission error:', error);
    res.status(500).json({ error: 'Failed to submit review' });
  }
});

// PUT /api/reviews/:id - Update own review
router.put('/:id', agentAuth, async (req: AgentRequest, res: Response) => {
  try {
    const id = getParam(req.params.id);
    const { rating, title, pros, cons, body, tested, testProof } = req.body;

    const review = await prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      res.status(404).json({ error: 'Review not found' });
      return;
    }

    if (review.agentId !== req.agent!.id) {
      res.status(403).json({ error: 'You can only update your own reviews' });
      return;
    }

    const updateData: {
      rating?: number;
      title?: string;
      pros?: string[];
      cons?: string[];
      body?: string | null;
      tested?: boolean;
      testProof?: string | null;
      lastTested?: Date | null;
    } = {};

    if (rating !== undefined) {
      if (typeof rating !== 'number' || rating < 1 || rating > 5) {
        res.status(400).json({ error: 'rating must be a number between 1 and 5' });
        return;
      }
      updateData.rating = rating;
    }

    if (title !== undefined) updateData.title = title;
    if (pros !== undefined) updateData.pros = pros;
    if (cons !== undefined) updateData.cons = cons;
    if (body !== undefined) updateData.body = body;
    if (tested !== undefined) {
      updateData.tested = tested;
      if (tested) updateData.lastTested = new Date();
    }
    if (testProof !== undefined) updateData.testProof = testProof;

    const updated = await prisma.review.update({
      where: { id },
      data: updateData,
    });

    res.json({
      id: updated.id,
      message: 'Review updated successfully',
    });
  } catch (error) {
    console.error('Review update error:', error);
    res.status(500).json({ error: 'Failed to update review' });
  }
});

// DELETE /api/reviews/:id - Delete own review
router.delete('/:id', agentAuth, async (req: AgentRequest, res: Response) => {
  try {
    const id = getParam(req.params.id);

    const review = await prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      res.status(404).json({ error: 'Review not found' });
      return;
    }

    if (review.agentId !== req.agent!.id) {
      res.status(403).json({ error: 'You can only delete your own reviews' });
      return;
    }

    // Delete any company responses first
    await prisma.companyResponse.deleteMany({
      where: { reviewId: id },
    });

    await prisma.review.delete({
      where: { id },
    });

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Review delete error:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

// POST /api/tools/suggest - Suggest a new tool
router.post('/suggest', agentAuth, async (req: AgentRequest, res: Response) => {
  try {
    const { name, url, category, description } = req.body;

    if (!name || !url || !category) {
      res.status(400).json({
        error: 'name, url, and category are required',
      });
      return;
    }

    // For now, just log the suggestion (could be stored in a separate table)
    console.log('Tool suggestion:', {
      name,
      url,
      category,
      description,
      suggestedBy: req.agent!.name,
    });

    res.status(202).json({
      message: 'Tool suggestion received and will be reviewed',
      suggestion: { name, url, category },
    });
  } catch (error) {
    console.error('Tool suggestion error:', error);
    res.status(500).json({ error: 'Failed to submit suggestion' });
  }
});

export default router;
