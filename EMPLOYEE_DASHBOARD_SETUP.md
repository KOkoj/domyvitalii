# 🏡 Employee Dashboard Setup Guide
## Domy v Italii - Website Management System

This guide will help you set up and use the complete employee dashboard system for managing your Italian real estate website.

## 🚀 Features Overview

### Dashboard Overview
- **Real-time Metrics**: Today's inquiries, active properties, blog drafts, weekly views
- **Recent Activity Feed**: Latest updates across properties, blog posts, and inquiries
- **Performance Trends**: Visual indicators showing growth/decline in key metrics

### Quick Actions & Productivity
- **Fast Property Creation**: One-click property listing with templates
- **Bulk Operations**: Publish/unpublish multiple properties simultaneously
- **Drag & Drop Image Upload**: Bulk image upload for properties
- **Keyboard Shortcuts**: ⌘+P (New Property), ⌘+B (New Blog), ⌘+U (Bulk Ops)

### Property Management Tools
- **Status Quick-Toggle**: Change property status directly from list view
- **Smart Filters**: Filter by status, type, region, price range
- **Performance Analytics**: Views, inquiries, and engagement metrics
- **SEO Helper Tools**: Auto-generate meta descriptions and optimize content

### Content Creation & Blog Management
- **Blog Post Templates**: Pre-designed templates for different content types
- **SEO Suggestions**: Automated recommendations for content optimization
- **Content Calendar**: Schedule posts and track publication timeline
- **Analytics Integration**: Track post performance and reader engagement

### Customer Communication
- **Inquiry Management**: Quick responses with pre-built templates
- **Lead Tracking**: Follow up reminders and communication history
- **Bulk Email Tools**: Send updates to multiple customers
- **Response Templates**: Save time with common inquiry responses

### Workflow Efficiency
- **Recent Items**: Quick access to recently edited content
- **Saved Searches**: Store frequently used search queries
- **Productivity Shortcuts**: Automate common tasks
- **Mobile-Responsive**: Manage on-the-go from any device

## 📋 Installation Instructions

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database
- Git for version control

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your settings:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/domy_italii"
   JWT_SECRET="your-super-secret-jwt-key"
   JWT_REFRESH_SECRET="your-refresh-secret-key"
   BCRYPT_SALT_ROUNDS=12
   NODE_ENV=development
   PORT=3001
   ALLOWED_ORIGINS="http://localhost:3000"
   ```

4. **Set up database**
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   npx prisma db seed
   ```

5. **Start backend server**
   ```bash
   npm run dev
   ```

### Frontend Dashboard Setup

1. **Navigate to admin dashboard directory**
   ```bash
   cd admin-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install required UI dependencies**
   ```bash
   npm install @heroicons/react react-router-dom
   npm install -D @types/react @types/react-dom
   ```

4. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file:
   ```env
   VITE_API_BASE_URL=http://localhost:3001/api
   VITE_APP_NAME="Domy v Italii Dashboard"
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## 🎯 Usage Guide

### Getting Started

1. **Login**: Use your employee credentials to access the dashboard
   - Default demo: `admin@example.com` / `password`

2. **Dashboard Overview**: The main dashboard shows:
   - Today's new inquiries count
   - Active property listings
   - Draft blog posts needing attention
   - Weekly website views

### Property Management Workflow

1. **Quick Property Creation**:
   - Click "🏠 Add Property" or use ⌘+P
   - Use property templates for faster creation
   - Drag & drop multiple images at once

2. **Bulk Operations**:
   - Select multiple properties using checkboxes
   - Use bulk actions: Publish, Unpublish, Change Status, Export
   - Generate SEO descriptions for multiple properties

3. **Status Management**:
   - Use quick-status dropdowns in property list
   - Filter by status: Available, Sold, Under Contract, etc.
   - Track performance with built-in analytics

### Content Creation

1. **Blog Post Creation**:
   - Use "📝 New Post" or ⌘+B shortcut
   - Choose from templates: Property Review, Travel Guide, Market Update
   - Get real-time SEO suggestions

2. **Content Optimization**:
   - Run automated SEO audits
   - Generate meta descriptions
   - Optimize images for faster loading
   - Add internal links to properties

### Customer Management

1. **Inquiry Handling**:
   - View new inquiries on dashboard
   - Use response templates for common questions
   - Set follow-up reminders
   - Track inquiry-to-sale conversion

2. **Communication Tools**:
   - Quick reply system
   - Bulk email capabilities
   - Customer communication history
   - Lead scoring and prioritization

## 🛠️ Productivity Features

### Keyboard Shortcuts
- `⌘ + P` - New Property
- `⌘ + B` - New Blog Post  
- `⌘ + T` - Property Templates
- `⌘ + U` - Bulk Operations
- `⌘ + S` - Generate SEO
- `⌘ + E` - Export Data
- `⌘ + L` - Check Links

### Quick Filters
- **Properties**: Draft, Available, Under Contract, Sold, High Interest
- **Blog**: Published, Draft, Scheduled, Needs SEO
- **Inquiries**: New, Responded, Converted, Follow-up

### Saved Searches
- Luxury Villas (€500K+)
- Tuscan Properties
- Coastal Properties
- Historic Buildings

## 📊 Analytics & Reporting

### Dashboard Metrics
- Real-time inquiry tracking
- Property view analytics
- Blog post performance
- Conversion tracking

### Performance Monitoring
- Property views and inquiries
- Blog post engagement
- SEO performance scores
- Customer interaction tracking

### Export Capabilities
- Property data CSV export
- Inquiry reports
- Blog analytics
- Customer communication logs

## 🔧 Configuration

### User Roles
- **ADMIN**: Full access to all features
- **MANAGER**: Property and blog management
- **EMPLOYEE**: Content creation and customer service

### Customization Options
- Dashboard layout preferences
- Notification settings
- Quick action customization
- Filter and search preferences

## 🆘 Troubleshooting

### Common Issues

1. **Cannot connect to backend**:
   - Check if backend server is running on port 3001
   - Verify DATABASE_URL in backend/.env
   - Ensure PostgreSQL is running

2. **Login not working**:
   - Check JWT_SECRET is set in backend/.env
   - Verify user exists in database
   - Clear browser cache/localStorage

3. **Images not uploading**:
   - Check file permissions on uploads directory
   - Verify file size limits
   - Ensure proper CORS configuration

### Support

For technical support:
- Check console logs for error messages
- Verify all environment variables are set
- Ensure database migrations are up to date
- Contact development team with error details

## 🚀 Production Deployment

### Backend Deployment
1. Set `NODE_ENV=production`
2. Use production database URL
3. Set secure JWT secrets
4. Configure proper CORS origins
5. Set up SSL certificates

### Frontend Deployment
1. Build production assets: `npm run build`
2. Configure production API URL
3. Set up web server (nginx/apache)
4. Enable gzip compression
5. Set up CDN for static assets

### Security Considerations
- Use strong JWT secrets
- Enable rate limiting
- Set up HTTPS
- Regular security updates
- Database backup strategy

---

## 📝 Quick Start Checklist

- [ ] Backend server running on port 3001
- [ ] Database connected and migrated
- [ ] Frontend dashboard running on port 3000
- [ ] Environment variables configured
- [ ] Test login working
- [ ] Image upload functional
- [ ] All keyboard shortcuts working
- [ ] Bulk operations tested

**You're ready to manage your Italian real estate website efficiently! 🎉** 