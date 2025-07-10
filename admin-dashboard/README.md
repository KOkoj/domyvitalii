# 🏠 Admin Dashboard - Domy v Italii

Modern React admin dashboard for managing Italian real estate properties, blog content, and customer inquiries.

## 🚀 Features

- **🏘️ Property Management**: Add, edit, and manage real estate listings
- **📝 Blog CMS**: Rich text editor for creating and managing blog posts
- **📧 Inquiry Management**: Handle customer inquiries and leads
- **👥 User Management**: Manage team members and permissions (Admin only)
- **📊 Analytics Dashboard**: View statistics and insights
- **📱 Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **🔐 Role-based Access**: Admin, Manager, and Employee roles
- **🖼️ Image Management**: Upload and manage property images with Cloudinary

## 🛠️ Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Query** for data fetching and caching
- **React Hook Form** for form management
- **React Router** for navigation
- **Axios** for API communication
- **TipTap** for rich text editing
- **Recharts** for analytics charts

## ⚡ Quick Start

### 1. Install Dependencies
```bash
cd admin-dashboard
npm install
```

### 2. Environment Setup
Create `.env` file:
```env
VITE_API_URL=http://localhost:3001/api
```

### 3. Start Development Server
```bash
npm run dev
```

The admin dashboard will be available at http://localhost:5173

### 4. Login Credentials
Default admin credentials (from backend seed):
- **Email**: admin@domyvitalii.cz
- **Password**: SecureAdminPassword123!

## 📋 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors

## 🎯 Main Features

### **Dashboard Overview**
- Property statistics (total, published, drafts)
- Blog post metrics
- Recent inquiries
- User activity overview
- Quick actions for common tasks

### **Property Management**
- **Add Properties**: Complete form with all property details
- **Image Upload**: Drag & drop image upload with Cloudinary
- **Rich Descriptions**: Formatted text with editor
- **SEO Optimization**: Meta titles and descriptions
- **Status Management**: Draft, published, sold, etc.
- **Filtering & Search**: Find properties quickly

### **Blog Management**
- **Rich Text Editor**: TipTap editor with formatting options
- **Categories**: Trivia, Properties, Company content
- **Tags System**: Organize content with tags
- **Publishing**: Draft and publish workflow
- **SEO Features**: Meta data management
- **Content Preview**: See how posts will look

### **Inquiry Management**
- **Lead Tracking**: View all customer inquiries
- **Status Updates**: New, in progress, responded, closed
- **Property Association**: Link inquiries to specific properties
- **Response Management**: Track communication
- **Filtering**: By status, type, date

### **User Management** (Admin Only)
- **Team Members**: Add/edit/delete users
- **Role Assignment**: Admin, Manager, Employee
- **Access Control**: Manage permissions
- **Activity Monitoring**: Track user actions

### **Settings** (Admin Only)
- **Site Configuration**: Basic site settings
- **Email Settings**: SMTP configuration
- **Feature Toggles**: Enable/disable features
- **Maintenance Mode**: Site maintenance control

## 🔐 User Roles & Permissions

### **Admin**
- Full access to all features
- User management
- Settings configuration
- Delete properties and blog posts

### **Manager**
- Manage properties and blog posts
- Handle inquiries
- Publish/unpublish content
- View analytics

### **Employee**
- Create and edit properties
- Create and edit blog posts
- View inquiries (limited)
- Basic dashboard access

## 🎨 UI Components

The dashboard uses a consistent design system with:
- **Color Scheme**: Green theme matching main website
- **Typography**: Inter font for readability
- **Icons**: Lucide React icons
- **Buttons**: Primary, secondary, outline, danger variants
- **Forms**: Consistent input styling with validation
- **Tables**: Responsive data tables
- **Cards**: Clean card layouts
- **Badges**: Status indicators
- **Modals**: Overlay dialogs
- **Toasts**: Success/error notifications

## 📱 Responsive Design

The dashboard is fully responsive and works on:
- **Desktop**: Full sidebar navigation
- **Tablet**: Collapsible sidebar
- **Mobile**: Bottom navigation + hamburger menu

## 🔧 Development

### **Project Structure**
```
admin-dashboard/
├── src/
│   ├── components/          # Reusable UI components
│   ├── pages/              # Page components
│   ├── contexts/           # React contexts
│   ├── hooks/              # Custom hooks
│   ├── lib/                # Utilities and API
│   ├── types/              # TypeScript types
│   └── main.tsx            # App entry point
├── public/                 # Static assets
└── package.json
```

### **Adding New Features**
1. Create component in `src/components/`
2. Add page in `src/pages/`
3. Update routing in `src/App.tsx`
4. Add API calls in `src/lib/`
5. Update navigation in `src/components/Layout/`

### **Styling Guidelines**
- Use Tailwind CSS classes
- Follow existing component patterns
- Maintain responsive design
- Use consistent spacing (4, 8, 12, 16px increments)

## 🚀 Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

The build output will be in the `dist/` folder, ready for deployment to Netlify, Vercel, or any static hosting service.

## 🔗 API Integration

The dashboard communicates with the backend API for:
- **Authentication**: JWT-based auth with refresh tokens
- **Properties**: CRUD operations
- **Blog Posts**: Content management
- **Inquiries**: Lead management
- **Users**: Team management
- **File Upload**: Image handling via Cloudinary
- **Analytics**: Dashboard statistics

## 🛡️ Security Features

- **JWT Authentication**: Secure token-based auth
- **Role-based Access**: Granular permissions
- **Auto Token Refresh**: Seamless session management
- **CSRF Protection**: Request validation
- **Input Validation**: Form data sanitization
- **Error Handling**: Graceful error management

## 📊 Performance

- **Code Splitting**: Lazy loading for optimal performance
- **Caching**: React Query for efficient data management
- **Optimized Images**: Cloudinary transformations
- **Bundle Analysis**: Vite build optimization
- **Tree Shaking**: Unused code elimination

## 🆘 Troubleshooting

### **Common Issues**

#### Can't Login:
- Check API URL in `.env`
- Verify backend is running
- Check browser console for errors

#### Images Won't Upload:
- Verify Cloudinary credentials in backend
- Check file size limits
- Ensure proper CORS setup

#### 404 on Refresh:
- Configure proper redirects for SPA
- Check Netlify/Vercel configuration

#### Styling Issues:
- Clear browser cache
- Check Tailwind CSS compilation
- Verify import paths

## 🔄 Updates & Maintenance

- **Dependencies**: Update monthly
- **Security**: Monitor for vulnerabilities
- **Performance**: Regular performance audits
- **Backup**: Regular data backups
- **Monitoring**: Error tracking with Sentry (optional)

---

**Ready to manage your Italian real estate platform!** 🏠🇮🇹

For deployment instructions, see the main `DEPLOYMENT_GUIDE.md` file. 