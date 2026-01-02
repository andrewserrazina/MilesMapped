"use client";

import PageHeader from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const checks = [
  {
    label: "Portal data service",
    status: "Operational",
    detail: "Mock data store loaded and ready.",
  },
  {
    label: "Award search integrations",
    status: "Operational",
    detail: "Point.me and Roame links configured.",
  },
  {
    label: "Client communications",
    status: "Operational",
    detail: "Email templates and sending queue ready.",
  },
];

export default function HealthCheckPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Health Check"
        description="Quick system status review before starting a client trip."
      />
      <div className="grid gap-4 md:grid-cols-2">
        {checks.map((check) => (
          <Card key={check.label}>
            <CardHeader>
              <CardTitle className="text-base text-slate-900">{check.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-semibold text-emerald-600">
                {check.status}
              </p>
              <p className="mt-2 text-sm text-slate-500">{check.detail}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
