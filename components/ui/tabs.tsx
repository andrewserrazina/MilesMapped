"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type TabsContextValue = {
  value: string;
  setValue: (value: string) => void;
};

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error("Tabs components must be used within Tabs");
  }
  return context;
}

const Tabs = ({
  value,
  defaultValue,
  onValueChange,
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue ?? "");
  const currentValue = value ?? internalValue;

  const setValue = (nextValue: string) => {
    if (value === undefined) {
      setInternalValue(nextValue);
    }
    onValueChange?.(nextValue);
  };

  return (
    <TabsContext.Provider value={{ value: currentValue, setValue }}>
      <div className={className} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

const TabsList = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-md border border-slate-200 bg-white p-1 text-slate-500",
      className
    )}
    {...props}
  />
);

const TabsTrigger = ({
  className,
  value,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }) => {
  const { value: currentValue, setValue } = useTabsContext();
  const isActive = currentValue === value;
  return (
    <button
      type="button"
      data-state={isActive ? "active" : "inactive"}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 data-[state=active]:bg-slate-900 data-[state=active]:text-white",
        className
      )}
      onClick={() => setValue(value)}
      {...props}
    />
  );
};

const TabsContent = ({
  className,
  value,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { value: string }) => {
  const { value: currentValue } = useTabsContext();
  if (currentValue !== value) {
    return null;
  }
  return (
    <div className={cn("mt-6 focus-visible:outline-none", className)} {...props} />
  );
};

export { Tabs, TabsList, TabsTrigger, TabsContent };
