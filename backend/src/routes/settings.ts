import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { authenticate, authorize, AuthenticatedRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get all settings (Admin only)
router.get(
  '/',
  authenticate,
  authorize('ADMIN'),
  asyncHandler(async (req: AuthenticatedRequest, res, next) => {
    const settings = await prisma.setting.findMany({
      orderBy: { key: 'asc' },
    });

    // Convert settings to key-value object
    const settingsObject = settings.reduce((acc, setting) => {
      let value;
      switch (setting.type) {
        case 'NUMBER':
          value = parseFloat(setting.value);
          break;
        case 'BOOLEAN':
          value = setting.value === 'true';
          break;
        case 'JSON':
          try {
            value = JSON.parse(setting.value);
          } catch {
            value = setting.value;
          }
          break;
        default:
          value = setting.value;
      }
      acc[setting.key] = value;
      return acc;
    }, {} as Record<string, any>);

    res.json({
      success: true,
      data: { settings: settingsObject },
    });
  })
);

// Update settings (Admin only)
router.put(
  '/',
  authenticate,
  authorize('ADMIN'),
  [
    body('settings').isObject(),
  ],
  asyncHandler(async (req: AuthenticatedRequest, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError('Invalid input data', 400));
    }

    const { settings } = req.body;

    try {
      const updatePromises = Object.entries(settings).map(async ([key, value]) => {
        let stringValue: string;
        let type: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON' = 'STRING';

        if (typeof value === 'number') {
          stringValue = value.toString();
          type = 'NUMBER';
        } else if (typeof value === 'boolean') {
          stringValue = value.toString();
          type = 'BOOLEAN';
        } else if (typeof value === 'object') {
          stringValue = JSON.stringify(value);
          type = 'JSON';
        } else {
          stringValue = String(value);
          type = 'STRING';
        }

        return prisma.setting.upsert({
          where: { key },
          update: { value: stringValue, type },
          create: { key, value: stringValue, type },
        });
      });

      await Promise.all(updatePromises);

      res.json({
        success: true,
        message: 'Settings updated successfully',
      });
    } catch (error) {
      return next(new AppError('Failed to update settings', 500));
    }
  })
);

// Get specific setting by key (Admin only)
router.get(
  '/:key',
  authenticate,
  authorize('ADMIN'),
  asyncHandler(async (req: AuthenticatedRequest, res, next) => {
    const { key } = req.params;

    const setting = await prisma.setting.findUnique({
      where: { key },
    });

    if (!setting) {
      return next(new AppError('Setting not found', 404));
    }

    let value;
    switch (setting.type) {
      case 'NUMBER':
        value = parseFloat(setting.value);
        break;
      case 'BOOLEAN':
        value = setting.value === 'true';
        break;
      case 'JSON':
        try {
          value = JSON.parse(setting.value);
        } catch {
          value = setting.value;
        }
        break;
      default:
        value = setting.value;
    }

    res.json({
      success: true,
      data: { key: setting.key, value },
    });
  })
);

// Update specific setting (Admin only)
router.put(
  '/:key',
  authenticate,
  authorize('ADMIN'),
  [
    body('value').exists(),
  ],
  asyncHandler(async (req: AuthenticatedRequest, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError('Invalid input data', 400));
    }

    const { key } = req.params;
    const { value } = req.body;

    let stringValue: string;
    let type: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON' = 'STRING';

    if (typeof value === 'number') {
      stringValue = value.toString();
      type = 'NUMBER';
    } else if (typeof value === 'boolean') {
      stringValue = value.toString();
      type = 'BOOLEAN';
    } else if (typeof value === 'object') {
      stringValue = JSON.stringify(value);
      type = 'JSON';
    } else {
      stringValue = String(value);
      type = 'STRING';
    }

    try {
      const setting = await prisma.setting.upsert({
        where: { key },
        update: { value: stringValue, type },
        create: { key, value: stringValue, type },
      });

      res.json({
        success: true,
        data: { setting },
      });
    } catch (error) {
      return next(new AppError('Failed to update setting', 500));
    }
  })
);

// Delete setting (Admin only)
router.delete(
  '/:key',
  authenticate,
  authorize('ADMIN'),
  asyncHandler(async (req: AuthenticatedRequest, res, next) => {
    const { key } = req.params;

    const setting = await prisma.setting.findUnique({
      where: { key },
    });

    if (!setting) {
      return next(new AppError('Setting not found', 404));
    }

    await prisma.setting.delete({
      where: { key },
    });

    res.json({
      success: true,
      message: 'Setting deleted successfully',
    });
  })
);

export { router as settingsRoutes }; 