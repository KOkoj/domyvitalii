// @ts-nocheck
import { Router } from 'express';
import { body, query, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import slugify from 'slugify';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { authenticate, authorize, optionalAuth, AuthenticatedRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

/**
 * @swagger
 * /api/properties:
 *   get:
 *     summary: Get all properties with filtering and pagination
 *     tags: [Properties]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *         description: Number of items per page
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Property type filter
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Property status filter
 *       - in: query
 *         name: region
 *         schema:
 *           type: string
 *         description: Region filter
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price filter
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price filter
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title and description
 *     responses:
 *       200:
 *         description: Properties retrieved successfully
 */
router.get(
  '/',
  optionalAuth,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('minPrice').optional().isNumeric(),
    query('maxPrice').optional().isNumeric(),
  ],
  asyncHandler(async (req: AuthenticatedRequest, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError('Invalid query parameters', 400));
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const skip = (page - 1) * limit;

    // Build filters
    const where: any = {};
    
    // Only show published properties for non-authenticated users
    if (!req.user) {
      where.isPublished = true;
      where.status = 'AVAILABLE';
    }

    if (req.query.type) {
      where.type = req.query.type;
    }

    if (req.query.status && req.user) {
      where.status = req.query.status;
    }

    if (req.query.region) {
      where.region = {
        contains: req.query.region as string,
        mode: 'insensitive',
      };
    }

    if (req.query.minPrice || req.query.maxPrice) {
      where.price = {};
      if (req.query.minPrice) {
        where.price.gte = parseInt(req.query.minPrice as string) * 100; // Convert to cents
      }
      if (req.query.maxPrice) {
        where.price.lte = parseInt(req.query.maxPrice as string) * 100; // Convert to cents
      }
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
  })
);

/**
 * @swagger
 * /api/properties/{id}:
 *   get:
 *     summary: Get property by ID
 *     tags: [Properties]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *     responses:
 *       200:
 *         description: Property retrieved successfully
 *       404:
 *         description: Property not found
 */
router.get(
  '/:id',
  optionalAuth,
  asyncHandler(async (req: AuthenticatedRequest, res, next) => {
    const { id } = req.params;

    const where: any = {
      OR: [
        { id: id },
        { slug: id }
      ]
    };
    
    // Only show published properties for non-authenticated users
    if (!req.user) {
      where.isPublished = true;
    }

    const property = await prisma.property.findFirst({
      where,
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!property) {
      return next(new AppError('Property not found', 404));
    }

    // Format property for response
    const formattedProperty = {
      ...property,
      price: property.price / 100, // Convert back to euros
    };

    res.json({
      success: true,
      data: { property: formattedProperty },
    });
  })
);

/**
 * @swagger
 * /api/properties:
 *   post:
 *     summary: Create new property (Admin/Manager/Employee)
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - price
 *               - type
 *               - address
 *               - city
 *               - region
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               type:
 *                 type: string
 *                 enum: [APARTMENT, HOUSE, VILLA, LAND, COMMERCIAL, FARMHOUSE, CASTLE, OTHER]
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               region:
 *                 type: string
 *     responses:
 *       201:
 *         description: Property created successfully
 *       400:
 *         description: Invalid input data
 *       403:
 *         description: Access denied
 */
router.post(
  '/',
  authenticate,
  authorize('ADMIN', 'MANAGER', 'EMPLOYEE'),
  [
    body('title').notEmpty().trim(),
    body('description').notEmpty().trim(),
    body('price').isNumeric().custom(value => value > 0),
    body('type').isIn(['APARTMENT', 'HOUSE', 'VILLA', 'LAND', 'COMMERCIAL', 'FARMHOUSE', 'CASTLE', 'OTHER']),
    body('address').notEmpty().trim(),
    body('city').notEmpty().trim(),
    body('region').notEmpty().trim(),
    body('bedrooms').optional().isInt({ min: 0 }),
    body('bathrooms').optional().isInt({ min: 0 }),
    body('area').optional().isNumeric(),
    body('lotSize').optional().isNumeric(),
    body('yearBuilt').optional().isInt({ min: 1800, max: new Date().getFullYear() }),
    body('features').optional().isArray(),
  ],
  asyncHandler(async (req: AuthenticatedRequest, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError('Invalid input data', 400));
    }

    const {
      title,
      description,
      price,
      type,
      address,
      city,
      region,
      postalCode,
      bedrooms,
      bathrooms,
      area,
      lotSize,
      yearBuilt,
      features,
      metaTitle,
      metaDescription,
    } = req.body;

    // Generate slug
    const baseSlug = slugify(title, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;

    // Ensure unique slug
    while (await prisma.property.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const property = await prisma.property.create({
      data: {
        title,
        slug,
        description,
        price: Math.round(price * 100), // Convert to cents
        type,
        address,
        city,
        region,
        postalCode,
        bedrooms,
        bathrooms,
        area,
        lotSize,
        yearBuilt,
        features: features || [],
        metaTitle: metaTitle || title,
        metaDescription: metaDescription || description.substring(0, 160),
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

    // Format property for response
    const formattedProperty = {
      ...property,
      price: property.price / 100, // Convert back to euros
    };

    res.status(201).json({
      success: true,
      data: { property: formattedProperty },
    });
  })
);

/**
 * @swagger
 * /api/properties/{id}:
 *   put:
 *     summary: Update property (Admin/Manager/Employee)
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *     responses:
 *       200:
 *         description: Property updated successfully
 *       404:
 *         description: Property not found
 *       403:
 *         description: Access denied
 */
router.put(
  '/:id',
  authenticate,
  authorize('ADMIN', 'MANAGER', 'EMPLOYEE'),
  [
    body('title').optional().notEmpty().trim(),
    body('description').optional().notEmpty().trim(),
    body('price').optional().isNumeric().custom(value => value > 0),
    body('type').optional().isIn(['APARTMENT', 'HOUSE', 'VILLA', 'LAND', 'COMMERCIAL', 'FARMHOUSE', 'CASTLE', 'OTHER']),
  ],
  asyncHandler(async (req: AuthenticatedRequest, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError('Invalid input data', 400));
    }

    const { id } = req.params;
    const updateData: any = { ...req.body };

    // Convert price to cents if provided
    if (updateData.price) {
      updateData.price = Math.round(updateData.price * 100);
    }

    // Update slug if title changed
    if (updateData.title) {
      const baseSlug = slugify(updateData.title, { lower: true, strict: true });
      let slug = baseSlug;
      let counter = 1;

      // Ensure unique slug (excluding current property)
      while (await prisma.property.findFirst({ 
        where: { 
          slug,
          NOT: { 
          OR: [
            { id: id },
            { slug: baseSlug }
          ]
        }
        } 
      })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      updateData.slug = slug;
    }

    const property = await prisma.property.update({
      where: { id },
      data: updateData,
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Format property for response
    const formattedProperty = {
      ...property,
      price: property.price / 100, // Convert back to euros
    };

    res.json({
      success: true,
      data: { property: formattedProperty },
    });
  })
);

/**
 * @swagger
 * /api/properties/{id}:
 *   delete:
 *     summary: Delete property (Admin/Manager)
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *     responses:
 *       200:
 *         description: Property deleted successfully
 *       404:
 *         description: Property not found
 *       403:
 *         description: Access denied
 */
router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN', 'MANAGER'),
  asyncHandler(async (req: AuthenticatedRequest, res, next) => {
    const { id } = req.params;

    const property = await prisma.property.findUnique({
      where: { id },
    });

    if (!property) {
      return next(new AppError('Property not found', 404));
    }

    await prisma.property.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Property deleted successfully',
    });
  })
);

export { router as propertyRoutes }; 