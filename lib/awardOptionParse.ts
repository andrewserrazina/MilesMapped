import type { AwardOption } from "@/lib/types";

export type ParsedAwardOption = {
  program?: string;
  route?: string;
  milesRequired?: number;
  feesUSD?: number;
  transferRequired?: boolean;
  transferTime?: AwardOption["transferTime"];
};

const milesKeywordRegex =
  /(\d{1,3}(?:,\d{3})+|\d+)\s*(k)?\s*(miles?|pts?|points?)\b/i;
const milesKRegex = /(\d{2,3})\s*k\b/i;
const feesRegex = /(?:\$|USD\s*)(\d+(?:\.\d+)?)/i;
const routeRegex = /([A-Z]{3})\s*(?:-|–|—|→)\s*([A-Z]{3})/;
const programRegex = /([A-Z][A-Za-z0-9&/ ]+?)\s+-\s+/;

const parseNumber = (value: string) => Number(value.replace(/,/g, ""));

const parseMiles = (text: string) => {
  const keywordMatch = text.match(milesKeywordRegex);
  if (keywordMatch) {
    const rawValue = keywordMatch[1];
    const hasK = Boolean(keywordMatch[2]);
    const numericValue = parseNumber(rawValue);
    if (!Number.isNaN(numericValue)) {
      return hasK ? numericValue * 1000 : numericValue;
    }
  }

  const kMatch = text.match(milesKRegex);
  if (kMatch) {
    const numericValue = parseNumber(kMatch[1]);
    if (!Number.isNaN(numericValue)) {
      return numericValue * 1000;
    }
  }

  return undefined;
};

const parseFees = (text: string) => {
  const feesMatch = text.match(feesRegex);
  if (!feesMatch) {
    return undefined;
  }
  const numericValue = Number(feesMatch[1]);
  return Number.isNaN(numericValue) ? undefined : numericValue;
};

const parseProgram = (text: string) => {
  const match = text.match(programRegex);
  return match ? match[1].trim() : undefined;
};

const parseRoute = (text: string) => {
  const match = text.match(routeRegex);
  if (!match) {
    return undefined;
  }
  return `${match[1]}–${match[2]}`;
};

const parseTransferTime = (text: string): AwardOption["transferTime"] | undefined => {
  if (/instant/i.test(text)) {
    return "Instant";
  }
  if (/1\s*(?:-|–)\s*2\s*days/i.test(text)) {
    return "1–2 days";
  }
  if (/unknown/i.test(text)) {
    return "Unknown";
  }
  return undefined;
};

export const parseAwardOptionText = (input: string): ParsedAwardOption => {
  if (!input.trim()) {
    return {};
  }

  const text = input.replace(/\s+/g, " ").trim();

  return {
    program: parseProgram(text),
    route: parseRoute(text),
    milesRequired: parseMiles(text),
    feesUSD: parseFees(text),
    transferRequired: /\btransfer\b/i.test(text),
    transferTime: parseTransferTime(text),
  };
};
