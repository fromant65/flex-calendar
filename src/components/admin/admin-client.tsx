"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { useAdminDateRange } from "./hooks/use-admin-date-range";
import { useAdminStats } from "./hooks/use-admin-stats";
import { DateRangePicker } from "./date-range-picker";
import { GlobalStatsCards } from "./global-stats-cards";
import { UserActivityTable } from "./user-activity-table";
import { AllUsersTable } from "./all-users-table";
import { NotificationsSection } from "./notifications-section";

export function AdminClient() {
  const { dateRange, setFromDate, setToDate, resetToCurrentMonth } = useAdminDateRange();
  const { globalStats, userActivityStats, userCounts, allUsersWithStats } = useAdminStats(dateRange);

  return (
    <div className="container mx-auto py-6 px-4 space-y-4 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold">Panel de Administración</h1>
        <p className="text-sm text-muted-foreground">Estadísticas generales y gestión de usuarios</p>
      </div>

      {/* Date Range Picker */}
      <DateRangePicker
        dateRange={dateRange}
        onFromDateChange={setFromDate}
        onToDateChange={setToDate}
        onReset={resetToCurrentMonth}
      />

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="inline-flex h-auto w-full flex-nowrap overflow-x-auto bg-muted p-1 md:grid md:grid-cols-4 md:overflow-visible">
          <TabsTrigger value="overview" className="whitespace-nowrap flex-shrink-0">General</TabsTrigger>
          <TabsTrigger value="activity" className="whitespace-nowrap flex-shrink-0">Actividad</TabsTrigger>
          <TabsTrigger value="users" className="whitespace-nowrap flex-shrink-0">Usuarios</TabsTrigger>
          <TabsTrigger value="notifications" className="whitespace-nowrap flex-shrink-0">Notificaciones</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <GlobalStatsCards
            globalStats={globalStats.data}
            userCounts={userCounts.data}
            isLoading={globalStats.isLoading || userCounts.isLoading}
          />
        </TabsContent>

        <TabsContent value="activity" className="space-y-4 mt-4">
          <UserActivityTable
            userActivityStats={userActivityStats.data}
            isLoading={userActivityStats.isLoading}
          />
        </TabsContent>

        <TabsContent value="users" className="space-y-4 mt-4">
          <AllUsersTable
            allUsersWithStats={allUsersWithStats.data}
            isLoading={allUsersWithStats.isLoading}
          />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4 mt-4">
          <NotificationsSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
