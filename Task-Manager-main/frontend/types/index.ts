export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'MEMBER';
  createdAt: string;
}

export interface UserSummary {
  id: string;
  email: string;
  name: string;
  role?: 'ADMIN' | 'MEMBER';
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  adminId: string;
  admin: {
    id: string;
    name: string;
    email: string;
  };
  teamMembers: TeamMember[];
  tasks: Task[];
  _count?: {
    tasks: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  id: string;
  projectId: string;
  userId: string;
  role: 'ADMIN' | 'MEMBER';
  joinedAt: string;
  user: UserSummary;
}

export interface TaskAssignee {
  id: string;
  userId: string;
  assignedAt: string;
  user: UserSummary;
}

export interface TaskHistoryEntry {
  id: string;
  taskId: string;
  changedBy: string;
  changeType: string;
  oldValue?: string | null;
  newValue?: string | null;
  timestamp: string;
  user: {
    id: string;
    name: string;
  };
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  createdBy: string;
  dueDate?: string | null;
  createdAt: string;
  updatedAt: string;
  assignees: TaskAssignee[];
  creator: UserSummary;
  project?: {
    id: string;
    name: string;
    adminId?: string;
  };
  history?: TaskHistoryEntry[];
}

export interface DashboardAssignedTask {
  id: string;
  title: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  projectName: string;
  dueDate?: string | null;
}

export interface DashboardRecentTask {
  id: string;
  title: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  projectName: string;
  assignees: string[];
  creator: string;
  createdAt: string;
}

export interface DashboardOverview {
  stats: {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    todoTasks: number;
    overdueTasks: number;
    assignedToYou: number;
  };
  assignedTasks: DashboardAssignedTask[];
  recentTasks: DashboardRecentTask[];
}
