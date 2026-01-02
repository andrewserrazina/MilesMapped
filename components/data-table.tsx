import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export interface DataColumn<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  sortValue?: (row: T) => string | number;
}

export default function DataTable<T>({
  columns,
  data,
  emptyMessage,
  onRowClick,
  pageSize = 25,
}: {
  columns: DataColumn<T>[];
  data: T[];
  emptyMessage: string;
  onRowClick?: (row: T) => void;
  pageSize?: number;
}) {
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);
  const [page, setPage] = useState(1);
  const hasData = data.length > 0;

  const sortedData = useMemo(() => {
    if (!sortConfig) {
      return data;
    }

    const column = columns.find((item) => item.key === sortConfig.key);
    if (!column?.sortValue) {
      return data;
    }

    const sorted = [...data].sort((left, right) => {
      const leftValue = column.sortValue?.(left);
      const rightValue = column.sortValue?.(right);
      if (typeof leftValue === "string" || typeof rightValue === "string") {
        return String(leftValue ?? "").localeCompare(String(rightValue ?? ""), undefined, {
          numeric: true,
          sensitivity: "base",
        });
      }
      return Number(leftValue ?? 0) - Number(rightValue ?? 0);
    });

    return sortConfig.direction === "asc" ? sorted : sorted.reverse();
  }, [columns, data, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const clampedPage = Math.min(page, totalPages);
  const paginatedData =
    sortedData.length > pageSize
      ? sortedData.slice((clampedPage - 1) * pageSize, clampedPage * pageSize)
      : sortedData;

  useEffect(() => {
    if (page !== clampedPage) {
      setPage(clampedPage);
    }
  }, [clampedPage, page]);

  const handleSort = (column: DataColumn<T>) => {
    if (!column.sortValue) {
      return;
    }
    setPage(1);
    setSortConfig((prev) => {
      if (!prev || prev.key !== column.key) {
        return { key: column.key, direction: "asc" };
      }
      return {
        key: column.key,
        direction: prev.direction === "asc" ? "desc" : "asc",
      };
    });
  };

  if (!hasData) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => {
              const isSortable = Boolean(column.sortValue);
              const isActive = sortConfig?.key === column.key;
              return (
                <TableHead key={column.key}>
                  {isSortable ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "h-auto px-2 py-1 text-left text-sm font-medium text-slate-700",
                        isActive ? "text-slate-900" : "text-slate-600"
                      )}
                      onClick={() => handleSort(column)}
                    >
                      <span>{column.header}</span>
                      <span className="ml-1 text-xs text-slate-400">
                        {isActive ? (sortConfig?.direction === "asc" ? "↑" : "↓") : "↕"}
                      </span>
                    </Button>
                  ) : (
                    column.header
                  )}
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.map((row, index) => (
            <TableRow
              key={index}
              className={onRowClick ? "cursor-pointer" : undefined}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((column) => (
                <TableCell key={column.key}>{column.render(row)}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {sortedData.length > pageSize ? (
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-500">
          <span>
            Showing {(clampedPage - 1) * pageSize + 1}-
            {Math.min(clampedPage * pageSize, sortedData.length)} of{" "}
            {sortedData.length}
          </span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={clampedPage === 1}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={clampedPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
