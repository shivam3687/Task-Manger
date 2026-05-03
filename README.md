# Team Task Manager - Full Stack Application

A comprehensive full-stack application for managing team projects and tasks with role-based access control (Admin/Member).

## Project Overview

This is a complete MERN-style application (though using Node.js/Express instead of MongoDB with PostgreSQL) that allows users to:
- Create and manage projects
- Assign tasks to team members
- Track task progress
- Manage team members with different roles
- View dashboard with task statistics

## Architecture

```
┌─────────────────────────────┐
│   Frontend (Next.js)        │
│   - React 19                │
│   - Tailwind CSS            │
│   - Axios API Client        │
│   - TypeScript              │
└──────────────┬──────────────┘
               │ HTTP/REST
               ↓
┌─────────────────────────────┐
│   Backend (Express.js)      │
│   - Node.js                 │
│   - TypeScript              │
│   - Prisma ORM              │
│   - JWT Authentication      │
└──────────────┬──────────────┘
               │
               ↓
┌─────────────────────────────┐
│   Database (PostgreSQL)     │
│   - Supabase or Local       │
└─────────────────────────────┘
```

## Project Structure

```
team-task-manager/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Business logic
│   │   ├── routes/          # API endpoints
│   │   ├── middleware/      # Auth, error handling
│   │   ├── services/        # Database operations
│   │   ├── types/           # TypeScript interfaces
│   │   ├── utils/           # Helper functions
│   │   ├── prisma/          # Database schema
│   │   └── server.ts        # Express app
│   ├── .env.example         # Environment template
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
├── frontend/
│   ├── app/
│   │   ├── auth/            # Login/signup pages
│   │   ├── dashboard/       # Dashboard page
│   │   ├── projects/        # Projects pages
│   │   ├── tasks/           # Task pages
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Home page
│   │   └── globals.css      # Global styles
│   ├── components/          # React components
│   ├── context/             # Context providers
│   ├── lib/                 # Utilities & API client
│   ├── types/               # TypeScript types
│   ├── .env.local.example   # Environment template
│   ├── tailwind.config.ts   # Tailwind config
│   ├── next.config.js       # Next.js config
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
├── .gitignore
└── README.md (this file)
```

## Tech Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcryptjs
- **Validation:** Manual validation (Zod ready)

### Frontend
- **Framework:** Next.js 16
- **UI Library:** React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios
- **State Management:** React Context API

### Deployment
- **Backend:** Railway
- **Frontend:** Railway or Vercel
- **Database:** Supabase PostgreSQL

## Features

### Authentication
- User signup and login
- JWT-based authentication
- Secure password hashing
- Protected routes
- Auto-logout on token expiry

### Projects
- Create projects (Admin only)
- View all projects
- Update project details (Admin only)
- Delete projects (Admin only)
- Add/remove team members (Admin only)

### Tasks
- Create tasks within projects
- Assign tasks to team members
- Update task status (TODO → IN_PROGRESS → DONE)
- Set task priority (LOW, MEDIUM, HIGH, URGENT)
- Set due dates
- Delete tasks

### Dashboard
- Task statistics (total, completed, in progress, overdue)
- Tasks assigned to user
- Recent activities
- Quick action buttons

### Role-Based Access Control
- **Admin:** Can create projects, manage members, manage tasks
- **Member:** Can view projects, create and manage tasks

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database (or Supabase account)
- Git

### 1. Backend Setup

```bash
cd backend

# Copy environment template
cp .env.example .env

# Edit .env with your database URL and JWT secret
# DATABASE_URL="postgresql://user:password@localhost:5432/task_manager"
# JWT_SECRET="your-secret-key"

# Install dependencies
npm install

# Run database migrations
npm run prisma:generate
npm run prisma:migrate

# Start development server
npm run dev
```

Backend runs on `http://localhost:5000`

### 2. Frontend Setup

```bash
cd frontend

# Copy environment template
cp .env.local.example .env.local

# Edit .env.local with backend URL
# NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs on `http://localhost:3000`

### 3. Access the Application

1. Open `http://localhost:3000` in your browser
2. Sign up for a new account
3. Start creating projects (Admin role) or join existing ones

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints
```
POST /auth/signup              # Register
POST /auth/login               # Login
GET  /auth/me                  # Get profile
```

### Project Endpoints
```
GET    /projects               # List projects
POST   /projects               # Create project (Admin)
GET    /projects/:id           # Get project details
PUT    /projects/:id           # Update project (Admin)
DELETE /projects/:id           # Delete project (Admin)
```

### Team Member Endpoints
```
GET    /projects/:projectId/members        # List members
POST   /projects/:projectId/members        # Add member (Admin)
DELETE /projects/:projectId/members/:userId  # Remove member (Admin)
GET    /projects/:projectId/available-users  # List available users
```

### Task Endpoints
```
GET    /projects/:projectId/tasks          # List project tasks
POST   /projects/:projectId/tasks          # Create task
GET    /tasks/:taskId                      # Get task details
PUT    /tasks/:taskId                      # Update task
PATCH  /tasks/:taskId/status               # Update status
DELETE /tasks/:taskId                      # Delete task
```

### Dashboard Endpoints
```
GET /dashboard/overview        # Get statistics
```

## Database Schema

### Users Table
- `id` - Unique identifier
- `email` - Email (unique)
- `password` - Hashed password
- `name` - Full name
- `role` - ADMIN or MEMBER
- `createdAt`, `updatedAt` - Timestamps

### Projects Table
- `id` - Unique identifier
- `name` - Project name
- `description` - Description
- `adminId` - Admin user ID (FK)
- `createdAt`, `updatedAt` - Timestamps

### TeamMembers Table
- `id` - Unique identifier
- `projectId` - Project ID (FK)
- `userId` - User ID (FK)
- `role` - Member role
- `joinedAt` - Timestamp

### Tasks Table
- `id` - Unique identifier
- `projectId` - Project ID (FK)
- `title` - Task title
- `description` - Description
- `status` - TODO, IN_PROGRESS, DONE
- `priority` - LOW, MEDIUM, HIGH, URGENT
- `assignedTo` - User ID (FK)
- `createdBy` - Creator user ID (FK)
- `dueDate` - Due date
- `createdAt`, `updatedAt` - Timestamps

### TaskHistory Table
- `id` - Unique identifier
- `taskId` - Task ID (FK)
- `changedBy` - User ID (FK)
- `changeType` - Type of change
- `oldValue`, `newValue` - Change details
- `timestamp` - Change timestamp

## Deployment

### Deploy to Railway

#### Backend
1. Push code to GitHub
2. Connect GitHub repo to Railway
3. Add environment variables (DATABASE_URL, JWT_SECRET, FRONTEND_URL)
4. Railway automatically detects and deploys Node.js app

#### Frontend
1. Push code to GitHub
2. Connect GitHub repo to Railway or Vercel
3. Add environment variables (NEXT_PUBLIC_API_URL)
4. Railway/Vercel automatically builds and deploys

## Environment Variables

### Backend (.env)
```
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret-key"
PORT=5000
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL="http://localhost:5000/api"
```

## Security Best Practices

1. **Password Security**
   - Passwords hashed with bcryptjs (10 salt rounds)
   - Never transmitted in plain text

2. **JWT Tokens**
   - 7-day expiration
   - Include user ID, email, and role
   - Validated on every request

3. **CORS**
   - Configured to only accept frontend domain
   - Prevents unauthorized cross-origin requests

4. **SQL Injection Prevention**
   - Prisma ORM prevents SQL injection
   - Parameterized queries

5. **Input Validation**
   - Server-side validation on all endpoints
   - Client-side validation for UX

6. **Authorization**
   - Role-based access control
   - Project ownership validation
   - Task permissions checking

## Development Workflow

1. Create feature branch
2. Make changes to frontend or backend
3. Test locally
4. Create pull request
5. Review and merge
6. Deploy to staging/production

## Troubleshooting

### Backend Connection Issues
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env
- Run migrations: `npm run prisma:migrate`

### Frontend Build Errors
- Clear `.next` directory: `rm -rf .next`
- Clear node_modules: `rm -rf node_modules`
- Reinstall: `npm install`

### Authentication Issues
- Check JWT_SECRET matches between frontend and backend
- Clear localStorage in browser
- Verify token is being sent in requests

### CORS Errors
- Check FRONTEND_URL in backend .env
- Verify frontend URL matches CORS config
- Restart backend server

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - See LICENSE file for details

## Support

For questions or issues:
1. Check the backend and frontend README files
2. Review the API documentation
3. Check error logs for details
4. Open an issue on GitHub

## Next Steps

1. Set up database with Supabase or local PostgreSQL
2. Configure environment variables
3. Run migrations
4. Start both servers
5. Access application at http://localhost:3000
6. Create account and explore features
7. Deploy to Railway when ready

## Additional Features (Future)

- [ ] Email notifications
- [ ] File attachments
- [ ] Task comments
- [ ] Activity logs
- [ ] Advanced search
- [ ] Bulk operations
- [ ] Integrations (Slack, Discord)
- [ ] Mobile app
- [ ] Dark mode
- [ ] Real-time updates (WebSocket)

---

Happy coding! 🚀
