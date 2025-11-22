import { useState } from "react";

export function useAdminDateRange() {
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(),
  });

  const setFromDate = (date: Date) => {
    setDateRange((prev) => ({ ...prev, from: date }));
  };

  const setToDate = (date: Date) => {
    setDateRange((prev) => ({ ...prev, to: date }));
  };

  const resetToCurrentMonth = () => {
    setDateRange({
      from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      to: new Date(),
    });
  };

  return {
    dateRange,
    setFromDate,
    setToDate,
    resetToCurrentMonth,
  };
}
