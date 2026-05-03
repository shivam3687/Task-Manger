'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { dashboardAPI } from '@/lib/api';
import { DashboardOverview } from '@/types';

export default function DashboardPage() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadOverview = async (showLoader = false) => {
    try {
      if (showLoader) {
        setLoading(true);
      }

      const response = await dashboardAPI.getOverview();
      setOverview(response.data.data);
      setError('');
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Failed to load dashboard'
      );
      console.error(err);
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadOverview(true);

    const refreshInterval = window.setInterval(() => {
      loadOverview(false);
    }, 15000);

    const handleFocus = () => {
      loadOverview(false);
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      window.clearInterval(refreshInterval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-app py-8">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container-app py-8">
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">Welcome back! Here&apos;s your overview</p>
          </div>
          <button onClick={() => loadOverview(true)} className="btn-secondary btn-sm">
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <p className="text-gray-600 text-sm font-medium">Total Tasks</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {overview?.stats.totalTasks || 0}
          </p>
        </div>

        <div className="card">
          <p className="text-gray-600 text-sm font-medium">Completed</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {overview?.stats.completedTasks || 0}
          </p>
        </div>

        <div className="card">
          <p className="text-gray-600 text-sm font-medium">In Progress</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {overview?.stats.inProgressTasks || 0}
          </p>
        </div>

        <div className="card">
          <p className="text-gray-600 text-sm font-medium">To Do</p>
          <p className="text-3xl font-bold text-gray-600 mt-2">
            {overview?.stats.todoTasks || 0}
          </p>
        </div>

        <div className="card">
          <p className="text-gray-600 text-sm font-medium">Overdue</p>
          <p className="text-3xl font-bold text-red-600 mt-2">
            {overview?.stats.overdueTasks || 0}
          </p>
        </div>

        <div className="card">
          <p className="text-gray-600 text-sm font-medium">Assigned to You</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">
            {overview?.stats.assignedToYou || 0}
          </p>
        </div>
      </div>

      {/* Your Tasks Section */}
      {overview && overview.assignedTasks.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Tasks Assigned to You</h2>
          <div className="space-y-3">
            {overview.assignedTasks.slice(0, 5).map((task) => (
              <Link key={task.id} href={`/tasks/${task.id}`}>
                <div className="card hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{task.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {task.projectName} | {task.priority}
                      </p>
                    </div>
                    <div className={`badge ${
                      task.status === 'DONE' ? 'badge-success' :
                      task.status === 'IN_PROGRESS' ? 'badge-warning' :
                      'badge-info'
                    }`}>
                      {task.status}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {overview && overview.recentTasks.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Project Tasks</h2>
          <div className="space-y-3">
            {overview.recentTasks.map((task) => (
              <Link key={task.id} href={`/tasks/${task.id}`}>
                <div className="card hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{task.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {task.projectName} | Created by {task.creator}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Assigned to {task.assignees.length > 0 ? task.assignees.join(', ') : 'Nobody yet'}
                    </p>
                  </div>
                  <div className={`badge ${
                    task.status === 'DONE' ? 'badge-success' :
                    task.status === 'IN_PROGRESS' ? 'badge-warning' :
                    'badge-info'
                  }`}>
                    {task.status}
                  </div>
                </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link href="/projects" className="btn-primary">
            View All Projects
          </Link>
          <Link href="/projects/new" className="btn-primary">
            Create New Project
          </Link>
        </div>
      </div>
    </div>
  );
}
