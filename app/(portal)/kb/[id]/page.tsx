"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import PageHeader from "@/components/page-header";
import { portalRepo } from "@/lib/portalRepo";

type MarkdownBlock =
  | { type: "heading"; level: number; content: string }
  | { type: "paragraph"; content: string }
  | { type: "list"; items: string[] };

function renderInline(text: string) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={index}
          className="rounded bg-slate-100 px-1 py-0.5 text-xs text-slate-700"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return <span key={index}>{part}</span>;
  });
}

function parseMarkdown(content: string): MarkdownBlock[] {
  const lines = content.split(/\r?\n/);
  const blocks: MarkdownBlock[] = [];
  let listItems: string[] = [];

  const flushList = () => {
    if (listItems.length) {
      blocks.push({ type: "list", items: listItems });
      listItems = [];
    }
  };

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      return;
    }

    if (/^#{1,3}\s+/.test(trimmed)) {
      flushList();
      const match = trimmed.match(/^(#{1,3})\s+(.*)$/);
      if (match) {
        blocks.push({
          type: "heading",
          level: match[1].length,
          content: match[2],
        });
        return;
      }
    }

    if (trimmed.startsWith("- ")) {
      listItems.push(trimmed.slice(2));
      return;
    }

    flushList();
    blocks.push({ type: "paragraph", content: trimmed });
  });

  flushList();
  return blocks;
}

export default function KnowledgeArticlePage() {
  const params = useParams<{ id: string }>();
  const { data: portalData, isHydrated } = portalRepo.usePortalData();
  const article = portalRepo.getKnowledgeArticle(portalData, params.id);
  const blocks = useMemo(
    () => (article ? parseMarkdown(article.content) : []),
    [article]
  );

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

  if (!article) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Knowledge Base"
          description="Curated playbooks, program rules, and transfer tips."
        />
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
          Article not found.{" "}
          <Link href="/kb" className="font-semibold text-slate-900">
            Back to Knowledge Base
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={article.title}
        description={`${article.category} • ${article.createdAt}`}
      />
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="space-y-4 text-sm text-slate-700">
          {blocks.map((block, index) => {
            if (block.type === "heading") {
              const HeadingTag = block.level === 1 ? "h2" : "h3";
              return (
                <HeadingTag
                  key={index}
                  className="text-base font-semibold text-slate-900"
                >
                  {renderInline(block.content)}
                </HeadingTag>
              );
            }
            if (block.type === "list") {
              return (
                <ul key={index} className="list-disc space-y-1 pl-5">
                  {block.items.map((item, itemIndex) => (
                    <li key={itemIndex}>{renderInline(item)}</li>
                  ))}
                </ul>
              );
            }
            return (
              <p key={index} className="leading-relaxed">
                {renderInline(block.content)}
              </p>
            );
          })}
        </div>
        <div className="mt-8">
          <Link href="/kb" className="text-sm font-semibold text-slate-900">
            ← Back to Knowledge Base
          </Link>
        </div>
      </div>
    </div>
  );
}
