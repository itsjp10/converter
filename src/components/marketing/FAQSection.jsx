"use client";
import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronDown, HelpCircle } from "lucide-react";

/** Convert ReactNode => plain text (for search + JSON-LD) */
function nodeToText(node) {
  try {
    if (typeof node === "string") return node;
    if (Array.isArray(node)) return node.map(nodeToText).join(" ");
    if (React.isValidElement(node)) return nodeToText(node.props?.children);
    return "";
  } catch {
    return "";
  }
}

/**
 * items: Array<{
 *   id?: string
 *   category?: string     // e.g. "General", "Pricing", "Dashboard", "API"
 *   icon?: React.ComponentType<any> // e.g. CreditCard, Settings, Bot...
 *   question: string
 *   answer: React.ReactNode
 * }>
 */
export default function FAQSection({
  items,
  className = "",
  title = "Frequently asked questions",
  subtitle = "These are the most commonly asked questions. Can’t find what you need? Chat with our friendly team.",
  showSearch = true,
  showCategoryPills = true,
}) {
  const [query, setQuery] = useState("");
  const [selectedCat, setSelectedCat] = useState("All");
  const [open, setOpen] = useState([]); // multiple
  const categories = useMemo(() => {
    const cats = Array.from(new Set(items.map((i) => i.category).filter(Boolean)));
    return ["All", ...cats];
  }, [items]);

  const filtered = useMemo(() => {
    const base = selectedCat === "All" ? items : items.filter((i) => i.category === selectedCat);
    if (!query.trim()) return base;
    const q = query.toLowerCase();
    return base.filter((it) =>
      (it.question + " " + nodeToText(it.answer)).toLowerCase().includes(q)
    );
  }, [items, selectedCat, query]);

  const ids = useMemo(
    () => filtered.map((it, i) => it.id ?? `faq-${i}`),
    [filtered]
  );

  const expandAll = () => setOpen(ids);
  const collapseAll = () => setOpen([]);

  // JSON-LD uses full items (not filtered)
  const jsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: items.map((it) => ({
        "@type": "Question",
        name: it.question,
        acceptedAnswer: { "@type": "Answer", text: nodeToText(it.answer) },
      })),
    }),
    [items]
  );

  return (
    <section id="faq" className={`mx-auto max-w-3xl ${className}`}>
      {/* Heading */}
      <div className="mb-6 text-center">
        <h3 className="text-2xl font-semibold tracking-tight md:text-3xl">{title}</h3>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-zinc-400">{subtitle}</p>
      </div>

      {/* Category pills */}
      {showCategoryPills && categories.length > 1 && (
        <div className="mb-5 flex flex-wrap items-center justify-center gap-2">
          {categories.map((c) => {
            const active = c === selectedCat;
            return (
              <button
                key={c}
                onClick={() => setSelectedCat(c)}
                className={[
                  "rounded-full border px-3 py-1 text-sm transition",
                  active
                    ? "border-white/20 bg-white/10 text-white"
                    : "border-white/10 bg-transparent text-zinc-300 hover:bg-white/5",
                ].join(" ")}
              >
                {c}
              </button>
            );
          })}
        </div>
      )}

      {/* Toolbar: search + expand/collapse */}
      <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
        {showSearch && (
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search questions…"
            className="max-w-sm bg-white/5"
          />
        )}
        <Button variant="outline" className="border-white/20" onClick={expandAll}>
          Expand all
        </Button>
        <Button variant="ghost" onClick={collapseAll}>
          Collapse
        </Button>
      </div>

      {/* List */}
      <Accordion type="multiple" value={open} onValueChange={setOpen} className="w-full">
        {filtered.map((it, i) => {
          const id = it.id ?? `faq-${i}`;
          const Icon = it.icon ?? HelpCircle;

          const isOpen = open.includes(id);

          return (
            <AccordionItem
              key={id}
              value={id}
              id={id}
              className="group rounded-xl border border-white/10 bg-white/[0.03] transition hover:bg-white/[0.05]"
            >
              {/* Trigger row */}
              <AccordionTrigger className="px-3 py-3 text-left sm:px-4">
                <div className="flex w-full items-center gap-3 sm:gap-4">
                  <div className="grid size-9 place-items-center rounded-lg bg-white/10 text-zinc-100">
                    <Icon className="size-5" />
                  </div>

                  <div className="flex-1">
                    <span className="text-sm font-medium text-zinc-100 sm:text-base">
                      {it.question}
                    </span>
                  </div>

                  {/* Animated chevron */}
                  <motion.span
                    aria-hidden
                    initial={false}
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="shrink-0 text-zinc-400 group-hover:text-zinc-200"
                  >
                    <ChevronDown className="size-4" />
                  </motion.span>
                </div>
              </AccordionTrigger>

              {/* Animated content */}
              <AccordionContent asChild>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.28, ease: "easeInOut" }}
                      className="px-3 pb-4 pt-0 sm:px-4"
                    >
                      <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3 text-sm text-zinc-300 sm:p-4">
                        {it.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      {/* SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </section>
  );
}
