import { getDashboardMetrics } from "@/app/actions";
import ResilienceClient from "@/components/ResilienceClient";

export const dynamic = "force-dynamic";

export default async function ResiliencePage() {
  const metrics = await getDashboardMetrics();
  return <ResilienceClient metrics={metrics} />;
}
