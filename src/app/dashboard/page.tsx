import { AnalyticsOverview } from "@/components/dashboard/analytics-overview";

export default function Dashboard() {
  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl font-headline">Dashboard</h1>
      </div>
      <AnalyticsOverview />
    </>
  );
}
