"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
}

export default function Tabs({
  tabs,
  defaultTab,
}: {
  tabs: TabItem[];
  defaultTab?: string;
}) {
  const initialTab = defaultTab ?? tabs[0]?.id;
  const [activeTab, setActiveTab] = useState(initialTab);

  return (
    <div>
      <div className="flex flex-wrap gap-2 border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "border-b-2 px-4 py-2 text-sm font-medium",
              activeTab === tab.id
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-700"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-6">
        {tabs.map((tab) =>
          tab.id === activeTab ? (
            <div key={tab.id}>{tab.content}</div>
          ) : null
        )}
      </div>
    </div>
  );
}
