import { Router, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { authenticate, authorize, AuthenticatedRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get dashboard statistics
router.get(
  '/stats',
  authenticate,
  authorize('ADMIN', 'MANAGER'),
  asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const [
        totalProperties,
        publishedProperties,
        totalBlogPosts,
        publishedBlogPosts,
        totalInquiries,
        newInquiries,
        totalUsers,
        activeUsers,
        newsletterSubscribers,
      ] = await Promise.all([
        prisma.property.count(),
        prisma.property.count({ where: { isPublished: true } }),
        prisma.blogPost.count(),
        prisma.blogPost.count({ where: { isPublished: true } }),
        prisma.inquiry.count(),
        prisma.inquiry.count({ where: { status: 'NEW' } }),
        prisma.user.count(),
        prisma.user.count({ where: { isActive: true } }),
        prisma.newsletterSubscriber.count({ where: { isActive: true } }),
      ]);

      // Get recent activities
      const recentProperties = await prisma.property.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          createdAt: true,
          author: {
            select: { name: true },
          },
        },
      });

      const recentBlogPosts = await prisma.blogPost.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          createdAt: true,
          author: {
            select: { name: true },
          },
        },
      });

      const recentInquiries = await prisma.inquiry.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          type: true,
          status: true,
          createdAt: true,
        },
      });

      res.json({
        success: true,
        data: {
          stats: {
            properties: {
              total: totalProperties,
              published: publishedProperties,
              draft: totalProperties - publishedProperties,
            },
            blogPosts: {
              total: totalBlogPosts,
              published: publishedBlogPosts,
              draft: totalBlogPosts - publishedBlogPosts,
            },
            inquiries: {
              total: totalInquiries,
              new: newInquiries,
              processed: totalInquiries - newInquiries,
            },
            users: {
              total: totalUsers,
              active: activeUsers,
              inactive: totalUsers - activeUsers,
            },
            newsletter: {
              subscribers: newsletterSubscribers,
            },
          },
          recent: {
            properties: recentProperties,
            blogPosts: recentBlogPosts,
            inquiries: recentInquiries,
          },
        },
      });
    } catch (error) {
      return next(new AppError('Failed to fetch dashboard stats', 500));
    }
  })
);

// Get analytics data
router.get(
  '/analytics',
  authenticate,
  authorize('ADMIN', 'MANAGER'),
  asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      // Get monthly data for the last 12 months
      const monthlyData = await prisma.$queryRaw`
        SELECT 
          EXTRACT(YEAR FROM created_at) as year,
          EXTRACT(MONTH FROM created_at) as month,
          COUNT(*) as count,
          'properties' as type
        FROM properties 
        WHERE created_at >= NOW() - INTERVAL '12 months'
        GROUP BY EXTRACT(YEAR FROM created_at), EXTRACT(MONTH FROM created_at)
        
        UNION ALL
        
        SELECT 
          EXTRACT(YEAR FROM created_at) as year,
          EXTRACT(MONTH FROM created_at) as month,
          COUNT(*) as count,
          'blog_posts' as type
        FROM blog_posts 
        WHERE created_at >= NOW() - INTERVAL '12 months'
        GROUP BY EXTRACT(YEAR FROM created_at), EXTRACT(MONTH FROM created_at)
        
        UNION ALL
        
        SELECT 
          EXTRACT(YEAR FROM created_at) as year,
          EXTRACT(MONTH FROM created_at) as month,
          COUNT(*) as count,
          'inquiries' as type
        FROM inquiries 
        WHERE created_at >= NOW() - INTERVAL '12 months'
        GROUP BY EXTRACT(YEAR FROM created_at), EXTRACT(MONTH FROM created_at)
        
        ORDER BY year, month;
      `;

      // Get property types distribution
      const propertyTypes = await prisma.property.groupBy({
        by: ['type'],
        _count: { type: true },
        where: { isPublished: true },
      });

      // Get blog posts by family
      const blogFamilies = await prisma.blogPost.groupBy({
        by: ['family'],
        _count: { family: true },
        where: { isPublished: true },
      });

      // Get inquiry types
      const inquiryTypes = await prisma.inquiry.groupBy({
        by: ['type'],
        _count: { type: true },
      });

      res.json({
        success: true,
        data: {
          monthly: monthlyData,
          distribution: {
            propertyTypes: propertyTypes.map(item => ({
              type: item.type,
              count: item._count.type,
            })),
            blogFamilies: blogFamilies.map(item => ({
              family: item.family,
              count: item._count.family,
            })),
            inquiryTypes: inquiryTypes.map(item => ({
              type: item.type,
              count: item._count.type,
            })),
          },
        },
      });
    } catch (error) {
      return next(new AppError('Failed to fetch analytics data', 500));
    }
  })
);

// Get dashboard metrics
router.get(
  '/metrics',
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get today's inquiries
    const todayInquiries = await prisma.inquiry.count({
      where: {
        createdAt: {
          gte: new Date(today.toDateString())
        }
      }
    });

    // Get yesterday's inquiries for trend
    const yesterdayInquiries = await prisma.inquiry.count({
      where: {
        createdAt: {
          gte: new Date(yesterday.toDateString()),
          lt: new Date(today.toDateString())
        }
      }
    });

    // Get active properties
    const activeProperties = await prisma.property.count({
      where: {
        status: 'AVAILABLE',
        isPublished: true
      }
    });

    // Get week ago active properties for trend
    const weekAgoActiveProperties = await prisma.property.count({
      where: {
        status: 'AVAILABLE',
        isPublished: true,
        createdAt: {
          lte: weekAgo
        }
      }
    });

    // Get draft blog posts
    const draftBlogPosts = await prisma.blogPost.count({
      where: {
        isPublished: false
      }
    });

    // Get total views this week (mock calculation)
    const totalViews = await prisma.property.count({
      where: {
        updatedAt: {
          gte: weekAgo
        }
      }
    });

    // Get recent activity
    const recentActivity = await getRecentActivity();

    // Calculate trends
    const inquiriesTrend = yesterdayInquiries > 0 
      ? ((todayInquiries - yesterdayInquiries) / yesterdayInquiries) * 100 
      : 0;
    
    const propertiesTrend = weekAgoActiveProperties > 0
      ? ((activeProperties - weekAgoActiveProperties) / weekAgoActiveProperties) * 100
      : 0;

    res.json({
      success: true,
      data: {
        todayInquiries,
        activeProperties,
        draftBlogPosts,
        totalViews: Math.floor(Math.random() * 1000) + 500, // Mock total views
        recentActivity,
        inquiriesTrend: Math.round(inquiriesTrend * 10) / 10,
        propertiesTrend: Math.round(propertiesTrend * 10) / 10
      }
    });
  })
);

// Get recent activity
router.get(
  '/activity',
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const activities = await getRecentActivity();
    
    res.json({
      success: true,
      data: { activities }
    });
  })
);

// Get property analytics
router.get(
  '/analytics/properties',
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const statusCounts = await prisma.property.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });

    const typeCounts = await prisma.property.groupBy({
      by: ['type'],
      _count: {
        type: true
      }
    });

    const regionCounts = await prisma.property.groupBy({
      by: ['region'],
      _count: {
        region: true
      },
      take: 10,
      orderBy: {
        _count: {
          region: 'desc'
        }
      }
    });

    res.json({
      success: true,
      data: {
        statusCounts,
        typeCounts,
        regionCounts
      }
    });
  })
);

// Bulk property operations
router.post(
  '/bulk/properties',
  authenticate,
  authorize('ADMIN'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { propertyIds, action, newStatus } = req.body;

    if (!propertyIds || !Array.isArray(propertyIds) || propertyIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Property IDs are required'
      });
    }

    let result;

    switch (action) {
      case 'publish':
        result = await prisma.property.updateMany({
          where: {
            id: {
              in: propertyIds
            }
          },
          data: {
            isPublished: true,
            publishedAt: new Date()
          }
        });
        break;

      case 'unpublish':
        result = await prisma.property.updateMany({
          where: {
            id: {
              in: propertyIds
            }
          },
          data: {
            isPublished: false
          }
        });
        break;

      case 'changeStatus':
        result = await prisma.property.updateMany({
          where: {
            id: {
              in: propertyIds
            }
          },
          data: {
            status: newStatus
          }
        });
        break;

      case 'delete':
        // First delete related images
        await prisma.propertyImage.deleteMany({
          where: {
            propertyId: {
              in: propertyIds
            }
          }
        });

        // Then delete properties
        result = await prisma.property.deleteMany({
          where: {
            id: {
              in: propertyIds
            }
          }
        });
        break;

      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid action'
        });
    }

    res.json({
      success: true,
      data: {
        affected: result.count,
        action
      }
    });
  })
);

// Helper function to get recent activity
async function getRecentActivity() {
  const activities = [];

  // Get recent property updates
  const recentProperties = await prisma.property.findMany({
    take: 5,
    orderBy: {
      updatedAt: 'desc'
    },
    select: {
      id: true,
      title: true,
      status: true,
      updatedAt: true,
      author: {
        select: {
          name: true
        }
      }
    }
  });

  // Get recent blog posts
  const recentBlogs = await prisma.blogPost.findMany({
    take: 3,
    orderBy: {
      updatedAt: 'desc'
    },
    select: {
      id: true,
      title: true,
      isPublished: true,
      updatedAt: true,
      author: {
        select: {
          name: true
        }
      }
    }
  });

  // Get recent inquiries
  const recentInquiries = await prisma.inquiry.findMany({
    take: 3,
    orderBy: {
      createdAt: 'desc'
    },
    select: {
      id: true,
      type: true,
      name: true,
      createdAt: true,
      property: {
        select: {
          title: true
        }
      }
    }
  });

  // Format activities
  recentProperties.forEach(property => {
    activities.push({
      id: property.id,
      type: 'property',
      action: 'updated',
      description: `Updated "${property.title}"`,
      timestamp: property.updatedAt.toISOString(),
      user: property.author.name,
      link: `/properties/${property.id}/edit`
    });
  });

  recentBlogs.forEach(blog => {
    activities.push({
      id: blog.id,
      type: 'blog',
      action: blog.isPublished ? 'published' : 'drafted',
      description: `${blog.isPublished ? 'Published' : 'Drafted'} "${blog.title}"`,
      timestamp: blog.updatedAt.toISOString(),
      user: blog.author.name,
      link: `/blog/${blog.id}/edit`
    });
  });

  recentInquiries.forEach(inquiry => {
    activities.push({
      id: inquiry.id,
      type: 'inquiry',
      action: 'received',
      description: inquiry.property 
        ? `New inquiry from ${inquiry.name} for "${inquiry.property.title}"`
        : `New ${inquiry.type} inquiry from ${inquiry.name}`,
      timestamp: inquiry.createdAt.toISOString(),
      link: '/inquiries'
    });
  });

  // Sort by timestamp and return most recent
  return activities
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);
}

export { router as dashboardRoutes }; 