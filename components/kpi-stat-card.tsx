import { Card, CardContent } from "@/components/ui/card";

export default function KPIStatCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper?: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="mt-3 text-3xl font-semibold text-slate-900">{value}</p>
        {helper ? (
          <p className="mt-2 text-xs text-slate-400">{helper}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
