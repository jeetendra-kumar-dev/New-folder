export type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type User = {
  id: string;
  email: string;
  name: string | null;
  role: "USER" | "ADMIN";
  createdAt: string;
  updatedAt?: string;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  tokenType: "Bearer";
  accessTokenExpiresIn: string;
  refreshTokenExpiresIn: string;
};

export type AuthSession = {
  user: User;
  tokens: AuthTokens;
};

export type OtpRequestResult = {
  email: string;
  expiresAt: string;
  delivery: {
    delivered: boolean;
    channel: "email" | "console";
  };
  debugCode?: string;
};

export type Subscription = {
  id: string;
  serviceName: string;
  renewalDate: string;
  amount: number;
  category: string;
  autoRenew: boolean;
  reminderDays: number[];
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Goal = {
  id: string;
  title: string;
  description?: string | null;
  totalDays: number;
  completedDays: number;
  progressPercent: number;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "ARCHIVED";
  startedAt: string;
  targetDate?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Memory = {
  id: string;
  type: "PREFERENCE" | "FACT" | "CONTEXT" | "INSIGHT" | "REMINDER" | "OTHER";
  title?: string | null;
  content: string;
  importance: number;
  source?: string | null;
  metadata?: Record<string, unknown> | null;
  lastAccessedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Notification = {
  id: string;
  type: "SUBSCRIPTION_RENEWAL" | "GOAL_REMINDER" | "MEMORY_INSIGHT" | "SYSTEM";
  message: string;
  isRead: boolean;
  readAt?: string | null;
  subscriptionId?: string | null;
  goalId?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};

export type NotificationList = {
  unreadCount: number;
  notifications: Notification[];
};

export type DashboardSummary = {
  metrics: {
    subscriptions: number;
    monthlySpend: number;
    activeGoals: number;
    completedGoals: number;
    unreadNotifications: number;
    memories: number;
    sections: number;
    roadmaps: number;
    notes: number;
    photos: number;
    videos: number;
    graphics: number;
  };
  upcomingRenewals: Array<{
    id: string;
    serviceName: string;
    renewalDate: string;
    amount: number;
  }>;
};

export type SectionRef = { id: string; name: string; color: string };
export type TypeRef = { id: string; name: string; color: string | null };

export type Section = {
  id: string;
  name: string;
  description?: string | null;
  color: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type ContentType = {
  id: string;
  name: string;
  color?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type RoadmapMilestone = {
  id: string;
  title: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  dueDate?: string | null;
  sortOrder: number;
};

export type Roadmap = {
  id: string;
  title: string;
  description?: string | null;
  status: "DRAFT" | "ACTIVE" | "COMPLETED" | "ARCHIVED";
  sectionId?: string | null;
  typeId?: string | null;
  section?: SectionRef | null;
  type?: TypeRef | null;
  milestones: RoadmapMilestone[];
  createdAt: string;
  updatedAt: string;
};

export type Note = {
  id: string;
  title: string;
  content: string;
  tags: string[];
  sectionId?: string | null;
  typeId?: string | null;
  section?: SectionRef | null;
  type?: TypeRef | null;
  createdAt: string;
  updatedAt: string;
};

export type Photo = {
  id: string;
  title: string;
  url: string;
  caption?: string | null;
  tags: string[];
  sectionId?: string | null;
  typeId?: string | null;
  section?: SectionRef | null;
  type?: TypeRef | null;
  createdAt: string;
  updatedAt: string;
};

export type Video = {
  id: string;
  title: string;
  url: string;
  caption?: string | null;
  tags: string[];
  sectionId?: string | null;
  typeId?: string | null;
  section?: SectionRef | null;
  type?: TypeRef | null;
  createdAt: string;
  updatedAt: string;
};

export type Graphic = {
  id: string;
  title: string;
  url: string;
  kind: "DIAGRAM" | "CHART" | "MOCKUP" | "ICON" | "ILLUSTRATION" | "OTHER";
  description?: string | null;
  tags: string[];
  sectionId?: string | null;
  typeId?: string | null;
  section?: SectionRef | null;
  type?: TypeRef | null;
  createdAt: string;
  updatedAt: string;
};

export type AiMessage = {
  id: string;
  role: "USER" | "ASSISTANT" | "SYSTEM";
  content: string;
  createdAt: string;
};

export type AiConversationSummary = {
  id: string;
  title?: string | null;
  createdAt: string;
  updatedAt: string;
  _count: { messages: number };
};

export type AiConversation = {
  id: string;
  title?: string | null;
  createdAt: string;
  updatedAt: string;
  messages: AiMessage[];
};

export type AiChatResult = {
  conversationId: string;
  message: AiMessage;
  mode: "openai" | "local";
};

export type AiModelId =
  | "portfolio-mentor"
  | "subscription-optimizer"
  | "goal-coach"
  | "content-classifier"
  | "model-architect";

export type AiModel = {
  id: AiModelId;
  name: string;
  category: "advisor" | "analyzer" | "classifier" | "architect";
  level: "foundation" | "intermediate" | "advanced";
  description: string;
  inputHint: string;
  outputShape: string[];
  stackSkills: string[];
  deploymentPath: string;
  teachingPoints: string[];
};

export type AiModelRunResult = {
  runId: string;
  model: AiModel;
  mode: "openai" | "local";
  input: string;
  output: string;
  teachingPoints: string[];
  contextStats: {
    subscriptionCount: number;
    subscriptionTotal: number;
    activeGoalCount: number;
    memoryCount: number;
    roadmapCount: number;
    openMilestones: string[];
    contentCounts: {
      notes: number;
      photos: number;
      videos: number;
      graphics: number;
      sections: number;
    };
  };
  createdAt: string;
};
