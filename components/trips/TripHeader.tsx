"use client";

import Link from "next/link";
import StatusBadge from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import type { TripStatus } from "@/lib/types";

export default function TripHeader({
  title,
  status,
  statusOptions,
  assignedAgentName,
  agentOptions,
  onStatusChange,
  onAssignedAgentChange,
  onGenerateItinerary,
  generateDisabled,
  generateHelperText,
  statusOptionDisabled,
  statusHelperText,
  isReadOnly,
}: {
  title: string;
  status: TripStatus;
  statusOptions: TripStatus[];
  assignedAgentName: string;
  agentOptions: string[];
  onStatusChange: (status: TripStatus) => void;
  onAssignedAgentChange: (agentName: string) => void;
  onGenerateItinerary: () => void;
  generateDisabled: boolean;
  generateHelperText?: string;
  statusOptionDisabled?: (status: TripStatus) => boolean;
  statusHelperText?: string;
  isReadOnly: boolean;
}) {
  return (
    <div className="space-y-4">
      <Link href="/trips" className="text-sm text-slate-500 hover:text-slate-700">
        ← Back to Trips
      </Link>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
            <StatusBadge status={status} />
          </div>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Change Status
            </label>
            <select
              className="h-9 min-w-[160px] rounded-md border border-slate-200 bg-white px-3 text-sm"
              value={status}
              onChange={(event) => onStatusChange(event.target.value as TripStatus)}
              disabled={isReadOnly}
            >
              {statusOptions.map((item) => (
                <option
                  key={item}
                  value={item}
                  disabled={statusOptionDisabled?.(item)}
                >
                  {item}
                </option>
              ))}
            </select>
            {statusHelperText ? (
              <span className="text-xs text-slate-400">{statusHelperText}</span>
            ) : null}
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Assigned Agent
            </label>
            <Select
              className="h-9 min-w-[160px] py-0"
              value={assignedAgentName}
              onChange={(event) => onAssignedAgentChange(event.target.value)}
              disabled={isReadOnly}
            >
              {agentOptions.map((agent) => (
                <option key={agent} value={agent}>
                  {agent}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex flex-col items-start gap-1">
            <Button
              onClick={onGenerateItinerary}
              disabled={generateDisabled || isReadOnly}
            >
              Generate Itinerary
            </Button>
            {generateDisabled && generateHelperText ? (
              <span className="text-xs text-slate-400">{generateHelperText}</span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
