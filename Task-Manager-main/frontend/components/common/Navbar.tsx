'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="container-app flex items-center justify-between h-16">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">T</span>
          </div>
          <span className="text-xl font-bold text-gray-900">Task Manager</span>
        </Link>

        <div className="flex items-center space-x-8">
          <Link
            href="/dashboard"
            className="text-gray-700 hover:text-gray-900 font-medium"
          >
            Dashboard
          </Link>
          <Link
            href="/projects"
            className="text-gray-700 hover:text-gray-900 font-medium"
          >
            Projects
          </Link>

          <div className="flex items-center space-x-4 pl-8 border-l border-gray-200">
            <span className="text-sm text-gray-600">{user?.name}</span>
            <div className="flex items-center space-x-2">
              {user?.role === 'ADMIN' && (
                <span className="badge-info">Admin</span>
              )}
              {user?.role === 'MEMBER' && (
                <span className="badge-info">Member</span>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="btn-secondary btn-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
