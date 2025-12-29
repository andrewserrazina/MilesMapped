import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function EmptyState({
  title,
  description,
  primaryActionLabel,
  onPrimaryAction,
  secondaryActionLabel,
  onSecondaryAction,
}: {
  title: string;
  description: string;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}) {
  const hasPrimaryAction = primaryActionLabel && onPrimaryAction;
  const hasSecondaryAction = secondaryActionLabel && onSecondaryAction;

  return (
    <Card className="border border-dashed border-slate-300 p-8 text-center">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
      {hasPrimaryAction || hasSecondaryAction ? (
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {hasSecondaryAction ? (
            <Button variant="outline" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </Button>
          ) : null}
          {hasPrimaryAction ? (
            <Button onClick={onPrimaryAction}>{primaryActionLabel}</Button>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
}
