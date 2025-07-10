import { Router } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { authenticate, authorize, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = process.env.ALLOWED_FILE_TYPES?.split(',') || [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/jpg',
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  },
});

// Upload single image
router.post(
  '/image',
  authenticate,
  authorize('ADMIN', 'MANAGER', 'EMPLOYEE'),
  upload.single('image'),
  asyncHandler(async (req: AuthenticatedRequest, res, next) => {
    if (!req.file) {
      return next(new AppError('No file uploaded', 400));
    }

    try {
      // Upload to Cloudinary
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            resource_type: 'image',
            folder: 'domy-v-italii',
            transformation: [
              { width: 1920, height: 1080, crop: 'limit', quality: 'auto' },
            ],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(req.file!.buffer);
      });

      const uploadResult = result as any;

      res.json({
        success: true,
        data: {
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          width: uploadResult.width,
          height: uploadResult.height,
        },
      });
    } catch (error) {
      return next(new AppError('Failed to upload image', 500));
    }
  })
);

// Upload multiple images
router.post(
  '/images',
  authenticate,
  authorize('ADMIN', 'MANAGER', 'EMPLOYEE'),
  upload.array('images', 10),
  asyncHandler(async (req: AuthenticatedRequest, res, next) => {
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      return next(new AppError('No files uploaded', 400));
    }

    try {
      const uploadPromises = files.map((file) => {
        return new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            {
              resource_type: 'image',
              folder: 'domy-v-italii',
              transformation: [
                { width: 1920, height: 1080, crop: 'limit', quality: 'auto' },
              ],
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          ).end(file.buffer);
        });
      });

      const results = await Promise.all(uploadPromises);

      const uploadedImages = results.map((result: any) => ({
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
      }));

      res.json({
        success: true,
        data: { images: uploadedImages },
      });
    } catch (error) {
      return next(new AppError('Failed to upload images', 500));
    }
  })
);

// Delete image from Cloudinary
router.delete(
  '/image/:publicId',
  authenticate,
  authorize('ADMIN', 'MANAGER', 'EMPLOYEE'),
  asyncHandler(async (req: AuthenticatedRequest, res, next) => {
    const { publicId } = req.params;

    try {
      await cloudinary.uploader.destroy(publicId);

      res.json({
        success: true,
        message: 'Image deleted successfully',
      });
    } catch (error) {
      return next(new AppError('Failed to delete image', 500));
    }
  })
);

export { router as uploadRoutes }; 