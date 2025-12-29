"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AwardOption } from "@/lib/types";

const transferTimes: AwardOption["transferTime"][] = [
  "Instant",
  "1–2 days",
  "Unknown",
];

type AwardOptionFormValues = {
  program: string;
  route: string;
  milesRequired: string;
  feesUSD: string;
  transferRequired: boolean;
  transferTime: AwardOption["transferTime"];
  badges: string;
};

export type AwardOptionFormOutput = {
  program: string;
  route: string;
  milesRequired: number;
  feesUSD: number;
  transferRequired: boolean;
  transferTime: AwardOption["transferTime"];
  badges: string[];
};

const emptyValues: AwardOptionFormValues = {
  program: "",
  route: "",
  milesRequired: "",
  feesUSD: "",
  transferRequired: true,
  transferTime: "Instant",
  badges: "",
};

export default function AwardOptionModal({
  open,
  mode,
  initialValues,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  mode: "add" | "edit";
  initialValues?: AwardOption;
  onOpenChange: (open: boolean) => void;
  onSave: (values: AwardOptionFormOutput) => void;
}) {
  const [values, setValues] = useState<AwardOptionFormValues>(emptyValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) {
      setValues(emptyValues);
      setErrors({});
      return;
    }
    if (initialValues) {
      setValues({
        program: initialValues.program,
        route: initialValues.route,
        milesRequired: String(initialValues.milesRequired),
        feesUSD: String(initialValues.feesUSD),
        transferRequired: initialValues.transferRequired,
        transferTime: initialValues.transferTime,
        badges: initialValues.badges?.join(", ") ?? "",
      });
    } else {
      setValues(emptyValues);
    }
    setErrors({});
  }, [open, initialValues]);

  const handleSubmit = () => {
    const nextErrors: Record<string, string> = {};
    if (!values.program.trim()) {
      nextErrors.program = "Program is required.";
    }
    if (!values.route.trim()) {
      nextErrors.route = "Route is required.";
    }
    const milesValue = Number(values.milesRequired);
    if (!values.milesRequired || !Number.isInteger(milesValue) || milesValue <= 0) {
      nextErrors.milesRequired = "Miles must be a positive integer.";
    }
    const feesValue = Number(values.feesUSD);
    if (Number.isNaN(feesValue) || feesValue < 0) {
      nextErrors.feesUSD = "Fees must be 0 or more.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    onSave({
      program: values.program.trim(),
      route: values.route.trim(),
      milesRequired: milesValue,
      feesUSD: feesValue,
      transferRequired: values.transferRequired,
      transferTime: values.transferTime,
      badges: values.badges
        .split(",")
        .map((badge) => badge.trim())
        .filter(Boolean),
    });
  };

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-10 w-full max-w-[640px] rounded-lg border border-slate-200 bg-white p-6 shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold text-slate-900">
            {mode === "add" ? "Add Award Option" : "Edit Award Option"}
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
              Transfer Required
            </label>
            <select
              className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
              value={values.transferRequired ? "true" : "false"}
              onChange={(event) =>
                setValues((prev) => ({
                  ...prev,
                  transferRequired: event.target.value === "true",
                }))
              }
            >
              <option value="true">Required</option>
              <option value="false">Not required</option>
            </select>
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
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {mode === "add" ? "Add Option" : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
