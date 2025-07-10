// @ts-nocheck
import { Router } from 'express';
import { body, query, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { authenticate, authorize, AuthenticatedRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get all inquiries (Admin/Manager only)
router.get(
  '/',
  authenticate,
  authorize('ADMIN', 'MANAGER'),
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('status').optional().isIn(['NEW', 'IN_PROGRESS', 'RESPONDED', 'CLOSED']),
    query('type').optional().isIn(['PROPERTY', 'GENERAL', 'NEWSLETTER', 'CALLBACK']),
  ],
  asyncHandler(async (req: AuthenticatedRequest, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError('Invalid query parameters', 400));
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (req.query.status) {
      where.status = req.query.status;
    }

    if (req.query.type) {
      where.type = req.query.type;
    }

    const [inquiries, total] = await Promise.all([
      prisma.inquiry.findMany({
        where,
        skip,
        take: limit,
        include: {
          property: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.inquiry.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        data: inquiries,
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

// Create new inquiry (Public endpoint)
router.post(
  '/',
  [
    body('name').notEmpty().trim(),
    body('email').isEmail().normalizeEmail(),
    body('message').notEmpty().trim(),
    body('phone').optional().isMobilePhone(),
    body('propertyId').optional().isString(),
    body('type').optional().isIn(['PROPERTY', 'GENERAL', 'NEWSLETTER', 'CALLBACK']),
    body('source').optional().isString(),
  ],
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError('Invalid input data', 400));
    }

    const {
      name,
      email,
      phone,
      message,
      propertyId,
      type = 'GENERAL',
      source,
    } = req.body;

    // Verify property exists if propertyId is provided
    if (propertyId) {
      const property = await prisma.property.findUnique({
        where: { id: propertyId },
      });

      if (!property) {
        return next(new AppError('Property not found', 404));
      }
    }

    const inquiry = await prisma.inquiry.create({
      data: {
        name,
        email,
        phone,
        message,
        type,
        source,
        propertyId,
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: { inquiry },
    });
  })
);

// Update inquiry status (Admin/Manager only)
router.patch(
  '/:id/status',
  authenticate,
  authorize('ADMIN', 'MANAGER'),
  [
    body('status').isIn(['NEW', 'IN_PROGRESS', 'RESPONDED', 'CLOSED']),
  ],
  asyncHandler(async (req: AuthenticatedRequest, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError('Invalid input data', 400));
    }

    const { id } = req.params;
    const { status } = req.body;

    const inquiry = await prisma.inquiry.update({
      where: { id },
      data: { status },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: { inquiry },
    });
  })
);

// Delete inquiry (Admin only)
router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  asyncHandler(async (req: AuthenticatedRequest, res, next) => {
    const { id } = req.params;

    const inquiry = await prisma.inquiry.findUnique({
      where: { id },
    });

    if (!inquiry) {
      return next(new AppError('Inquiry not found', 404));
    }

    await prisma.inquiry.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Inquiry deleted successfully',
    });
  })
);

export { router as inquiryRoutes }; 