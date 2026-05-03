'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { projectAPI, taskAPI, teamAPI } from '@/lib/api';
import { Project, Task, UserSummary } from '@/types';
import { useAuth } from '@/context/AuthContext';

type TaskFormState = {
  title: string;
  description: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate: string;
  assignedUserIds: string[];
};

const emptyTaskForm: TaskFormState = {
  title: '',
  description: '',
  status: 'TODO',
  priority: 'MEDIUM',
  dueDate: '',
  assignedUserIds: []
};

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [taskError, setTaskError] = useState('');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [taskForm, setTaskForm] = useState<TaskFormState>(emptyTaskForm);
  const [taskSubmitting, setTaskSubmitting] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<UserSummary[]>([]);
  const [memberForm, setMemberForm] = useState({
    userId: '',
    role: 'MEMBER'
  });
  const [memberSubmitting, setMemberSubmitting] = useState(false);

  const isAdmin = project?.adminId === user?.id;

  const loadProject = async () => {
    const response = await projectAPI.getById(projectId);
    setProject(response.data.data);
  };

  const loadAvailableUsers = async () => {
    if (!isAdmin) {
      setAvailableUsers([]);
      return;
    }

    const response = await teamAPI.getAvailableUsers(projectId);
    setAvailableUsers(response.data.data);
  };

  const refreshProjectData = async () => {
    const response = await projectAPI.getById(projectId);
    const nextProject = response.data.data as Project;
    setProject(nextProject);

    if (nextProject.adminId === user?.id) {
      const usersResponse = await teamAPI.getAvailableUsers(projectId);
      setAvailableUsers(usersResponse.data.data);
    } else {
      setAvailableUsers([]);
    }
  };

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await projectAPI.getById(projectId);
        const fetchedProject = response.data.data as Project;
        setProject(fetchedProject);

        if (fetchedProject.adminId === user?.id) {
          const usersResponse = await teamAPI.getAvailableUsers(projectId);
          setAvailableUsers(usersResponse.data.data);
        } else {
          setAvailableUsers([]);
        }
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load project');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId, user?.id]);

  const assignableUsers = project
    ? [project.admin, ...project.teamMembers.map((member) => member.user)]
    : [];

  const isTaskEditable = (task: Task) => {
    if (!user) {
      return false;
    }

    return (
      task.createdBy === user.id ||
      task.assignees.some((assignment) => assignment.userId === user.id) ||
      project?.adminId === user.id
    );
  };

  const resetTaskForm = () => {
    setTaskForm(emptyTaskForm);
    setEditingTaskId(null);
    setShowTaskForm(false);
    setTaskError('');
  };

  const openCreateTaskForm = () => {
    setEditingTaskId(null);
    setTaskForm(emptyTaskForm);
    setTaskError('');
    setShowTaskForm(true);
  };

  const openEditTaskForm = (task: Task) => {
    setEditingTaskId(task.id);
    setTaskForm({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
      assignedUserIds: task.assignees.map((assignment) => assignment.userId)
    });
    setTaskError('');
    setShowTaskForm(true);
  };

  const handleAssignedUserToggle = (userId: string) => {
    setTaskForm((current) => ({
      ...current,
      assignedUserIds: current.assignedUserIds.includes(userId)
        ? current.assignedUserIds.filter((id) => id !== userId)
        : [...current.assignedUserIds, userId]
    }));
  };

  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!taskForm.title.trim()) {
      setTaskError('Task title is required');
      return;
    }

    setTaskSubmitting(true);
    setTaskError('');

    const payload = {
      title: taskForm.title.trim(),
      description: taskForm.description.trim() || undefined,
      status: taskForm.status,
      priority: taskForm.priority,
      dueDate: taskForm.dueDate || '',
      ...(isAdmin ? { assignedUserIds: taskForm.assignedUserIds } : {})
    };

    try {
      if (editingTaskId) {
        await taskAPI.update(editingTaskId, payload);
      } else {
        await taskAPI.create(projectId, payload);
      }

      await refreshProjectData();
      resetTaskForm();
    } catch (err: any) {
      setTaskError(err.response?.data?.error || 'Failed to save task');
    } finally {
      setTaskSubmitting(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      setError('');
      await taskAPI.delete(taskId);
      await refreshProjectData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete task');
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!memberForm.userId) {
      setError('Please select a user to add');
      return;
    }

    setMemberSubmitting(true);
    setError('');

    try {
      await teamAPI.addMember(projectId, memberForm);
      setMemberForm({ userId: '', role: 'MEMBER' });
      await refreshProjectData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add team member');
    } finally {
      setMemberSubmitting(false);
    }
  };

  const handleRemoveMember = async (memberUserId: string) => {
    try {
      setError('');
      await teamAPI.removeMember(projectId, memberUserId);
      await refreshProjectData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to remove team member');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container-app py-8">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          Project not found
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
        <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
        {project.description && (
          <p className="text-gray-600 mt-2">{project.description}</p>
        )}
      </div>

      {(error || taskError) && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error || taskError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Tasks</h2>
              <p className="text-sm text-gray-600 mt-1">
                Project admins can assign tasks to one or more users and edit those assignments.
              </p>
            </div>
            <button
              onClick={() => (showTaskForm ? resetTaskForm() : openCreateTaskForm())}
              className="btn-primary btn-sm"
            >
              {showTaskForm ? 'Cancel' : 'Add Task'}
            </button>
          </div>

          {showTaskForm && (
            <form onSubmit={handleTaskSubmit} className="card mb-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={taskForm.title}
                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                    className="input"
                    placeholder="Task title"
                    disabled={taskSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={taskForm.description}
                    onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                    className="input"
                    placeholder="Task description"
                    rows={3}
                    disabled={taskSubmitting}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={taskForm.status}
                      onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value as TaskFormState['status'] })}
                      className="input"
                      disabled={taskSubmitting}
                    >
                      <option value="TODO">TODO</option>
                      <option value="IN_PROGRESS">IN_PROGRESS</option>
                      <option value="DONE">DONE</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <select
                      value={taskForm.priority}
                      onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as TaskFormState['priority'] })}
                      className="input"
                      disabled={taskSubmitting}
                    >
                      <option value="LOW">LOW</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="HIGH">HIGH</option>
                      <option value="URGENT">URGENT</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={taskForm.dueDate}
                      onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                      className="input"
                      disabled={taskSubmitting}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assigned Users
                  </label>
                  {isAdmin ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {assignableUsers.map((assignableUser) => (
                        <label
                          key={assignableUser.id}
                          className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg"
                        >
                          <input
                            type="checkbox"
                            checked={taskForm.assignedUserIds.includes(assignableUser.id)}
                            onChange={() => handleAssignedUserToggle(assignableUser.id)}
                            disabled={taskSubmitting}
                          />
                          <div>
                            <p className="font-medium text-gray-900">{assignableUser.name}</p>
                            <p className="text-xs text-gray-600">{assignableUser.email}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600">
                      Only the project admin can change task assignees.
                    </p>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={taskSubmitting}
                  >
                    {taskSubmitting ? 'Saving...' : editingTaskId ? 'Update Task' : 'Create Task'}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={resetTaskForm}
                    disabled={taskSubmitting}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          )}

          {!project.tasks || project.tasks.length === 0 ? (
            <div className="card text-center py-8">
              <p className="text-gray-600">No tasks yet. Create one to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {project.tasks.map((task) => (
                <div key={task.id} className="card">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900">{task.title}</h3>
                        <span className={`badge ${
                          task.status === 'DONE' ? 'badge-success' :
                          task.status === 'IN_PROGRESS' ? 'badge-warning' :
                          'badge-info'
                        }`}>
                          {task.status}
                        </span>
                        <span className={`badge ${
                          task.priority === 'URGENT' ? 'badge-danger' :
                          task.priority === 'HIGH' ? 'badge-warning' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {task.priority}
                        </span>
                      </div>

                      {task.description && (
                        <p className="text-gray-600 text-sm mt-2">{task.description}</p>
                      )}

                      <div className="mt-3 space-y-1 text-sm text-gray-600">
                        <p>Created by {task.creator.name}</p>
                        <p>
                          Assigned to{' '}
                          {task.assignees.length > 0
                            ? task.assignees.map((assignment) => assignment.user.name).join(', ')
                            : 'Nobody yet'}
                        </p>
                        {task.dueDate && <p>Due on {new Date(task.dueDate).toLocaleDateString()}</p>}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link href={`/tasks/${task.id}`} className="btn-secondary btn-sm">
                        Open
                      </Link>
                      {isTaskEditable(task) && (
                        <button
                          onClick={() => openEditTaskForm(task)}
                          className="btn-secondary btn-sm"
                        >
                          Edit
                        </button>
                      )}
                      {(task.createdBy === user?.id || isAdmin) && (
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="btn-danger btn-sm"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="card">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Project Admin</h3>
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
              <p className="font-medium text-gray-900">{project.admin.name}</p>
              <p className="text-xs text-gray-600">{project.admin.email}</p>
            </div>
          </div>

          <div className="card">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Team Members</h3>

            {isAdmin && (
              <form onSubmit={handleAddMember} className="space-y-3 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Add User
                  </label>
                  <select
                    value={memberForm.userId}
                    onChange={(e) => setMemberForm({ ...memberForm, userId: e.target.value })}
                    className="input"
                    disabled={memberSubmitting || availableUsers.length === 0}
                  >
                    <option value="">Select a user</option>
                    {availableUsers.map((availableUser) => (
                      <option key={availableUser.id} value={availableUser.id}>
                        {availableUser.name} ({availableUser.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Role
                  </label>
                  <select
                    value={memberForm.role}
                    onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}
                    className="input"
                    disabled={memberSubmitting}
                  >
                    <option value="MEMBER">MEMBER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full"
                  disabled={memberSubmitting || availableUsers.length === 0}
                >
                  {memberSubmitting ? 'Adding...' : 'Add Team Member'}
                </button>

                {availableUsers.length === 0 && (
                  <p className="text-xs text-gray-600">No more users are available to add.</p>
                )}
              </form>
            )}

            <div className="space-y-3">
              {project.teamMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{member.user.name}</p>
                    <p className="text-xs text-gray-600">{member.user.email}</p>
                    <p className="text-xs text-gray-500 mt-1">Project role: {member.role}</p>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => handleRemoveMember(member.userId)}
                      className="btn-danger btn-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}

              {project.teamMembers.length === 0 && (
                <p className="text-gray-600 text-sm">No team members added yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
