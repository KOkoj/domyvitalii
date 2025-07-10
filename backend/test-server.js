const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));

app.use(express.json());

// Mock data
const mockProperties = [
  {
    id: '1',
    title: 'Luxusní vila v Toskánsku',
    slug: 'luxusni-vila-v-toskansku',
    description: 'Krásná vila s výhledem na vinice v srdci Toskánska.',
    price: 85000000,
    type: 'VILLA',
    status: 'AVAILABLE',
    bedrooms: 4,
    bathrooms: 3,
    area: 280.5,
    address: 'Via del Chianti 123, Greve in Chianti',
    city: 'Greve in Chianti',
    region: 'Toskánsko',
    country: 'Italy',
    isPublished: true,
    publishedAt: new Date('2024-01-15').toISOString(),
    createdAt: new Date('2024-01-10').toISOString(),
    views: 234,
    author: { name: 'Admin User' }
  },
  {
    id: '2',
    title: 'Moderní apartmán v Římě',
    slug: 'moderni-apartman-v-rime',
    description: 'Stylový apartmán v centru Říma, blízko Kolosea.',
    price: 45000000,
    type: 'APARTMENT',
    status: 'UNDER_CONTRACT',
    bedrooms: 2,
    bathrooms: 2,
    area: 95,
    address: 'Via dei Fori Imperiali 45, Roma',
    city: 'Roma',
    region: 'Lazio',
    country: 'Italy',
    isPublished: true,
    publishedAt: new Date('2024-01-20').toISOString(),
    createdAt: new Date('2024-01-18').toISOString(),
    views: 156,
    author: { name: 'Admin User' }
  },
  {
    id: '3',
    title: 'Historický dům ve Florencii',
    slug: 'historicky-dum-ve-florencii',
    description: 'Nádherný renesanční dům v historickém centru Florencie.',
    price: 120000000,
    type: 'HOUSE',
    status: 'AVAILABLE',
    bedrooms: 5,
    bathrooms: 4,
    area: 320,
    address: 'Via del Corso 67, Firenze',
    city: 'Firenze',
    region: 'Toskánsko',
    country: 'Italy',
    isPublished: true,
    publishedAt: new Date('2024-02-01').toISOString(),
    createdAt: new Date('2024-01-28').toISOString(),
    views: 89,
    author: { name: 'Admin User' }
  }
];

const mockBlogPosts = [
  {
    id: '1',
    title: 'Průvodce nákupem nemovitosti v Italii',
    slug: 'pruvodce-nakupem-nemovitosti-v-italii',
    excerpt: 'Vše, co potřebujete vědět o koupi nemovitosti v Italii.',
    content: '<p>Kompletní průvodce nákupem nemovitosti v Italii...</p>',
    family: 'PROPERTY',
    topic: 'Právo',
    isPublished: true,
    publishedAt: new Date('2024-02-10').toISOString(),
    createdAt: new Date('2024-02-08').toISOString(),
    readTime: 8,
    views: 456,
    author: { name: 'Admin User' }
  },
  {
    id: '2',
    title: 'Toskánsko: Srdce italské kultury',
    slug: 'toskansko-srdce-italske-kultury',
    excerpt: 'Objevte krásy Toskánska - regionu plného kultury a historie.',
    content: '<p>Toskánsko není jen region - je to symbol italského životního stylu...</p>',
    family: 'TRIVIA',
    topic: 'Kultura',
    isPublished: true,
    publishedAt: new Date('2024-02-15').toISOString(),
    createdAt: new Date('2024-02-12').toISOString(),
    readTime: 6,
    views: 234,
    author: { name: 'Admin User' }
  },
  {
    id: '3',
    title: 'Investice do italských nemovitostí v roce 2024',
    slug: 'investice-do-italskych-nemovitosti-2024',
    excerpt: 'Aktuální trendy a příležitosti na italském realitním trhu.',
    content: '<p>Italský realitní trh nabízí zajímavé příležitosti...</p>',
    family: 'PROPERTY',
    topic: 'Investice',
    isPublished: false,
    publishedAt: null,
    createdAt: new Date('2024-02-20').toISOString(),
    readTime: 10,
    views: 0,
    author: { name: 'Admin User' }
  }
];

const mockUsers = [
  {
    id: '1',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'ADMIN',
    isActive: true,
    createdAt: new Date('2024-01-01').toISOString()
  },
  {
    id: '2',
    email: 'manager@example.com',
    name: 'Jan Novák',
    role: 'MANAGER',
    isActive: true,
    createdAt: new Date('2024-01-15').toISOString()
  },
  {
    id: '3',
    email: 'employee@example.com',
    name: 'Marie Svobodová',
    role: 'EMPLOYEE',
    isActive: true,
    createdAt: new Date('2024-02-01').toISOString()
  }
];

const mockInquiries = [
  {
    id: '1',
    name: 'Petr Dvořák',
    email: 'petr.dvorak@email.com',
    phone: '+420 123 456 789',
    message: 'Zajímá mě vila v Toskánsku. Můžeme si domluvit prohlídku?',
    type: 'PROPERTY',
    status: 'NEW',
    propertyId: '1',
    property: { title: 'Luxusní vila v Toskánsku' },
    createdAt: new Date('2024-02-25').toISOString()
  },
  {
    id: '2',
    name: 'Anna Nováková',
    email: 'anna.novakova@email.com',
    phone: '+420 987 654 321',
    message: 'Hledám apartmán v centru Říma do 500 000 EUR.',
    type: 'GENERAL',
    status: 'IN_PROGRESS',
    propertyId: null,
    property: null,
    createdAt: new Date('2024-02-24').toISOString()
  },
  {
    id: '3',
    name: 'Martin Černý',
    email: 'martin.cerny@email.com',
    phone: null,
    message: 'Chtěl bych se přihlásit k odběru newsletteru.',
    type: 'NEWSLETTER',
    status: 'RESPONDED',
    propertyId: null,
    property: null,
    createdAt: new Date('2024-02-23').toISOString()
  }
];

// Test endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend server is running!' });
});

// Dashboard metrics endpoint (what the frontend expects)
app.get('/api/dashboard/metrics', (req, res) => {
  res.json({
    success: true,
    data: {
      todayInquiries: mockInquiries.filter(i => {
        const today = new Date();
        const inquiryDate = new Date(i.createdAt);
        return inquiryDate.toDateString() === today.toDateString();
      }).length,
      activeProperties: mockProperties.filter(p => p.status === 'AVAILABLE').length,
      draftBlogPosts: mockBlogPosts.filter(p => !p.isPublished).length,
      totalViews: mockProperties.reduce((sum, p) => sum + p.views, 0),
      recentActivity: [
        {
          id: '1',
          type: 'property_added',
          message: 'Nová nemovitost přidána: Historický dům ve Florencii',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          user: 'Admin User'
        },
        {
          id: '2',
          type: 'inquiry_received',
          message: 'Nová poptávka od: Petr Dvořák',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          user: 'Petr Dvořák'
        },
        {
          id: '3',
          type: 'blog_published',
          message: 'Blog publikován: Toskánsko: Srdce italské kultury',
          timestamp: new Date(Date.now() - 10800000).toISOString(),
          user: 'Admin User'
        },
        {
          id: '4',
          type: 'property_updated',
          message: 'Nemovitost aktualizována: Moderní apartmán v Římě',
          timestamp: new Date(Date.now() - 14400000).toISOString(),
          user: 'Admin User'
        },
        {
          id: '5',
          type: 'user_registered',
          message: 'Nový uživatel: Marie Svobodová',
          timestamp: new Date(Date.now() - 18000000).toISOString(),
          user: 'Admin User'
        }
      ],
      inquiriesTrend: 12.5, // percentage increase
      propertiesTrend: 8.3  // percentage increase
    }
  });
});

// Enhanced dashboard data endpoint (backup/alternative)
app.get('/api/dashboard/stats', (req, res) => {
  res.json({
    success: true,
    data: {
      stats: {
        totalProperties: mockProperties.length,
        activeListings: mockProperties.filter(p => p.status === 'AVAILABLE').length,
        soldThisMonth: mockProperties.filter(p => p.status === 'SOLD').length,
        totalViews: mockProperties.reduce((sum, p) => sum + p.views, 0),
        totalUsers: mockUsers.length,
        newInquiries: mockInquiries.filter(i => i.status === 'NEW').length,
        blogPosts: mockBlogPosts.length,
        publishedPosts: mockBlogPosts.filter(p => p.isPublished).length
      },
      recentActivity: [
        {
          id: '1',
          type: 'property_added',
          message: 'Nová nemovitost přidána: Historický dům ve Florencii',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          user: 'Admin User'
        },
        {
          id: '2',
          type: 'inquiry_received',
          message: 'Nová poptávka od: Petr Dvořák',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          user: 'Petr Dvořák'
        },
        {
          id: '3',
          type: 'blog_published',
          message: 'Blog publikován: Toskánsko: Srdce italské kultury',
          timestamp: new Date(Date.now() - 10800000).toISOString(),
          user: 'Admin User'
        },
        {
          id: '4',
          type: 'property_updated',
          message: 'Nemovitost aktualizována: Moderní apartmán v Římě',
          timestamp: new Date(Date.now() - 14400000).toISOString(),
          user: 'Admin User'
        },
        {
          id: '5',
          type: 'user_registered',
          message: 'Nový uživatel: Marie Svobodová',
          timestamp: new Date(Date.now() - 18000000).toISOString(),
          user: 'Admin User'
        }
      ]
    }
  });
});

// Properties endpoints
app.get('/api/properties', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  res.json({
    success: true,
    data: {
      data: mockProperties.slice(startIndex, endIndex),
      pagination: {
        page,
        limit,
        total: mockProperties.length,
        totalPages: Math.ceil(mockProperties.length / limit)
      }
    }
  });
});

app.get('/api/properties/:id', (req, res) => {
  const property = mockProperties.find(p => p.id === req.params.id);
  if (!property) {
    return res.status(404).json({ 
      success: false,
      message: 'Property not found' 
    });
  }
  res.json({
    success: true,
    data: property
  });
});

// Blog endpoints
app.get('/api/blog', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  res.json({
    success: true,
    data: {
      data: mockBlogPosts.slice(startIndex, endIndex),
      pagination: {
        page,
        limit,
        total: mockBlogPosts.length,
        totalPages: Math.ceil(mockBlogPosts.length / limit)
      }
    }
  });
});

// Users endpoints
app.get('/api/users', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  res.json({
    success: true,
    data: {
      data: mockUsers.slice(startIndex, endIndex),
      pagination: {
        page,
        limit,
        total: mockUsers.length,
        totalPages: Math.ceil(mockUsers.length / limit)
      }
    }
  });
});

// Inquiries endpoints
app.get('/api/inquiries', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  res.json({
    success: true,
    data: {
      data: mockInquiries.slice(startIndex, endIndex),
      pagination: {
        page,
        limit,
        total: mockInquiries.length,
        totalPages: Math.ceil(mockInquiries.length / limit)
      }
    }
  });
});

app.get('/api/inquiries/:id', (req, res) => {
  const inquiry = mockInquiries.find(i => i.id === req.params.id);
  if (!inquiry) {
    return res.status(404).json({ 
      success: false,
      message: 'Inquiry not found' 
    });
  }
  res.json({
    success: true,
    data: inquiry
  });
});

app.put('/api/inquiries/:id', (req, res) => {
  const inquiry = mockInquiries.find(i => i.id === req.params.id);
  if (!inquiry) {
    return res.status(404).json({ 
      success: false,
      message: 'Inquiry not found' 
    });
  }
  
  // Update inquiry with new data
  Object.assign(inquiry, req.body);
  
  res.json({
    success: true,
    data: inquiry
  });
});

// Auth endpoints
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (email === 'admin@example.com' && password === 'password') {
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: '1',
          email: 'admin@example.com',
          name: 'Admin User',
          role: 'ADMIN',
        },
        token: 'mock-jwt-token-for-testing',
      }
    });
  } else {
    res.status(401).json({ 
      success: false,
      message: 'Invalid credentials' 
    });
  }
});

app.get('/api/auth/me', (req, res) => {
  res.json({
    success: true,
    data: {
      id: '1',
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'ADMIN',
      isActive: true,
    }
  });
});

// Settings endpoints
app.get('/api/settings', (req, res) => {
  res.json({
    success: true,
    data: [
      { key: 'site_name', value: 'Domy v Italii', type: 'STRING' },
      { key: 'site_description', value: 'Váš průvodce italskými nemovitostmi', type: 'STRING' },
      { key: 'contact_email', value: 'info@domyvitalii.cz', type: 'STRING' },
      { key: 'properties_per_page', value: '12', type: 'NUMBER' }
    ]
  });
});

// Bulk operations for testing
app.post('/api/properties/bulk', (req, res) => {
  const { action, ids } = req.body;
  res.json({ 
    message: `Bulk ${action} operation completed for ${ids.length} properties`,
    success: true 
  });
});

app.post('/api/blog/bulk', (req, res) => {
  const { action, ids } = req.body;
  res.json({ 
    message: `Bulk ${action} operation completed for ${ids.length} blog posts`,
    success: true 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Enhanced test server running on port ${PORT}`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
  console.log(`📊 Dashboard API: http://localhost:${PORT}/api/dashboard/stats`);
  console.log(`🏠 Properties: ${mockProperties.length} sample properties loaded`);
  console.log(`📝 Blog Posts: ${mockBlogPosts.length} sample blog posts loaded`);
  console.log(`👥 Users: ${mockUsers.length} sample users loaded`);
  console.log(`📧 Inquiries: ${mockInquiries.length} sample inquiries loaded`);
}); 