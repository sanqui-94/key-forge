"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { subDays, format, startOfDay, endOfDay } from "date-fns";

export async function getUsageOverview() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const [totalRequests, activeKeys, errorRequests] = await Promise.all([
    prisma.usageLog.count({
      where: { userId },
    }),
    prisma.apiKey.count({
      where: {
        userId,
        revokedAt: null,
      },
    }),
    prisma.usageLog.count({
      where: {
        userId,
        status: { gte: 400 },
      },
    }),
  ]);

  const errorRate =
    totalRequests > 0 ? (errorRequests / totalRequests) * 100 : 0;

  return {
    totalRequests,
    activeKeys,
    errorRate: parseFloat(errorRate.toFixed(2)),
  };
}

export async function getUsageChartData(days = 30) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const startDate = startOfDay(subDays(new Date(), days - 1));
  const endDate = endOfDay(new Date());

  const logs = await prisma.usageLog.findMany({
    where: {
      userId,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      createdAt: true,
    },
  });

  // Initialize data array with 0s for the past `days`
  const dataMap = new Map<string, number>();
  for (let i = days - 1; i >= 0; i--) {
    const date = format(subDays(new Date(), i), "MMM dd");
    dataMap.set(date, 0);
  }

  // Populate map with logs
  logs.forEach((log) => {
    const dateStr = format(log.createdAt, "MMM dd");
    if (dataMap.has(dateStr)) {
      dataMap.set(dateStr, dataMap.get(dateStr)! + 1);
    }
  });

  // Convert to array
  return Array.from(dataMap.entries()).map(([date, requests]) => ({
    date,
    requests,
  }));
}
