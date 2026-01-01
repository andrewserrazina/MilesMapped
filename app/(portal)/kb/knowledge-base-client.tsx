"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import PageHeader from "@/components/page-header";
import { Input } from "@/components/ui/input";
import { portalRepo } from "@/lib/portalRepo";
import type { KnowledgeArticleCategory } from "@/lib/types";

export default function KnowledgeBaseClient() {
  const searchParams = useSearchParams();
  const { data: portalData, isHydrated } = portalRepo.usePortalData();
  const articles = portalRepo.listKnowledgeArticles(portalData);
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("query") ?? ""
  );
  const [activeCategory, setActiveCategory] = useState<
    KnowledgeArticleCategory | "All"
  >("All");

  useEffect(() => {
    setSearchQuery(searchParams.get("query") ?? "");
  }, [searchParams]);

  const categories: Array<KnowledgeArticleCategory | "All"> = [
    "All",
    "Sweet Spots",
    "Transfer Partners",
    "Airline Quirks",
    "SOPs",
  ];

  const filteredArticles = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    return articles.filter((article) => {
      const matchesCategory =
        activeCategory === "All" || article.category === activeCategory;
      if (!matchesCategory) {
        return false;
      }
      if (!normalizedQuery) {
        return true;
      }
      const titleMatch = article.title.toLowerCase().includes(normalizedQuery);
      const tagMatch = article.tags.some((tag) =>
        tag.toLowerCase().includes(normalizedQuery)
      );
      return titleMatch || tagMatch;
    });
  }, [activeCategory, articles, searchQuery]);

  if (!isHydrated) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Knowledge Base"
          description="Curated playbooks, program rules, and transfer tips."
        />
        <div className="h-40 animate-pulse rounded-xl border border-slate-200 bg-white" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Knowledge Base"
        description="Curated playbooks, program rules, and transfer tips."
      />
      <div className="flex flex-col gap-6 lg:flex-row">
        <aside className="w-full space-y-3 rounded-xl border border-slate-200 bg-white p-4 lg:w-64">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Categories
          </p>
          <div className="space-y-1">
            {categories.map((category) => {
              const count =
                category === "All"
                  ? articles.length
                  : articles.filter((article) => article.category === category)
                      .length;
              const isActive = activeCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm ${
                    isActive
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <span>{category}</span>
                  <span
                    className={`text-xs ${
                      isActive ? "text-slate-200" : "text-slate-400"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="flex-1 space-y-4">
          <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Search
              </p>
              <Input
                placeholder="Search by title or tag"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="mt-2"
              />
            </div>
            <p className="text-xs text-slate-400">
              {filteredArticles.length} article
              {filteredArticles.length === 1 ? "" : "s"} found
            </p>
          </div>

          <div className="space-y-3">
            {filteredArticles.length ? (
              filteredArticles.map((article) => (
                <Link
                  key={article.id}
                  href={`/kb/${article.id}`}
                  className="block rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-300"
                >
                  <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-slate-400">
                    <span>{article.category}</span>
                    <span>•</span>
                    <span>{article.createdAt}</span>
                  </div>
                  <h3 className="mt-2 text-base font-semibold text-slate-900">
                    {article.title}
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {article.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </Link>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
                No articles match your search. Try clearing filters or searching
                a different keyword.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
