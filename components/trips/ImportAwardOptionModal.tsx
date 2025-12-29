"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { parseAwardOptionText } from "@/lib/awardOptionParse";
import {
  emptyAwardOptionFormValues,
  transferTimes,
  validateAwardOptionForm,
  type AwardOptionFormOutput,
  type AwardOptionFormValues,
} from "@/components/trips/awardOptionForm";
import type { AwardOption } from "@/lib/types";

const emptyImportValues: AwardOptionFormValues = {
  ...emptyAwardOptionFormValues,
  transferRequired: false,
};

export default function ImportAwardOptionModal({
  open,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (values: AwardOptionFormOutput) => void;
}) {
  const [values, setValues] = useState<AwardOptionFormValues>(emptyImportValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pasteText, setPasteText] = useState("");
  const [hasParsed, setHasParsed] = useState(false);

  useEffect(() => {
    if (!open) {
      setValues(emptyImportValues);
      setErrors({});
      setPasteText("");
      setHasParsed(false);
      return;
    }
    setValues(emptyImportValues);
    setErrors({});
    setPasteText("");
    setHasParsed(false);
  }, [open]);

  const handleSubmit = () => {
    const { errors: nextErrors, output } = validateAwardOptionForm(values);
    setErrors(nextErrors);

    if (!output) {
      return;
    }

    onSave(output);
    onOpenChange(false);
  };

  const handleParse = () => {
    const parsed = parseAwardOptionText(pasteText);
    setValues((prev) => ({
      ...prev,
      program: parsed.program ?? prev.program,
      route: parsed.route ?? prev.route,
      milesRequired:
        parsed.milesRequired !== undefined
          ? String(parsed.milesRequired)
          : prev.milesRequired,
      feesUSD:
        parsed.feesUSD !== undefined
          ? String(parsed.feesUSD)
          : prev.feesUSD,
      transferRequired:
        parsed.transferRequired !== undefined
          ? parsed.transferRequired
          : prev.transferRequired,
      transferTime:
        parsed.transferTime !== undefined ? parsed.transferTime : prev.transferTime,
    }));
    setErrors({});
    setHasParsed(true);
  };

  const renderFormFields = () => (
    <div className="mt-4 grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Program
        </label>
        <Input
          value={values.program}
          onChange={(event) =>
            setValues((prev) => ({ ...prev, program: event.target.value }))
          }
        />
        {errors.program ? (
          <p className="text-xs text-red-500">{errors.program}</p>
        ) : null}
      </div>
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Route
        </label>
        <Input
          placeholder="JFK–CDG"
          value={values.route}
          onChange={(event) =>
            setValues((prev) => ({ ...prev, route: event.target.value }))
          }
        />
        {errors.route ? (
          <p className="text-xs text-red-500">{errors.route}</p>
        ) : null}
      </div>
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Miles Required
        </label>
        <Input
          type="number"
          value={values.milesRequired}
          onChange={(event) =>
            setValues((prev) => ({ ...prev, milesRequired: event.target.value }))
          }
        />
        {errors.milesRequired ? (
          <p className="text-xs text-red-500">{errors.milesRequired}</p>
        ) : null}
      </div>
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Fees (USD)
        </label>
        <Input
          type="number"
          value={values.feesUSD}
          onChange={(event) =>
            setValues((prev) => ({ ...prev, feesUSD: event.target.value }))
          }
        />
        {errors.feesUSD ? (
          <p className="text-xs text-red-500">{errors.feesUSD}</p>
        ) : null}
      </div>
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Cash Equivalent (USD)
        </label>
        <Input
          type="number"
          value={values.cashEquivalentUSD}
          onChange={(event) =>
            setValues((prev) => ({
              ...prev,
              cashEquivalentUSD: event.target.value,
            }))
          }
        />
        {errors.cashEquivalentUSD ? (
          <p className="text-xs text-red-500">{errors.cashEquivalentUSD}</p>
        ) : null}
      </div>
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Transfer Required
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <Checkbox
            checked={values.transferRequired}
            onChange={(event) =>
              setValues((prev) => ({
                ...prev,
                transferRequired: event.target.checked,
              }))
            }
          />
          <span>Transfer required</span>
        </label>
      </div>
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Transfer Time
        </label>
        <select
          className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
          value={values.transferTime}
          onChange={(event) =>
            setValues((prev) => ({
              ...prev,
              transferTime: event.target.value as AwardOption["transferTime"],
            }))
          }
        >
          {transferTimes.map((time) => (
            <option key={time} value={time}>
              {time}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2 md:col-span-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Badges
        </label>
        <Input
          placeholder="Comma-separated"
          value={values.badges}
          onChange={(event) =>
            setValues((prev) => ({ ...prev, badges: event.target.value }))
          }
        />
      </div>
    </div>
  );

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-10 w-full max-w-[720px] rounded-lg border border-slate-200 bg-white p-6 shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Import Award Option
          </h2>
          <button
            type="button"
            className="rounded-sm text-slate-400 hover:text-slate-600"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </div>

        <Tabs defaultValue="quick">
          <TabsList className="mt-4">
            <TabsTrigger value="quick">Quick Form</TabsTrigger>
            <TabsTrigger value="paste">Paste Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="quick">
            {renderFormFields()}
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>Import Award Option</Button>
            </div>
          </TabsContent>

          <TabsContent value="paste">
            <div className="mt-4 space-y-3">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Paste result text
              </label>
              <textarea
                className="min-h-[160px] w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                placeholder="Paste anything from point.me or Roame..."
                value={pasteText}
                onChange={(event) => setPasteText(event.target.value)}
              />
              <p className="text-xs text-slate-500">
                Paste anything from point.me/Roame; we’ll try to extract
                miles/fees. You can edit before saving.
              </p>
              <div>
                <Button variant="outline" onClick={handleParse}>
                  Parse
                </Button>
              </div>
            </div>
            {hasParsed ? (
              <>
                {renderFormFields()}
                <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <Button variant="ghost" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit}>Save Import</Button>
                </div>
              </>
            ) : null}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
