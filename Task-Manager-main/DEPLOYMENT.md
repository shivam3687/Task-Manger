# Deployment Guide - Team Task Manager

Complete guide to deploy the Team Task Manager to Railway.

## Prerequisites

1. GitHub account with your repository
2. Railway account (railway.app)
3. Supabase account (for managed PostgreSQL) - Optional, you can use Railway PostgreSQL
4. Basic understanding of environment variables

## Step 1: Database Setup (Supabase)

### Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in project details:
   - Project name: `task-manager`
   - Database password: Create a strong password
   - Region: Choose closest to your location
5. Wait for project to initialize (2-3 minutes)

### Get Connection String

1. Go to "Settings" → "Database"
2. Copy the "Connection string" (PostgreSQL)
3. It should look like: `postgresql://postgres:password@host:5432/postgres`

### Run Migrations

1. Clone your repository locally
2. Navigate to backend directory: `cd backend`
3. Create `.env` file:
```bash
cp .env.example .env
```
4. Update DATABASE_URL with Supabase connection string
5. Run migrations:
```bash
npm install
npm run prisma:generate
npm run prisma:migrate
```

## Step 2: Backend Deployment (Railway)

### Connect Repository

1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub"
4. Connect your GitHub account
5. Select your repository
6. Click "Deploy"

### Configure Environment Variables

1. In Railway project, click "Variables"
2. Add the following environment variables:

```
DATABASE_URL = "postgresql://postgres:password@host:5432/postgres"
JWT_SECRET = "generate-a-random-secret-key-here"
NODE_ENV = "production"
FRONTEND_URL = "https://your-frontend-domain.com"
PORT = "5000"
```

**To generate JWT_SECRET**, run this command locally:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Deploy

1. Railway will automatically build and deploy
2. Click on the "Deployments" tab to monitor
3. Once deployed, you'll get a URL like: `https://backend-xxx.railway.app`
4. Copy this URL for frontend configuration

### Verify Backend

Visit: `https://backend-xxx.railway.app/health`

You should see: `{"status":"ok","message":"Backend is running"}`

## Step 3: Frontend Deployment (Railway)

### Option A: Deploy to Railway

1. In Railway, click "New Service" → "GitHub Repo"
2. Select the same repository
3. Click "Deploy"

### Configure Environment Variables

1. In Railway project (frontend service), click "Variables"
2. Add:

```
NEXT_PUBLIC_API_URL = "https://backend-xxx.railway.app/api"
NODE_ENV = "production"
```

Replace `backend-xxx.railway.app` with your actual backend URL

### Deploy

1. Railway will automatically build with `npm run build`
2. It will start with `npm start`
3. Monitor in "Deployments" tab
4. Once deployed, you'll get a URL like: `https://frontend-xxx.railway.app`

### Verify Frontend

Visit: `https://frontend-xxx.railway.app`

You should see the login page.

## Step 4: Custom Domain (Optional)

### Add Domain to Railway

1. In Railway project settings
2. Click "Domains" → "Generate Domain" or "Add Custom Domain"
3. If using custom domain:
   - Point your domain DNS to Railway nameservers
   - Wait for DNS propagation (up to 48 hours)

## Step 5: Testing

### Test Login Flow

1. Go to `https://your-frontend-domain.com`
2. Click "Sign Up"
3. Create an account with test data
4. You should be redirected to dashboard
5. Go to "Projects" and create a new project (if admin)
6. Create tasks and test functionality

### Check Logs

Backend logs:
1. Go to Railway backend service
2. Click "Logs" tab
3. Monitor for errors

Frontend logs:
1. Open browser DevTools (F12)
2. Check Console and Network tabs
3. Verify API requests are going to correct backend URL

## Step 6: Troubleshooting

### 401 Unauthorized Errors

**Problem:** Token not working, user gets logged out immediately

**Solutions:**
1. Check JWT_SECRET matches between production and development
2. Verify backend DATABASE_URL is correct
3. Check frontend NEXT_PUBLIC_API_URL is correct
4. Clear browser localStorage and try again

### CORS Errors

**Problem:** "Access to XMLHttpRequest blocked by CORS policy"

**Solutions:**
1. Verify FRONTEND_URL in backend matches your frontend domain
2. Restart backend service after changing FRONTEND_URL
3. Check Authorization header is being sent correctly

### Database Connection Errors

**Problem:** Backend can't connect to database

**Solutions:**
1. Verify DATABASE_URL is correct in Railway variables
2. Check Supabase database status
3. Ensure migrations have run: `npm run prisma:migrate`
4. Test connection locally first

### Build Failures

**Problem:** Railway build fails

**Solutions:**
1. Check build logs in Railway
2. Ensure all dependencies are installed locally
3. Run `npm install` to verify package.json
4. Check for TypeScript errors: `npx tsc --noEmit`
5. Verify .env files are not in source code

## Environment Variables Summary

### Backend (.env)
```
DATABASE_URL="postgresql://..."
JWT_SECRET="random-32-char-secret"
NODE_ENV="production"
PORT="5000"
FRONTEND_URL="https://your-frontend.com"
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL="https://your-backend.railway.app/api"
```

## Production Checklist

- [ ] Database migrations completed
- [ ] JWT_SECRET generated and secure
- [ ] FRONTEND_URL set to production domain
- [ ] NEXT_PUBLIC_API_URL points to production backend
- [ ] All environment variables configured in Railway
- [ ] Backend health check endpoint works
- [ ] Frontend loads without CORS errors
- [ ] Login/signup works
- [ ] Can create projects (as admin)
- [ ] Can create tasks
- [ ] Can view dashboard
- [ ] Logs don't show errors
- [ ] Database backups configured

## Monitoring

### Railway Monitoring

1. Check "Logs" regularly for errors
2. Monitor "Metrics" for CPU, Memory, Disk usage
3. Set up alerts for high resource usage (optional)

### Health Checks

Set up periodic health checks:
```bash
curl https://your-backend.railway.app/health
curl https://your-frontend.railway.app
```

## Scaling (Future)

If you need to scale:

1. **Database:** Upgrade Supabase plan
2. **Backend:** Increase Railway resource allocation
3. **Frontend:** Increase Railway resource allocation or use CDN
4. **Caching:** Add Redis for session caching
5. **Load Balancing:** Use Railway load balancing

## Security in Production

1. **HTTPS:** Railway provides SSL by default
2. **JWT Expiry:** Set to 7 days (can reduce for higher security)
3. **Database:** Use strong passwords, restrict access
4. **Secrets:** Never commit .env files, use environment variables
5. **CORS:** Restrict to specific frontend domain
6. **Rate Limiting:** Consider adding rate limiting middleware
7. **Logging:** Don't log sensitive information

## Backup Strategy

### Database Backups

Supabase automatically backs up:
1. Daily backups kept for 7 days
2. Point-in-time recovery available
3. Manual backups can be created anytime

### Code Backups

1. Always maintain git history
2. Tag important releases: `git tag v1.0.0`
3. Push to GitHub regularly

## Disaster Recovery

If deployment fails:

1. **Rollback:** Railway keeps previous deployments
   - Click "Deployments" → Select previous version → "Redeploy"

2. **Database Recovery:** Supabase point-in-time recovery
   - Go to Settings → Backups → Restore

3. **Code Recovery:** Git history
   - `git log` to find previous commits
   - `git revert` to undo changes

## Support Resources

- [Railway Docs](https://docs.railway.app)
- [Supabase Docs](https://supabase.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)

## Need Help?

1. Check Railway status page for service issues
2. Review application logs for specific errors
3. Verify all environment variables are set correctly
4. Test locally before deploying to production
5. Check GitHub Issues section
6. Contact Railway support for infrastructure issues

---

Congratulations! Your Team Task Manager is now live! 🚀
