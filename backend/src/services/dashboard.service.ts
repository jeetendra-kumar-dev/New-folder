import { prisma } from "../lib/prisma";

export async function getDashboardSummary(userId: string) {
  const now = new Date();
  const nextMonth = new Date(now);
  nextMonth.setDate(now.getDate() + 30);

  const [subscriptions, goals, unreadNotifications, memories, upcomingRenewals, subscriptionSpend, workspaceCounts] =
    await Promise.all([
    prisma.subscription.count({ where: { userId } }),
    prisma.goal.groupBy({
      by: ["status"],
      where: { userId },
      _count: { _all: true },
    }),
    prisma.notification.count({ where: { userId, isRead: false } }),
    prisma.memory.count({ where: { userId } }),
    prisma.subscription.findMany({
      where: {
        userId,
        renewalDate: {
          gte: now,
          lte: nextMonth,
        },
      },
      select: {
        id: true,
        serviceName: true,
        renewalDate: true,
        amount: true,
      },
      orderBy: { renewalDate: "asc" },
      take: 5,
    }),
    prisma.subscription.aggregate({
      where: { userId },
      _sum: { amount: true },
    }),
    Promise.all([
      prisma.section.count({ where: { userId } }),
      prisma.roadmap.count({ where: { userId } }),
      prisma.note.count({ where: { userId } }),
      prisma.photo.count({ where: { userId } }),
      prisma.video.count({ where: { userId } }),
      prisma.graphic.count({ where: { userId } }),
    ]),
  ]);

  const activeGoals = goals.find((goal) => goal.status === "IN_PROGRESS")?._count._all ?? 0;
  const completedGoals = goals.find((goal) => goal.status === "COMPLETED")?._count._all ?? 0;

  const [sections, roadmaps, notes, photos, videos, graphics] = workspaceCounts;

  return {
    metrics: {
      subscriptions,
      monthlySpend: Number(subscriptionSpend._sum.amount ?? 0),
      activeGoals,
      completedGoals,
      unreadNotifications,
      memories,
      sections,
      roadmaps,
      notes,
      photos,
      videos,
      graphics,
    },
    upcomingRenewals: upcomingRenewals.map((renewal) => ({
      ...renewal,
      amount: Number(renewal.amount),
    })),
  };
}
