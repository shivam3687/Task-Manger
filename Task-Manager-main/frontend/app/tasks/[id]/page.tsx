'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { taskAPI } from '@/lib/api';
import { Task } from '@/types';
import { useAuth } from '@/context/AuthContext';

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const taskId = params.id as string;

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comment, setComment] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingComment, setSavingComment] = useState(false);

  const loadTask = async () => {
    const response = await taskAPI.getById(taskId);
    setTask(response.data.data);
  };

  useEffect(() => {
    const fetchTask = async () => {
      try {
        setLoading(true);
        setError('');
        await loadTask();
      } catch (err: any) {
        setError(
          err.response?.data?.error ||
          err.response?.data?.message ||
          'Failed to load task'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [taskId]);

  const comments = useMemo(
    () => (task?.history || []).filter((entry) => entry.changeType === 'COMMENT'),
    [task]
  );

  const handleStatusChange = async (status: Task['status']) => {
    try {
      setSavingStatus(true);
      setError('');
      const response = await taskAPI.updateStatus(taskId, status);
      setTask((current) =>
        current
          ? {
              ...current,
              ...response.data.data,
              history: current.history
            }
          : response.data.data
      );
      await loadTask();
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Failed to update task status'
      );
    } finally {
      setSavingStatus(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!comment.trim()) {
      setError('Comment is required');
      return;
    }

    try {
      setSavingComment(true);
      setError('');
      const response = await taskAPI.addComment(taskId, comment.trim());
      setTask(response.data.data);
      setComment('');
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Failed to add comment'
      );
    } finally {
      setSavingComment(false);
    }
  };

  const canUpdateStatus = !!task && !!user;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="container-app py-8">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          Task not found
        </div>
      </div>
    );
  }

  return (
    <div className="container-app py-8">
      <div className="mb-8">
        <button onClick={() => router.back()} className="text-blue-600 hover:text-blue-700 mb-4">
          &larr; Back
        </button>
        <h1 className="text-3xl font-bold text-gray-900">{task.title}</h1>
        <p className="text-gray-600 mt-2">
          Project:{' '}
          {task.project ? (
            <Link href={`/projects/${task.projectId}`} className="text-blue-600 hover:text-blue-700">
              {task.project.name}
            </Link>
          ) : (
            'Unknown project'
          )}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Task Details</h2>
            <div className="space-y-4 text-sm text-gray-700">
              {task.description && <p>{task.description}</p>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium text-gray-900 mb-1">Priority</p>
                  <p>{task.priority}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900 mb-1">Due Date</p>
                  <p>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900 mb-1">Created By</p>
                  <p>{task.creator.name}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900 mb-1">Assigned Users</p>
                  <p>
                    {task.assignees.length > 0
                      ? task.assignees.map((assignment) => assignment.user.name).join(', ')
                      : 'Nobody assigned yet'}
                  </p>
                </div>
              </div>

              <div>
                <p className="font-medium text-gray-900 mb-1">Progress</p>
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(e.target.value as Task['status'])}
                  className="input max-w-xs"
                  disabled={!canUpdateStatus || savingStatus}
                >
                  <option value="TODO">TODO</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="DONE">DONE</option>
                </select>
                {!canUpdateStatus && (
                  <p className="text-xs text-gray-500 mt-2">
                    You do not have permission to change this task&apos;s progress.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Comments</h2>

            <form onSubmit={handleAddComment} className="mb-6">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="input min-h-28"
                placeholder="Add a comment for the team"
                disabled={savingComment}
              />
              <div className="mt-3">
                <button type="submit" className="btn-primary" disabled={savingComment}>
                  {savingComment ? 'Saving...' : 'Add Comment'}
                </button>
              </div>
            </form>

            <div className="space-y-3">
              {comments.length === 0 ? (
                <p className="text-sm text-gray-600">No comments yet.</p>
              ) : (
                comments
                  .slice()
                  .reverse()
                  .map((entry) => (
                    <div key={entry.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between gap-4 mb-2">
                        <p className="font-medium text-gray-900">{entry.user.name}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(entry.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <p className="text-sm text-gray-700">{entry.newValue}</p>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Activity</h2>
            <div className="space-y-3">
              {(task.history || []).length === 0 ? (
                <p className="text-sm text-gray-600">No activity recorded yet.</p>
              ) : (
                task.history
                  ?.slice()
                  .reverse()
                  .map((entry) => (
                    <div key={entry.id} className="text-sm border-b border-gray-100 pb-3">
                      <p className="font-medium text-gray-900">{entry.user.name}</p>
                      <p className="text-gray-600">
                        {entry.changeType === 'COMMENT'
                          ? 'added a comment'
                          : `updated ${entry.changeType.toLowerCase()}`}
                      </p>
                      {entry.changeType !== 'COMMENT' && entry.newValue && (
                        <p className="text-gray-500 mt-1">
                          {entry.oldValue ? `${entry.oldValue} -> ${entry.newValue}` : entry.newValue}
                        </p>
                      )}
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
