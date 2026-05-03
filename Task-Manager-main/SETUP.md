# Quick Setup Guide - Team Task Manager

Get the Team Task Manager running locally in minutes!

## Prerequisites

- Node.js 18+ installed
- npm or yarn
- PostgreSQL running locally OR Supabase account
- Git

## 1. Clone & Extract Project

```bash
# Extract the project
cd team-task-manager
```

## 2. Backend Setup (5 minutes)

### Install Backend Dependencies

```bash
cd backend
npm install
```

### Configure Database

#### Option A: Using Supabase (Recommended)

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to Settings → Database → Connection String (PostgreSQL)
4. Copy the connection string

#### Option B: Using Local PostgreSQL

```bash
# Create database (macOS/Linux)
createdb task_manager

# Or use Docker
docker run -d \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  postgres:15
```

### Update Environment Variables

```bash
# Copy example env file
cp .env.example .env

# Edit .env and update DATABASE_URL
nano .env
```

Example .env:
```
DATABASE_URL="postgresql://postgres:password@localhost:5432/task_manager"
JWT_SECRET="change-this-to-random-secret"
PORT=5000
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"
```

### Run Database Migrations

```bash
npm run prisma:generate
npm run prisma:migrate
```

### Start Backend Server

```bash
npm run dev
```

Backend will run on: `http://localhost:5000`

Check health: `curl http://localhost:5000/health`

## 3. Frontend Setup (5 minutes)

### Install Frontend Dependencies

```bash
# In a new terminal, from project root
cd frontend
npm install
```

### Configure Environment

```bash
# Copy example env file
cp .env.local.example .env.local

# Edit .env.local (usually no changes needed for local development)
nano .env.local
```

The default is: `NEXT_PUBLIC_API_URL=http://localhost:5000/api`

### Start Frontend Server

```bash
npm run dev
```

Frontend will run on: `http://localhost:3000`

## 4. Access the Application

1. Open `http://localhost:3000` in your browser
2. You should see the login page
3. Click "Sign Up" to create an account
4. Fill in your details and sign up
5. You'll be redirected to the dashboard

## 5. Test the Features

### Create a Project (Admin)

1. Click "Projects" in navbar
2. Click "Create Project"
3. Fill in project name and description
4. Click "Create Project"

### Create a Task

1. Click on a project
2. Click "Add Task"
3. Fill in task details
4. Click "Create Task"

### View Dashboard

1. Click "Dashboard" in navbar
2. See all your statistics
3. View assigned tasks

## Troubleshooting

### Backend won't start

**Error:** `Database connection failed`

```bash
# Check database is running
# For PostgreSQL:
psql -U postgres -d task_manager

# For Supabase:
# - Verify DATABASE_URL in .env
# - Check Supabase project status
```

**Error:** `Port 5000 already in use`

```bash
# Kill process on port 5000
# macOS/Linux:
lsof -ti:5000 | xargs kill -9

# Or change PORT in .env
PORT=5001
```

### Frontend won't start

**Error:** `Module not found`

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

**Error:** `API requests failing`

1. Check backend is running: `curl http://localhost:5000/health`
2. Verify NEXT_PUBLIC_API_URL in .env.local
3. Check browser console for errors (F12)

### Can't login

1. Verify user was created in signup
2. Check backend logs for errors
3. Clear browser localStorage: `localStorage.clear()`
4. Try signing up again with different email

### Database migration errors

```bash
# Reset database (WARNING: deletes all data)
npm run prisma:migrate reset

# Or manually:
# 1. Delete all migrations in prisma/migrations/ except schema.prisma
# 2. Run: npm run prisma:migrate dev --name init
```

## Project Structure Quick Reference

```
team-task-manager/
├── backend/               # Express API
│   ├── src/
│   │   ├── server.ts      # Main app
│   │   ├── controllers/   # Business logic
│   │   ├── routes/        # API endpoints
│   │   └── prisma/        # Database schema
│   ├── .env
│   └── package.json
├── frontend/              # Next.js app
│   ├── app/
│   │   ├── auth/          # Login/Signup
│   │   ├── dashboard/     # Main page
│   │   └── projects/      # Projects list
│   ├── components/        # React components
│   ├── .env.local
│   └── package.json
└── README.md              # Main documentation
```

## Common Commands

### Backend

```bash
cd backend

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# View database in Prisma Studio
npx prisma studio
```

### Frontend

```bash
cd frontend

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Next Steps

1. ✅ Setup complete!
2. 📖 Read [README.md](./README.md) for architecture overview
3. 🚀 Read [DEPLOYMENT.md](./DEPLOYMENT.md) to deploy to Railway
4. 🐛 Check logs if something doesn't work
5. 📝 Review API docs in backend README

## Tips & Tricks

### View Database (Supabase)

1. Go to Supabase dashboard
2. Click "SQL Editor"
3. Run queries to inspect data

### View Database (Local PostgreSQL)

```bash
# Connect to database
psql -U postgres -d task_manager

# List tables
\dt

# View users
SELECT * FROM users;

# Exit
\q
```

### Debug Frontend API Calls

1. Open browser DevTools (F12)
2. Go to Network tab
3. Make a request
4. Click request to see details
5. Check Response tab for errors

### Debug Backend

Add console logs:
```typescript
console.log('[v0] Received request:', req.body);
```

Check logs in terminal where `npm run dev` is running.

## Getting Help

1. Check error messages in terminal/console
2. Review logs in browser DevTools
3. Read API documentation in backend README
4. Check GitHub Issues
5. Review code comments for complex logic

## Ready to Deploy?

When ready to go live:

1. Follow [DEPLOYMENT.md](./DEPLOYMENT.md)
2. Set up Railway account
3. Connect GitHub repository
4. Configure production environment variables
5. Deploy backend and frontend

---

Enjoy building! 🎉

For more details, see:
- [Backend README](./backend/README.md)
- [Frontend README](./frontend/README.md)
- [Deployment Guide](./DEPLOYMENT.md)
