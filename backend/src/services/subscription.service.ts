import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import type { CreateSubscriptionInput, UpdateSubscriptionInput } from "../types/subscription";
import { AppError } from "../utils/app-error";
import { createNotification } from "./notification.service";

const subscriptionSelect = {
  id: true,
  serviceName: true,
  renewalDate: true,
  amount: true,
  category: true,
  autoRenew: true,
  reminderDays: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.SubscriptionSelect;

type SubscriptionRecord = Prisma.SubscriptionGetPayload<{ select: typeof subscriptionSelect }>;

function serializeSubscription(subscription: SubscriptionRecord) {
  return {
    ...subscription,
    amount: Number(subscription.amount),
  };
}

export async function listSubscriptions(userId: string) {
  const subscriptions = await prisma.subscription.findMany({
    where: { userId },
    select: subscriptionSelect,
    orderBy: [{ renewalDate: "asc" }, { createdAt: "desc" }],
  });

  return subscriptions.map(serializeSubscription);
}

export async function createSubscription(userId: string, input: CreateSubscriptionInput) {
  const subscription = await prisma.subscription.create({
    data: {
      userId,
      serviceName: input.serviceName,
      renewalDate: new Date(input.renewalDate),
      amount: input.amount,
      category: input.category,
      autoRenew: input.autoRenew,
      reminderDays: input.reminderDays,
      notes: input.notes,
    },
    select: subscriptionSelect,
  });

  await createNotification({
    userId,
    subscriptionId: subscription.id,
    type: "SUBSCRIPTION_RENEWAL",
    message: `${subscription.serviceName} renews on ${subscription.renewalDate.toLocaleDateString("en-US")}.`,
    metadata: {
      amount: Number(subscription.amount),
      category: subscription.category,
    },
  });

  return serializeSubscription(subscription);
}

export async function updateSubscription(userId: string, id: string, input: UpdateSubscriptionInput) {
  const existing = await prisma.subscription.findFirst({
    where: { id, userId },
    select: { id: true },
  });

  if (!existing) {
    throw new AppError("Subscription not found", 404, "SUBSCRIPTION_NOT_FOUND");
  }

  const updated = await prisma.subscription.update({
    where: { id },
    data: {
      serviceName: input.serviceName,
      renewalDate: input.renewalDate ? new Date(input.renewalDate) : undefined,
      amount: input.amount,
      category: input.category,
      autoRenew: input.autoRenew,
      reminderDays: input.reminderDays,
      notes: input.notes,
    },
    select: subscriptionSelect,
  });

  return serializeSubscription(updated);
}

export async function deleteSubscription(userId: string, id: string) {
  const existing = await prisma.subscription.findFirst({
    where: { id, userId },
    select: { id: true },
  });

  if (!existing) {
    throw new AppError("Subscription not found", 404, "SUBSCRIPTION_NOT_FOUND");
  }

  await prisma.subscription.delete({ where: { id } });
  return { deleted: true };
}
