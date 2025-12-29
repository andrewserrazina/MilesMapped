"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { AwardOption } from "@/lib/types";

export default function AwardOptionCard({
  option,
  isPinned,
  isReadOnly,
  onPin,
  onEdit,
  onRemove,
}: {
  option: AwardOption;
  isPinned: boolean;
  isReadOnly: boolean;
  onPin: () => void;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const centsPerPoint =
    option.cashEquivalentUSD === undefined || option.milesRequired <= 0
      ? null
      : ((option.cashEquivalentUSD - option.feesUSD) / option.milesRequired) * 100;

  const cppBadge =
    centsPerPoint === null
      ? null
      : centsPerPoint >= 2
        ? "Excellent"
        : centsPerPoint >= 1.5
          ? "Good"
          : centsPerPoint >= 1
            ? "Fair"
            : "Low";

  const systemBadges = [
    cppBadge,
    option.transferTime === "Instant" ? "Fast Transfer" : null,
    option.feesUSD >= 400 ? "High Fees" : null,
  ].filter((badge): badge is string => Boolean(badge));

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
            {systemBadges.map((badge) => (
              <Badge key={badge} variant="outline">
                {badge}
              </Badge>
            ))}
          </div>
          <p className="text-sm text-slate-500">{option.route}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onPin}
            disabled={isReadOnly || isPinned}
          >
            {isPinned ? "Pinned" : "Pin Best Option"}
          </Button>
          <Button variant="ghost" size="sm" onClick={onEdit} disabled={isReadOnly}>
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            disabled={isReadOnly}
          >
            Remove
          </Button>
        </div>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-5">
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
            Value
          </p>
          <p className="text-sm font-semibold text-slate-900">
            {centsPerPoint === null ? "—" : `${centsPerPoint.toFixed(2)} cpp`}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">Transfer</p>
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
