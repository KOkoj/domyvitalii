import { Router } from 'express';
import { body, query, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { authenticate, authorize, AuthenticatedRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get all users (Admin only)
router.get(
  '/',
  authenticate,
  authorize('ADMIN'),
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('role').optional().isIn(['ADMIN', 'MANAGER', 'EMPLOYEE']),
    query('isActive').optional().isBoolean(),
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
    
    if (req.query.role) {
      where.role = req.query.role;
    }

    if (req.query.isActive !== undefined) {
      where.isActive = req.query.isActive === 'true';
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          avatar: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              properties: true,
              blogPosts: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  })
);

// Get user by ID (Admin only)
router.get(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  asyncHandler(async (req: AuthenticatedRequest, res, next) => {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            properties: true,
            blogPosts: true,
          },
        },
      },
    });

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.json({
      success: true,
      data: { user },
    });
  })
);

// Update user (Admin only)
router.put(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  [
    body('name').optional().notEmpty().trim(),
    body('email').optional().isEmail().normalizeEmail(),
    body('role').optional().isIn(['ADMIN', 'MANAGER', 'EMPLOYEE']),
    body('isActive').optional().isBoolean(),
    body('password').optional().isLength({ min: 6 }),
  ],
  asyncHandler(async (req: AuthenticatedRequest, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError('Invalid input data', 400));
    }

    const { id } = req.params;
    const updateData: any = { ...req.body };

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return next(new AppError('User not found', 404));
    }

    // Check if email is already taken by another user
    if (updateData.email && updateData.email !== existingUser.email) {
      const emailTaken = await prisma.user.findFirst({
        where: {
          email: updateData.email,
          NOT: { id },
        },
      });

      if (emailTaken) {
        return next(new AppError('Email is already taken', 400));
      }
    }

    // Hash password if provided
    if (updateData.password) {
      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
      updateData.password = await bcrypt.hash(updateData.password, saltRounds);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({
      success: true,
      data: { user },
    });
  })
);

// Delete user (Admin only)
router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  asyncHandler(async (req: AuthenticatedRequest, res, next) => {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (id === req.user!.id) {
      return next(new AppError('You cannot delete your own account', 400));
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    await prisma.user.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  })
);

// Update own profile (All authenticated users)
router.put(
  '/profile/me',
  authenticate,
  [
    body('name').optional().notEmpty().trim(),
    body('password').optional().isLength({ min: 6 }),
    body('currentPassword').if(body('password').exists()).notEmpty(),
  ],
  asyncHandler(async (req: AuthenticatedRequest, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError('Invalid input data', 400));
    }

    const { name, password, currentPassword } = req.body;
    const userId = req.user!.id;

    const updateData: any = {};

    if (name) {
      updateData.name = name;
    }

    if (password) {
      // Verify current password
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return next(new AppError('User not found', 404));
      }

      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return next(new AppError('Current password is incorrect', 400));
      }

      // Hash new password
      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
      updateData.password = await bcrypt.hash(password, saltRounds);
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({
      success: true,
      data: { user },
    });
  })
);

export { router as userRoutes }; 