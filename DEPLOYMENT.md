# Deployment Guide - Khoj Lost & Found

This guide covers deploying both the frontend (Vite/React) and backend (Express/MongoDB) to production.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Backend Deployment](#backend-deployment)
- [Frontend Deployment](#frontend-deployment)
- [Post-Deployment](#post-deployment)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Accounts
1. **MongoDB Atlas** - Database hosting (free tier available)
   - Sign up at: https://cloud.mongodb.com/
2. **Render/Railway/Heroku** - Backend hosting (choose one)
3. **Vercel/Netlify** - Frontend hosting (choose one)

### Local Setup First
Before deploying, ensure the app works locally:
```bash
# 1. Setup Backend
cd server
cp .env.example .env
# Edit .env with your MongoDB Atlas credentials
npm install
npm run dev

# 2. Setup Frontend (in new terminal)
cd ..
cp .env.example .env
npm install
npm run dev
```

---

## Backend Deployment

### Option 1: Deploy to Render (Recommended)

1. **Create MongoDB Atlas Database**
   - Go to https://cloud.mongodb.com/
   - Create a new project and cluster (M0 Free tier)
   - Under "Database Access", create a database user with password
   - Under "Network Access", add `0.0.0.0/0` (allow from anywhere) or your specific IPs
   - Click "Connect" → "Connect your application"
   - Copy the connection string (looks like: `mongodb+srv://username:password@cluster0...`)

2. **Deploy to Render**
   - Push your code to GitHub
   - Go to https://render.com/ and sign in with GitHub
   - Click "New +" → "Web Service"
   - Connect your repository
   - Configure:
     - **Name**: `khoj-backend`
     - **Root Directory**: `server`
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Plan**: Free

3. **Add Environment Variables** (in Render dashboard)
   ```
   NODE_ENV=production
   PORT=4000
   MONGODB_URI=<your-mongodb-atlas-connection-string>
   JWT_SECRET=<generate-using-crypto-randomBytes>
   CLIENT_ORIGIN=https://your-frontend-domain.vercel.app
   RATE_LIMIT_MAX=100
   JWT_ACCESS_EXPIRY=15m
   JWT_REFRESH_EXPIRY=7d
   ```

4. **Generate JWT Secret**
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Copy your backend URL (e.g., `https://khoj-backend.onrender.com`)

### Option 2: Deploy to Railway

1. Follow same MongoDB setup as above
2. Install Railway CLI: `npm i -g @railway/cli`
3. Deploy:
   ```bash
   cd server
   railway login
   railway init
   railway up
   ```
4. Add environment variables via Railway dashboard
5. Get your backend URL from Railway

### Option 3: Deploy to Heroku

1. Install Heroku CLI
2. Deploy:
   ```bash
   cd server
   heroku create khoj-backend
   heroku config:set MONGODB_URI=<your-connection-string>
   heroku config:set JWT_SECRET=<your-secret>
   heroku config:set CLIENT_ORIGIN=<your-frontend-url>
   heroku config:set NODE_ENV=production
   git push heroku main
   ```

---

## Frontend Deployment

### Option 1: Deploy to Vercel (Recommended)

1. **Update Environment Variables**
   - Edit `.env.production`:
     ```
     VITE_API_URL=https://your-backend-domain.com/api
     ```
   Replace with your actual backend URL from previous step

2. **Deploy via Vercel CLI**
   ```bash
   npm i -g vercel
   vercel login
   vercel
   ```

3. **Or Deploy via Vercel Dashboard**
   - Go to https://vercel.com/
   - Click "New Project"
   - Import your GitHub repository
   - Configure:
     - **Framework Preset**: Vite
     - **Root Directory**: `./` (leave empty if at root)
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
     - **Environment Variables**: Add `VITE_API_URL`
   - Click "Deploy"

4. **Get your frontend URL** (e.g., `https://khoj.vercel.app`)

5. **IMPORTANT: Update Backend CORS**
   - Go back to your backend hosting (Render/Railway/Heroku)
   - Update `CLIENT_ORIGIN` environment variable with your frontend URL:
     ```
     CLIENT_ORIGIN=https://khoj.vercel.app
     ```
   - Restart the backend service

### Option 2: Deploy to Netlify

1. **Create netlify.toml**
   ```bash
   cat > netlify.toml << 'EOF'
   [build]
     command = "npm run build"
     publish = "dist"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   EOF
   ```

2. **Deploy**
   - Install Netlify CLI: `npm i -g netlify-cli`
   - Login: `netlify login`
   - Deploy: `netlify deploy --prod`
   - Or use Netlify dashboard to connect your GitHub repo

3. **Add Environment Variables** in Netlify dashboard:
   ```
   VITE_API_URL=https://your-backend-domain.com/api
   ```

---

## Post-Deployment

### 1. Test the Application

Visit your frontend URL and test:
- ✅ User signup with college/campus suggestions
- ✅ User login
- ✅ Create lost/found items
- ✅ Search and filter items
- ✅ View profile

### 2. Test College/Campus Suggestions

The college suggestions should now work because:
1. Backend is connected to MongoDB
2. Colleges are seeded on first server start (see `server/src/utils/seedColleges.js`)
3. Frontend can fetch from `/api/campuses` endpoint

### 3. Monitor Application

#### Backend Monitoring
- Check backend logs in Render/Railway/Heroku dashboard
- Monitor MongoDB Atlas metrics
- Set up alerts for errors

#### Frontend Monitoring
- Check Vercel/Netlify deployment logs
- Use browser DevTools to check API calls
- Monitor performance with Lighthouse

### 4. Enable Custom Domain (Optional)

#### Backend
- In Render/Railway, add custom domain
- Update DNS records as instructed

#### Frontend
- In Vercel/Netlify, add custom domain
- Update DNS records
- SSL certificates are auto-provisioned

---

## Environment Variables Summary

### Backend (.env)
```env
NODE_ENV=production
PORT=4000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/khoj
JWT_SECRET=<64-char-random-hex-string>
CLIENT_ORIGIN=https://your-frontend.vercel.app
RATE_LIMIT_MAX=100
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
```

### Frontend (.env.production)
```env
VITE_API_URL=https://your-backend.onrender.com/api
```

---

## Troubleshooting

### College/Campus Suggestions Not Working

**Problem**: Dropdown shows no suggestions

**Solutions**:
1. Check backend is running: Visit `https://your-backend.com/health`
2. Check MongoDB connection: View backend logs
3. Verify colleges are seeded:
   - Connect to MongoDB Atlas
   - Check `colleges` collection has data
4. Check network tab in browser DevTools:
   - Request to `/api/campuses` should return 200
   - Response should contain array of colleges
5. Verify CORS is configured:
   - Backend `CLIENT_ORIGIN` must match frontend URL

### CORS Errors

**Problem**: Browser shows CORS policy errors

**Solutions**:
1. Update backend `CLIENT_ORIGIN` with exact frontend URL
2. Restart backend service after updating env vars
3. Ensure frontend URL includes protocol (`https://`)

### MongoDB Connection Issues

**Problem**: Backend crashes with MongoDB connection error

**Solutions**:
1. Verify `MONGODB_URI` is correct
2. Check MongoDB Atlas network access allows your backend IP
3. Ensure database user has read/write permissions
4. Test connection string locally first

### Build Failures

**Frontend**:
```bash
# Clear cache and rebuild
rm -rf node_modules dist .vite
npm install
npm run build
```

**Backend**:
```bash
# Verify all dependencies
cd server
rm -rf node_modules
npm install
npm start
```

### Rate Limiting Issues

If users are getting rate-limited too frequently:
1. Increase `RATE_LIMIT_MAX` in backend env vars
2. Or adjust `windowMs` in `server/src/server.js`

---

## Security Checklist

Before going to production:

- ✅ MongoDB Atlas: Network access properly configured
- ✅ JWT_SECRET: Strong random secret (not default)
- ✅ CORS: Only allow your frontend domain
- ✅ HTTPS: Both frontend and backend use HTTPS
- ✅ Rate limiting: Enabled and configured
- ✅ Input validation: Zod schemas in place
- ✅ MongoDB sanitization: express-mongo-sanitize enabled
- ✅ Security headers: Helmet configured
- ✅ Environment variables: Not committed to git

---

## Scaling Considerations

When your app grows:

1. **Database**
   - Upgrade MongoDB Atlas tier (M2/M5)
   - Enable database indexes for faster queries
   - Set up MongoDB backups

2. **Backend**
   - Upgrade Render/Railway plan for more resources
   - Add Redis for session caching
   - Implement background job queues

3. **Frontend**
   - Enable Vercel/Netlify analytics
   - Add CDN caching
   - Implement code splitting

4. **Monitoring**
   - Add error tracking (Sentry, LogRocket)
   - Set up uptime monitoring
   - Monitor API response times

---

## Quick Deploy Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Database user created with password
- [ ] Backend deployed to Render/Railway/Heroku
- [ ] Backend environment variables configured
- [ ] Backend health check passes
- [ ] Frontend environment variables updated
- [ ] Frontend deployed to Vercel/Netlify
- [ ] Backend CORS updated with frontend URL
- [ ] Test signup/login flow
- [ ] Test college/campus suggestions
- [ ] Test item posting
- [ ] Enable custom domains (optional)

---

## Support

For issues or questions:
1. Check backend logs in hosting dashboard
2. Check frontend build logs
3. Review MongoDB Atlas metrics
4. Test API endpoints with Postman/Thunder Client
5. Check browser DevTools console and network tab

**Happy Deploying! 🚀**
