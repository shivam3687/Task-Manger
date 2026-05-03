'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { projectAPI } from '@/lib/api';
import { Project } from '@/types';
import { useAuth } from '@/context/AuthContext';

export default function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await projectAPI.getAll();
        setProjects(response.data.data);
      } catch (err: any) {
        setError('Failed to load projects');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container-app py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600 mt-2">Manage your projects and teams</p>
        </div>
        {user?.role === 'ADMIN' && (
          <Link href="/projects/new" className="btn-primary">
            Create Project
          </Link>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {projects.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-600 mb-4">No projects yet</p>
          {user?.role === 'ADMIN' && (
            <Link href="/projects/new" className="btn-primary">
              Create Your First Project
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <div className="card hover:shadow-lg transition-shadow cursor-pointer h-full">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold text-gray-900 flex-1">{project.name}</h3>
                  {project.adminId === user?.id && (
                    <span className="badge-info text-xs">Admin</span>
                  )}
                </div>
                {project.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {project.description}
                  </p>
                )}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      {project._count?.tasks || 0} tasks
                    </span>
                    <span className="text-gray-600">
                      {project.teamMembers.length} members
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
