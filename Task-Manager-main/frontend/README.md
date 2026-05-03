# Team Task Manager - Frontend

A modern Next.js frontend for the Team Task Manager application with role-based access control.

## Tech Stack

- **Framework:** Next.js 16 with React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios
- **State Management:** React Context API + Zustand
- **Form Handling:** React Hook Form (optional)

## Features

- User Authentication (Login/Signup)
- Project Management
- Task Management & Tracking
- Team Member Management
- Dashboard with Stats Overview
- Role-Based Access Control (Admin/Member)
- Real-time API Integration
- Responsive Design

## Prerequisites

- Node.js 18+
- npm or yarn package manager

## Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file based on `.env.local.example`:
```bash
cp .env.local.example .env.local
```

4. Update the `.env.local` file with your backend API URL:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
frontend/
├── app/
│   ├── auth/
│   │   ├── login/          # Login page
│   │   └── signup/         # Signup page
│   ├── dashboard/          # Protected dashboard
│   ├── projects/           # Projects management
│   │   ├── [id]/          # Project details
│   │   └── new/           # Create project
│   ├── tasks/             # Task details
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/
│   ├── auth/              # Auth components
│   ├── projects/          # Project components
│   ├── tasks/             # Task components
│   ├── dashboard/         # Dashboard components
│   └── common/            # Shared components
├── context/
│   └── AuthContext.tsx    # Authentication context
├── lib/
│   └── api.ts             # API client functions
├── types/
│   └── index.ts           # TypeScript types
├── public/                # Static assets
└── package.json
```

## Key Pages

### `/auth/login`
User login with email and password. JWT token is stored in localStorage.

### `/auth/signup`
New user registration with validation.

### `/dashboard`
Main dashboard showing:
- Task statistics
- Tasks assigned to the user
- Recent activities
- Quick action buttons

### `/projects`
List all projects where user is admin or team member.

### `/projects/[id]`
Project detail view with:
- Task list with create/edit/delete
- Team members
- Project info
- Task filtering and sorting

### `/projects/new`
Create new project (Admin only).

## Authentication Flow

1. User navigates to `/auth/login` or `/auth/signup`
2. Credentials are sent to backend API
3. Backend returns JWT token and user info
4. Token and user data are stored in localStorage
5. Token is automatically included in all API requests via interceptor
6. Protected routes check authentication before rendering
7. If token expires (401), user is redirected to login

## API Integration

All API calls are handled through `/lib/api.ts` using Axios:

- **authAPI** - Login, signup, profile
- **projectAPI** - CRUD operations for projects
- **teamAPI** - Manage team members
- **taskAPI** - CRUD operations for tasks
- **dashboardAPI** - Dashboard statistics

## Environment Variables

- `NEXT_PUBLIC_API_URL` - Backend API base URL (default: `http://localhost:5000/api`)

## State Management

- **Authentication:** React Context API (`AuthContext`)
- **UI State:** React hooks (useState)
- **Optional:** Zustand for complex state

## Styling

Uses Tailwind CSS with custom utility classes defined in `globals.css`:
- `.btn` - Button base styles
- `.btn-primary` - Primary button
- `.btn-secondary` - Secondary button
- `.btn-danger` - Danger button
- `.input` - Input field
- `.card` - Card component
- `.badge` - Badge labels

## Error Handling

- API errors are caught and displayed to users
- 401 errors trigger automatic logout
- Form validation with user-friendly messages
- Try-catch blocks for async operations

## Deployment

### Railway Deployment

1. Connect GitHub repository to Railway
2. Set environment variables:
   - `NEXT_PUBLIC_API_URL` - Your backend API URL

3. Railway will automatically run `npm run build && npm start`

### Vercel Deployment

1. Connect GitHub repository to Vercel
2. Set environment variable:
   - `NEXT_PUBLIC_API_URL` - Your backend API URL

3. Vercel will automatically build and deploy on push

## Security Considerations

1. **JWT Tokens:** Stored in localStorage (not httpOnly)
2. **CORS:** Backend is configured to accept requests from specified origins
3. **Input Validation:** Form inputs are validated before submission
4. **Authorization:** Client-side checks prevent unauthorized access (Server-side validation on backend)

## Performance Optimizations

- Server-side rendering with Next.js
- Dynamic imports for code splitting
- Image optimization with Next.js Image component
- Caching with SWR (optional implementation)
- Lazy loading of components

## Troubleshooting

### API Connection Issues
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Ensure backend is running on the specified port
- Check CORS configuration in backend

### Authentication Issues
- Clear localStorage if token is invalid
- Check token expiry time
- Ensure backend JWT_SECRET matches

### Build Issues
- Delete `node_modules` and `.next` directory
- Run `npm install` again
- Clear npm cache with `npm cache clean --force`

## Support

For issues or questions, please refer to the main project README or contact the development team.
