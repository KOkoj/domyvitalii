// @ts-nocheck
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get all properties with filtering and pagination
router.get('/', async (req: any, res: any) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const skip = (page - 1) * limit;

    // Build filters
    const where: any = {};

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
          description: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        {
          city: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
      ];
    }

    // Get properties with pagination
    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        skip,
        take: limit,
        include: {
          images: {
            where: { isPrimary: true },
            take: 1,
          },
          author: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.property.count({ where }),
    ]);

    // Format properties for response
    const formattedProperties = properties.map(property => ({
      ...property,
      price: property.price / 100, // Convert back to euros
      primaryImage: property.images[0]?.url || null,
    }));

    res.json({
      success: true,
      data: {
        data: formattedProperties,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Properties API error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

export { router as propertiesRoutes }; 