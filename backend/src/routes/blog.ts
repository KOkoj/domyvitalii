// @ts-nocheck
import { Router } from 'express';
import { body, query, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import slugify from 'slugify';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { authenticate, authorize, optionalAuth, AuthenticatedRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get all blog posts with filtering and pagination
router.get(
  '/',
  optionalAuth,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('family').optional().isIn(['TRIVIA', 'PROPERTY', 'COMPANY']),
    query('topic').optional().isString(),
    query('search').optional().isString(),
  ],
  asyncHandler(async (req: AuthenticatedRequest, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError('Invalid query parameters', 400));
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Build filters
    const where: any = {};
    
    // Only show published posts for non-authenticated users
    if (!req.user) {
      where.isPublished = true;
    }

    if (req.query.family) {
      where.family = req.query.family;
    }

    if (req.query.topic) {
      where.topic = req.query.topic;
    }

    if (req.query.search) {
      const searchTerm = req.query.search as string;
      where.OR = [
        {
          title: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        {
          excerpt: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        {
          content: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
      ];
    }

    // Get blog posts with pagination
    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        skip,
        take: limit,
        include: {
          author: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          publishedAt: 'desc',
        },
      }),
      prisma.blogPost.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        data: posts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  })
);

// Get blog post by ID or slug
router.get(
  '/:identifier',
  optionalAuth,
  asyncHandler(async (req: AuthenticatedRequest, res, next) => {
    const { identifier } = req.params;

    const where: any = {
      OR: [
        { id: identifier },
        { slug: identifier },
      ],
    };
    
    // Only show published posts for non-authenticated users
    if (!req.user) {
      where.isPublished = true;
    }

    const post = await prisma.blogPost.findFirst({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!post) {
      return next(new AppError('Blog post not found', 404));
    }

    // Increment view count
    await prisma.blogPost.update({
      where: { id: post.id },
      data: { views: { increment: 1 } },
    });

    res.json({
      success: true,
      data: { post },
    });
  })
);

// Create new blog post
router.post(
  '/',
  authenticate,
  authorize('ADMIN', 'MANAGER', 'EMPLOYEE'),
  [
    body('title').notEmpty().trim(),
    body('excerpt').notEmpty().trim(),
    body('content').notEmpty(),
    body('family').isIn(['TRIVIA', 'PROPERTY', 'COMPANY']),
    body('topic').notEmpty().trim(),
    body('tags').optional().isArray(),
    body('coverImage').optional().isURL(),
    body('readTime').optional().isInt({ min: 1 }),
  ],
  asyncHandler(async (req: AuthenticatedRequest, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError('Invalid input data', 400));
    }

    const {
      title,
      excerpt,
      content,
      family,
      topic,
      tags,
      coverImage,
      coverImagePublicId,
      readTime,
      metaTitle,
      metaDescription,
    } = req.body;

    // Generate slug
    const baseSlug = slugify(title, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;

    // Ensure unique slug
    while (await prisma.blogPost.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const post = await prisma.blogPost.create({
      data: {
        title,
        slug,
        excerpt,
        content,
        family,
        topic,
        tags: tags || [],
        coverImage,
        coverImagePublicId,
        readTime,
        metaTitle: metaTitle || title,
        metaDescription: metaDescription || excerpt,
        authorId: req.user!.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: { post },
    });
  })
);

// Update blog post
router.put(
  '/:id',
  authenticate,
  authorize('ADMIN', 'MANAGER', 'EMPLOYEE'),
  [
    body('title').optional().notEmpty().trim(),
    body('excerpt').optional().notEmpty().trim(),
    body('content').optional().notEmpty(),
    body('family').optional().isIn(['TRIVIA', 'PROPERTY', 'COMPANY']),
    body('topic').optional().notEmpty().trim(),
    body('tags').optional().isArray(),
  ],
  asyncHandler(async (req: AuthenticatedRequest, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError('Invalid input data', 400));
    }

    const { id } = req.params;
    const updateData: any = { ...req.body };

    // Update slug if title changed
    if (updateData.title) {
      const baseSlug = slugify(updateData.title, { lower: true, strict: true });
      let slug = baseSlug;
      let counter = 1;

      // Ensure unique slug (excluding current post)
      while (await prisma.blogPost.findFirst({ 
        where: { 
          slug,
          NOT: { id }
        } 
      })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      updateData.slug = slug;
    }

    const post = await prisma.blogPost.update({
      where: { id },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: { post },
    });
  })
);

// Publish/unpublish blog post
router.patch(
  '/:id/publish',
  authenticate,
  authorize('ADMIN', 'MANAGER'),
  asyncHandler(async (req: AuthenticatedRequest, res, next) => {
    const { id } = req.params;
    const { isPublished } = req.body;

    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        isPublished,
        publishedAt: isPublished ? new Date() : null,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: { post },
    });
  })
);

// Delete blog post
router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN', 'MANAGER'),
  asyncHandler(async (req: AuthenticatedRequest, res, next) => {
    const { id } = req.params;

    const post = await prisma.blogPost.findUnique({
      where: { id },
    });

    if (!post) {
      return next(new AppError('Blog post not found', 404));
    }

    await prisma.blogPost.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Blog post deleted successfully',
    });
  })
);

export { router as blogRoutes }; 