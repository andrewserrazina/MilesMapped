import type { AwardOption } from "@/lib/types";

export const transferTimes: AwardOption["transferTime"][] = [
  "Instant",
  "1–2 days",
  "Unknown",
];

export type AwardOptionFormValues = {
  program: string;
  route: string;
  milesRequired: string;
  feesUSD: string;
  cashEquivalentUSD: string;
  transferRequired: boolean;
  transferTime: AwardOption["transferTime"];
  badges: string;
};

export type AwardOptionFormOutput = {
  program: string;
  route: string;
  milesRequired: number;
  feesUSD: number;
  cashEquivalentUSD?: number;
  transferRequired: boolean;
  transferTime: AwardOption["transferTime"];
  badges: string[];
};

export const emptyAwardOptionFormValues: AwardOptionFormValues = {
  program: "",
  route: "",
  milesRequired: "",
  feesUSD: "",
  cashEquivalentUSD: "",
  transferRequired: true,
  transferTime: "Instant",
  badges: "",
};

export function validateAwardOptionForm(values: AwardOptionFormValues) {
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
  const cashEquivalentValue = values.cashEquivalentUSD.trim()
    ? Number(values.cashEquivalentUSD)
    : undefined;
  if (
    cashEquivalentValue !== undefined &&
    (Number.isNaN(cashEquivalentValue) || cashEquivalentValue < 0)
  ) {
    nextErrors.cashEquivalentUSD = "Cash equivalent must be 0 or more.";
  }

  if (Object.keys(nextErrors).length > 0) {
    return { errors: nextErrors };
  }

  return {
    errors: nextErrors,
    output: {
      program: values.program.trim(),
      route: values.route.trim(),
      milesRequired: milesValue,
      feesUSD: feesValue,
      cashEquivalentUSD: cashEquivalentValue,
      transferRequired: values.transferRequired,
      transferTime: values.transferTime,
      badges: values.badges
        .split(",")
        .map((badge) => badge.trim())
        .filter(Boolean),
    } satisfies AwardOptionFormOutput,
  };
}
