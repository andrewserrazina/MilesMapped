import { Card } from "@/components/ui/card";
import type { HotelOption } from "@/lib/types";

export default function HotelOptionCard({ option }: { option: HotelOption }) {
  return (
    <Card className="border border-slate-200 p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h4 className="text-lg font-semibold text-slate-900">{option.name}</h4>
          {option.notes ? (
            <p className="mt-1 text-sm text-slate-500">{option.notes}</p>
          ) : null}
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-slate-900">
            {option.pointsPerNight.toLocaleString()} pts/night
          </p>
          <p className="text-xs text-slate-500">Cash alt ${option.cashAltUSD}</p>
        </div>
      </div>
    </Card>
  );
}
