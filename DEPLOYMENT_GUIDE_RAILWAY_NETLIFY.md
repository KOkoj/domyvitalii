# 🚀 Deployment Guide: Railway + Netlify

This guide will help you deploy your Italian Real Estate Platform with:
- **Backend** → Railway (Node.js/Express/Prisma)
- **Frontend** → Netlify (React/Vite)

## 📋 Prerequisites

- [ ] GitHub repository with your code
- [ ] Railway account (free tier available)
- [ ] Netlify account (free tier available)
- [ ] Cloudinary account for image storage
- [ ] PostgreSQL database (Railway provides this)

---

## 🔧 1. Backend Deployment (Railway)

### Step 1: Prepare Your Railway Account
1. Visit [railway.app](https://railway.app) and sign up
2. Connect your GitHub account
3. Create a new project

### Step 2: Deploy Backend
1. **Create New Project** in Railway
2. **Deploy from GitHub repo** → Select your repository
3. **Select the backend folder** (`backend/`)
4. Railway will auto-detect it's a Node.js project

### Step 3: Configure Environment Variables
Go to your Railway project → Variables tab and add:

```env
# Database (Railway provides this automatically)
DATABASE_URL=postgresql://...  # This will be auto-generated

# JWT Authentication
JWT_SECRET=your-super-secure-jwt-secret-key-here-change-in-production
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=your-refresh-token-secret-key
REFRESH_TOKEN_EXPIRES_IN=30d

# Cloudinary (Image Storage)
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Admin User (for initial setup)
ADMIN_EMAIL=admin@domyvitalii.cz
ADMIN_PASSWORD=SecureAdminPassword123!
ADMIN_NAME=Admin User

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@domyvitalii.cz
FROM_NAME="Domy v Italii"

# CORS (Update with your Netlify URL)
ALLOWED_ORIGINS=https://your-app.netlify.app,https://domyvitalii.cz

# Frontend URLs (Update with your deployed URLs)
FRONTEND_URL=https://domyvitalii.cz
ADMIN_FRONTEND_URL=https://your-app.netlify.app

# Security
BCRYPT_SALT_ROUNDS=12
SESSION_SECRET=your-session-secret-key

# App Settings
NODE_ENV=production
```

### Step 4: Custom Start Command (Optional)
If Railway doesn't auto-detect, set custom start command:
```bash
npm run build && npm start
```

### Step 5: Domain Setup
1. Railway will provide a URL like: `https://your-app.railway.app`
2. (Optional) Add custom domain in Railway settings

---

## 🌐 2. Frontend Deployment (Netlify)

### Step 1: Prepare Netlify Account
1. Visit [netlify.com](https://netlify.com) and sign up
2. Connect your GitHub account

### Step 2: Deploy Frontend
1. **New site from Git** in Netlify
2. **Connect to GitHub** → Select your repository
3. **Configure build settings**:
   - **Base directory**: `admin-dashboard`
   - **Build command**: `npm run build`
   - **Publish directory**: `admin-dashboard/dist`

### Step 3: Environment Variables
Go to Site settings → Environment variables and add:

```env
# Backend API URL (Use your Railway URL)
VITE_API_URL=https://your-railway-app.railway.app/api

# App Configuration
VITE_APP_NAME=Domy v Italii Admin
VITE_APP_VERSION=1.0.0
NODE_ENV=production
```

### Step 4: Update Backend URLs
After deployment, update these files with your actual URLs:

**In Railway environment variables:**
```env
ALLOWED_ORIGINS=https://your-netlify-site.netlify.app
ADMIN_FRONTEND_URL=https://your-netlify-site.netlify.app
```

**In Netlify environment variables:**
```env
VITE_API_URL=https://your-railway-app.railway.app/api
```

---

## 🔄 3. Post-Deployment Setup

### Database Setup
1. Railway automatically runs `prisma db push` during build
2. Your database schema will be automatically created
3. Initial admin user will be seeded (check your logs)

### Domain Configuration (Optional)
1. **Railway**: Add custom domain in project settings
2. **Netlify**: Add custom domain in site settings
3. Update CORS and environment variables with new domains

### SSL Certificates
Both Railway and Netlify provide automatic SSL certificates.

---

## 🧪 4. Testing Your Deployment

### Backend (Railway)
```bash
# Test API health
curl https://your-railway-app.railway.app/api/health

# Test authentication
curl -X POST https://your-railway-app.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@domyvitalii.cz","password":"your-password"}'
```

### Frontend (Netlify)
1. Visit your Netlify URL
2. Try logging in with admin credentials
3. Test all major features

---

## 🔧 5. Ongoing Maintenance

### Automatic Deployments
- **Railway**: Auto-deploys on push to main branch
- **Netlify**: Auto-deploys on push to main branch

### Monitoring
- **Railway**: Built-in metrics and logs
- **Netlify**: Build logs and analytics

### Scaling
- **Railway**: Automatic scaling based on usage
- **Netlify**: CDN with global edge locations

---

## 🚨 6. Troubleshooting

### Common Issues

**Build Fails on Railway:**
```bash
# Check logs in Railway dashboard
# Ensure all environment variables are set
# Verify package.json scripts are correct
```

**Frontend Can't Connect to Backend:**
```bash
# Check CORS settings in backend
# Verify VITE_API_URL is correct
# Check network tab in browser dev tools
```

**Database Connection Issues:**
```bash
# Verify DATABASE_URL is set by Railway
# Check Prisma schema is using postgresql
# Review Railway logs for database errors
```

### Useful Commands

**Force Re-deployment:**
```bash
# Railway: Push an empty commit
git commit --allow-empty -m "trigger deployment"
git push

# Netlify: Trigger deploy in site settings
```

---

## 📞 Support

- **Railway Docs**: [docs.railway.app](https://docs.railway.app)
- **Netlify Docs**: [docs.netlify.com](https://docs.netlify.com)
- **Prisma Railway Guide**: [pris.ly/d/railway](https://pris.ly/d/railway)

---

## ✅ Deployment Checklist

### Pre-deployment
- [ ] Code pushed to GitHub
- [ ] Environment variables prepared
- [ ] Cloudinary account setup
- [ ] Domain names decided (optional)

### Railway (Backend)
- [ ] Project created
- [ ] GitHub connected
- [ ] Environment variables set
- [ ] Deployment successful
- [ ] Database migrated
- [ ] API endpoints responding

### Netlify (Frontend)
- [ ] Site created
- [ ] GitHub connected
- [ ] Build settings configured
- [ ] Environment variables set
- [ ] Deployment successful
- [ ] Admin login working

### Post-deployment
- [ ] URLs updated in all configs
- [ ] CORS configured correctly
- [ ] SSL certificates active
- [ ] All features tested
- [ ] Custom domains configured (optional)

---

🎉 **Congratulations!** Your Italian Real Estate Platform is now live! 