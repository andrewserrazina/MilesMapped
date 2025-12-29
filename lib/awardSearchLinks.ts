"use client";

import type { AwardSearchIntegrationConfig, Trip } from "@/lib/types";

type TemplateValue = string | number | undefined;

const cabinCodeMap: Record<Trip["cabinPref"], string> = {
  Economy: "economy",
  Premium: "premium",
  Business: "business",
  First: "first",
};

export function substituteTemplate(
  template: string,
  vars: Record<string, TemplateValue>
) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = vars[key];
    if (value === undefined || value === null) {
      return "";
    }
    if (typeof value === "number") {
      return String(value);
    }
    return encodeURIComponent(value);
  });
}

export function buildAwardSearchUrl(
  providerConfig: AwardSearchIntegrationConfig,
  trip: Trip
) {
  const template = providerConfig.urlTemplate?.trim();
  if (!template) {
    return providerConfig.baseUrl;
  }

  const variables: Record<string, TemplateValue> = {
    origin: trip.origin,
    destination: trip.destination,
    dateStart: trip.dateStart,
    dateEnd: trip.dateEnd,
    flexibilityDays: trip.flexibilityDays,
    passengers: trip.passengers,
    cabinPref: trip.cabinPref,
    cabinCode: cabinCodeMap[trip.cabinPref],
  };

  return substituteTemplate(template, variables);
}
