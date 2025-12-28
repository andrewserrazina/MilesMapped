import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { AwardOption } from "@/lib/types";

export default function AwardOptionCard({
  option,
  isPinned,
  onPin,
  onEdit,
  onRemove,
}: {
  option: AwardOption;
  isPinned: boolean;
  onPin: () => void;
  onEdit?: () => void;
  onRemove: () => void;
}) {
  return (
    <Card
      className={cn(
        "border border-slate-200 p-5",
        isPinned && "border-slate-900 bg-slate-50"
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-lg font-semibold text-slate-900">
              {option.program}
            </h4>
            {isPinned ? <Badge variant="default">Pinned</Badge> : null}
            {option.badges?.map((badge) => (
              <Badge key={badge} variant="secondary">
                {badge}
              </Badge>
            ))}
          </div>
          <p className="text-sm text-slate-500">{option.route}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onPin}>
            {isPinned ? "Pinned" : "Pin Best Option"}
          </Button>
          {onEdit ? (
            <Button variant="ghost" size="sm" onClick={onEdit}>
              Edit
            </Button>
          ) : null}
          <Button variant="ghost" size="sm" onClick={onRemove}>
            Remove
          </Button>
        </div>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">Miles</p>
          <p className="text-sm font-semibold text-slate-900">
            {option.milesRequired.toLocaleString()} mi
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">Fees</p>
          <p className="text-sm font-semibold text-slate-900">
            ${option.feesUSD}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Transfer
          </p>
          <p className="text-sm font-semibold text-slate-900">
            {option.transferRequired ? "Required" : "Not required"}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Transfer Time
          </p>
          <p className="text-sm font-semibold text-slate-900">
            {option.transferTime}
          </p>
        </div>
      </div>
    </Card>
  );
}
