import { prisma } from "../lib/prisma";

export async function buildUserContext(userId: string) {
  const [user, subscriptions, goals, memories, sections, contentTypes, roadmaps, notes, photos, videos, graphics] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, name: true, role: true },
      }),
      prisma.subscription.findMany({
        where: { userId },
        select: {
          serviceName: true,
          renewalDate: true,
          amount: true,
          category: true,
          autoRenew: true,
          notes: true,
        },
        orderBy: { renewalDate: "asc" },
        take: 50,
      }),
      prisma.goal.findMany({
        where: { userId },
        select: {
          title: true,
          description: true,
          status: true,
          totalDays: true,
          completedDays: true,
          progressPercent: true,
          targetDate: true,
        },
        take: 50,
      }),
      prisma.memory.findMany({
        where: { userId },
        select: { type: true, title: true, content: true, importance: true, source: true },
        orderBy: [{ importance: "desc" }, { updatedAt: "desc" }],
        take: 40,
      }),
      prisma.section.findMany({
        where: { userId },
        select: { id: true, name: true, description: true, color: true },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.contentType.findMany({
        where: { userId },
        select: { id: true, name: true, color: true },
      }),
      prisma.roadmap.findMany({
        where: { userId },
        select: {
          title: true,
          description: true,
          status: true,
          section: { select: { name: true } },
          type: { select: { name: true } },
          milestones: {
            select: { title: true, status: true, dueDate: true, sortOrder: true },
            orderBy: { sortOrder: "asc" },
          },
        },
        take: 30,
      }),
      prisma.note.findMany({
        where: { userId },
        select: {
          title: true,
          content: true,
          tags: true,
          section: { select: { name: true } },
          type: { select: { name: true } },
        },
        take: 40,
      }),
      prisma.photo.findMany({
        where: { userId },
        select: { title: true, url: true, caption: true, tags: true, section: { select: { name: true } } },
        take: 30,
      }),
      prisma.video.findMany({
        where: { userId },
        select: { title: true, url: true, caption: true, tags: true, section: { select: { name: true } } },
        take: 30,
      }),
      prisma.graphic.findMany({
        where: { userId },
        select: {
          title: true,
          url: true,
          kind: true,
          description: true,
          tags: true,
          section: { select: { name: true } },
        },
        take: 30,
      }),
    ]);

  return {
    user,
    subscriptions: subscriptions.map((s) => ({ ...s, amount: Number(s.amount) })),
    goals: goals.map((g) => ({ ...g, progressPercent: Number(g.progressPercent) })),
    memories,
    sections,
    contentTypes,
    roadmaps,
    notes: notes.map((n) => ({
      title: n.title,
      content: n.content.length > 500 ? `${n.content.slice(0, 500)}...` : n.content,
      tags: n.tags,
      section: n.section?.name,
      type: n.type?.name,
    })),
    photos,
    videos,
    graphics,
  };
}
