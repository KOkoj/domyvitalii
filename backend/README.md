# 🏠 Domy v Italii - Backend API

A comprehensive Node.js backend API for the Italian Real Estate Platform with admin dashboard capabilities.

## 🚀 Features

- **🔐 Authentication & Authorization**: JWT-based auth with role-based access control
- **🏘️ Property Management**: Full CRUD operations for real estate properties
- **📝 Blog Management**: Complete CMS for blog posts with categories and tags
- **📧 Inquiry Management**: Lead management system for customer inquiries
- **👥 User Management**: Admin dashboard for managing team members
- **📊 Analytics Dashboard**: Statistics and insights for admin users
- **☁️ File Upload**: Cloudinary integration for image management
- **⚙️ Settings Management**: Configurable application settings
- **📚 API Documentation**: Auto-generated Swagger documentation
- **🛡️ Security**: Rate limiting, input validation, error handling

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT + bcrypt
- **File Storage**: Cloudinary
- **Validation**: express-validator
- **Documentation**: Swagger/OpenAPI
- **Security**: Helmet, CORS, Rate limiting

## 📋 Prerequisites

Before running this project, make sure you have:

- **Node.js** 18+ installed
- **PostgreSQL** database (local or cloud)
- **Cloudinary** account for image storage
- **SMTP** server for email notifications (optional)

## ⚡ Quick Start

### 1. Clone and Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

Copy the environment example file:

```bash
cp env.example .env
```

Edit `.env` with your configuration:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/domy_v_italii?schema=public"

# Server
PORT=3001
NODE_ENV=development

# JWT Authentication
JWT_SECRET=your-super-secure-jwt-secret-key-here
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=your-refresh-token-secret-key
REFRESH_TOKEN_EXPIRES_IN=30d

# Admin User (for initial setup)
ADMIN_EMAIL=admin@domyvitalii.cz
ADMIN_PASSWORD=SecureAdminPassword123!
ADMIN_NAME=Admin User

# Cloudinary (Image Storage)
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Email Configuration (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@domyvitalii.cz
FROM_NAME="Domy v Italii"
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# Seed database with sample data
npm run db:seed
```

### 4. Start Development Server

```bash
npm run dev
```

The API will be available at:
- **API**: http://localhost:3001
- **Documentation**: http://localhost:3001/api/docs
- **Health Check**: http://localhost:3001/health

## 📖 API Documentation

### Authentication Endpoints

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Register new user (Admin only)
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user profile

### Property Endpoints

- `GET /api/properties` - Get all properties (with filtering)
- `GET /api/properties/:id` - Get property by ID
- `POST /api/properties` - Create new property (Auth required)
- `PUT /api/properties/:id` - Update property (Auth required)
- `DELETE /api/properties/:id` - Delete property (Admin/Manager only)

### Blog Endpoints

- `GET /api/blog` - Get all blog posts (with filtering)
- `GET /api/blog/:identifier` - Get blog post by ID or slug
- `POST /api/blog` - Create new blog post (Auth required)
- `PUT /api/blog/:id` - Update blog post (Auth required)
- `PATCH /api/blog/:id/publish` - Publish/unpublish post (Admin/Manager only)
- `DELETE /api/blog/:id` - Delete blog post (Admin/Manager only)

### User Management (Admin only)

- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `PUT /api/users/profile/me` - Update own profile

### Inquiry Management

- `GET /api/inquiries` - Get all inquiries (Admin/Manager only)
- `POST /api/inquiries` - Create new inquiry (Public)
- `PATCH /api/inquiries/:id/status` - Update inquiry status (Admin/Manager only)
- `DELETE /api/inquiries/:id` - Delete inquiry (Admin only)

### File Upload

- `POST /api/upload/image` - Upload single image (Auth required)
- `POST /api/upload/images` - Upload multiple images (Auth required)
- `DELETE /api/upload/image/:publicId` - Delete image (Auth required)

### Dashboard & Analytics

- `GET /api/dashboard/stats` - Get dashboard statistics (Admin/Manager only)
- `GET /api/dashboard/analytics` - Get analytics data (Admin/Manager only)

### Settings Management

- `GET /api/settings` - Get all settings (Admin only)
- `PUT /api/settings` - Update multiple settings (Admin only)
- `GET /api/settings/:key` - Get specific setting (Admin only)
- `PUT /api/settings/:key` - Update specific setting (Admin only)
- `DELETE /api/settings/:key` - Delete setting (Admin only)

## 🔐 Authentication & Authorization

The API uses JWT tokens for authentication with three user roles:

- **ADMIN**: Full access to all endpoints
- **MANAGER**: Can manage properties, blog posts, and inquiries
- **EMPLOYEE**: Can create and edit properties and blog posts

### Using the API

1. **Login** to get access token:
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@domyvitalii.cz","password":"SecureAdminPassword123!"}'
```

2. **Use token** in subsequent requests:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/properties
```

## 🗄️ Database Schema

The application uses PostgreSQL with the following main entities:

- **Users**: Authentication and role management
- **Properties**: Real estate listings with images and metadata
- **BlogPosts**: CMS for blog content with categories
- **Inquiries**: Customer inquiries and lead management
- **Settings**: Application configuration
- **PropertyImages**: Image management for properties
- **UserSessions**: Refresh token management
- **NewsletterSubscribers**: Email marketing

## 📁 Project Structure

```
backend/
├── src/
│   ├── middleware/          # Authentication, error handling
│   ├── routes/             # API route handlers
│   ├── database/           # Database utilities and seeds
│   └── server.ts           # Main application entry point
├── prisma/
│   └── schema.prisma       # Database schema
├── package.json
├── tsconfig.json
└── README.md
```

## 🚀 Deployment

### Production Build

```bash
npm run build
npm start
```

### Environment Variables for Production

Make sure to set these environment variables in production:

- Set `NODE_ENV=production`
- Use strong, unique values for `JWT_SECRET` and `REFRESH_TOKEN_SECRET`
- Configure proper `DATABASE_URL` for your production database
- Set up Cloudinary credentials
- Configure SMTP settings for email notifications

### Database Migration

For production deployments:

```bash
npm run db:migrate
npm run db:seed
```

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio (database GUI)
- `npm run db:seed` - Seed database with sample data

### Adding New Features

1. **Database Changes**: Update `prisma/schema.prisma`
2. **Generate Client**: Run `npm run db:generate`
3. **Create Routes**: Add new route files in `src/routes/`
4. **Add Middleware**: Create middleware in `src/middleware/`
5. **Update Server**: Import and use new routes in `src/server.ts`

## 🛡️ Security Features

- **JWT Authentication** with refresh tokens
- **Role-based access control** (RBAC)
- **Rate limiting** to prevent abuse
- **Input validation** with express-validator
- **CORS protection** with configurable origins
- **Helmet.js** for security headers
- **Password hashing** with bcrypt
- **SQL injection prevention** with Prisma ORM

## 📊 Monitoring & Logging

- **Health check** endpoint at `/health`
- **Request logging** with Morgan
- **Error handling** with detailed error responses
- **API documentation** at `/api/docs`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is proprietary software for Domy v Italii.

## 🆘 Support

For support and questions:
- Email: admin@domyvitalii.cz
- Check the API documentation at `/api/docs`
- Review the health check at `/health` 