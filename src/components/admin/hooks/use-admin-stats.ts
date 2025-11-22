import { api } from "~/trpc/react";

export function useAdminStats(dateRange: { from: Date; to: Date }) {
  const globalStats = api.admin.getGlobalStats.useQuery({
    startDate: dateRange.from,
    endDate: dateRange.to,
  });

  const userActivityStats = api.admin.getUserActivityStats.useQuery({
    startDate: dateRange.from,
    endDate: dateRange.to,
  });

  const userCounts = api.admin.getUserCounts.useQuery();

  const allUsersWithStats = api.admin.getAllUsersWithStats.useQuery();

  return {
    globalStats,
    userActivityStats,
    userCounts,
    allUsersWithStats,
  };
}
