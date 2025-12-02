import { StatsOverview } from "@/components/dashboard/stats-overview";
import { RecentActivity } from "@/components/dashboard/recent-activity";

export default async function DashboardPage() {
  // Authentication disabled for frontend design purposes

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Panel de Control</h1>
        <p className="text-muted-foreground">
          Bienvenido al Sistema Integral de Gestión Procesal Judicial (SIGPJ)
        </p>
      </div>
      <StatsOverview />
      <div className="w-full">
        <RecentActivity />
      </div>
    </div>
  );
} 