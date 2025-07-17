# 🔧 Environment Setup Guide

Since `.env` files cannot be created automatically, please follow these steps:

## 📁 Files You Need to Create

### 1. Create `admin-dashboard/.env` (Local Development)
```env
# Local Development Environment
VITE_API_URL=http://localhost:3001/api
VITE_APP_NAME=Domy v Italii Admin
VITE_APP_VERSION=1.0.0
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG=true
```

### 2. Create `admin-dashboard/.env.production` (Netlify Deployment)
```env
# Production Environment (Netlify)
# UPDATE THIS URL with your actual Railway backend URL
VITE_API_URL=https://your-railway-backend.up.railway.app/api
VITE_APP_NAME=Domy v Italii Admin
VITE_APP_VERSION=1.0.0
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DEBUG=false
```

## 🚀 Steps to Create Files

### For Windows:
1. Navigate to `admin-dashboard` folder
2. Right-click → New → Text Document
3. Name it `.env` (remove .txt extension)
4. Copy-paste the content above
5. Repeat for `.env.production`

### For Command Line:
```bash
cd admin-dashboard

# Create local development file
echo "VITE_API_URL=http://localhost:3001/api
VITE_APP_NAME=Domy v Italii Admin
VITE_APP_VERSION=1.0.0
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG=true" > .env

# Create production file
echo "VITE_API_URL=https://your-railway-backend.up.railway.app/api
VITE_APP_NAME=Domy v Italii Admin
VITE_APP_VERSION=1.0.0
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DEBUG=false" > .env.production
```

## 🔄 Next Steps After Creating Files

1. **Update Production URL**: Replace `your-railway-backend.up.railway.app` with your actual Railway URL
2. **Update Main Website**: Update the URL in `script.js` line 4 with your Railway URL
3. **Test Locally**: Restart your admin dashboard to test
4. **Deploy**: Push to Netlify with the new environment files

## 🛠️ How to Find Your Railway URL

1. Go to your Railway dashboard
2. Open your backend project
3. Go to Settings → Domains
4. Copy the Railway-provided domain (e.g., `myapp-production.up.railway.app`)
5. Your API URL will be: `https://myapp-production.up.railway.app/api`

## ✅ Verification

After setup, you should see in browser console:
- `Environment detected: localhost` (local)
- `Environment detected: yourdomain.com` (production)
- `Using API URL: http://localhost:3001/api` (local)
- `Using API URL: https://your-railway-backend.up.railway.app/api` (production) 