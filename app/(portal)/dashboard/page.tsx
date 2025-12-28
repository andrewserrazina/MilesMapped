import Link from "next/link";
import { activities, clients, trips } from "@/lib/mock/data";
import PageHeader from "@/components/page-header";
import KPIStatCard from "@/components/kpi-stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const kpis = [
  { label: "Active Clients", value: clients.filter((c) => c.status === "Active").length.toString() },
  { label: "Trips In Progress", value: trips.filter((t) => t.status === "Searching" || t.status === "Draft Ready").length.toString() },
  { label: "Trips Delivered", value: trips.filter((t) => t.status === "Sent" || t.status === "Booked").length.toString() },
  { label: "Avg Points Saved", value: "48k" },
  { label: "Revenue MTD", value: "$18.4k" },
  { label: "Pending Followups", value: "6" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Daily performance snapshot and workflow queue."
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/clients"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              New Client
            </Link>
            <Link
              href="/trips"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              New Trip
            </Link>
            <Link href="/award-search" className={cn(buttonVariants({}))}>
              Award Search
            </Link>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {kpis.map((kpi) => (
          <KPIStatCard key={kpi.label} {...kpi} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <Badge variant="secondary">{activity.category}</Badge>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {activity.title}
                  </p>
                  <p className="text-xs text-slate-500">{activity.description}</p>
                  <p className="text-xs text-slate-400">{activity.createdAt}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link
              href="/clients"
              className={cn(buttonVariants(), "w-full justify-between")}
            >
              Add a new client intake
              <span aria-hidden>→</span>
            </Link>
            <Link
              href="/trips"
              className={cn(
                buttonVariants({ variant: "secondary" }),
                "w-full justify-between"
              )}
            >
              Start a trip workflow
              <span aria-hidden>→</span>
            </Link>
            <Link
              href="/award-search"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "w-full justify-between"
              )}
            >
              Launch award search workspace
              <span aria-hidden>→</span>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
