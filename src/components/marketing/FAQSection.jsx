"use client";
import React, { useState, useMemo } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// 🔹 Utilidad para convertir ReactNode en texto plano (para búsqueda + SEO)
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

export default function FAQSection({
  items,
  className = "",
  title = "Preguntas frecuentes",
  subtitle = "Busca o expande todo para encontrar lo que necesitas."
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState([]);

  const filtered = useMemo(() => {
    return items.filter((it) =>
      (it.question + " " + nodeToText(it.answer)).toLowerCase().includes(query.toLowerCase())
    );
  }, [items, query]);

  const ids = useMemo(
    () => filtered.map((it, i) => it.id ?? `faq-${i}`),
    [filtered]
  );

  const expandAll = () => setOpen(ids);
  const collapseAll = () => setOpen([]);

  // JSON-LD para SEO (usar items completos, no filtrados)
  const jsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: items.map((it) => ({
        "@type": "Question",
        name: it.question,
        acceptedAnswer: { "@type": "Answer", text: nodeToText(it.answer) }
      }))
    }),
    [items]
  );

  return (
    <section id="faq" className={`mx-auto max-w-4xl ${className}`}>
      <h3 className="mb-2 text-center text-2xl font-semibold md:text-3xl">{title}</h3>
      <p className="mb-6 text-center text-sm text-zinc-400">{subtitle}</p>

      <div className="mb-4 flex items-center justify-center gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar en las preguntas…"
          className="max-w-md bg-white/5"
        />
        <Button variant="outline" className="border-white/20" onClick={expandAll}>
          Expandir todo
        </Button>
        <Button variant="ghost" onClick={collapseAll}>
          Contraer
        </Button>
      </div>

      <Accordion type="multiple" value={open} onValueChange={setOpen} className="w-full">
        {filtered.map((it, i) => {
          const id = it.id ?? `faq-${i}`;
          return (
            <AccordionItem key={id} value={id} id={id}>
              <AccordionTrigger className="text-left">{it.question}</AccordionTrigger>
              <AccordionContent className="text-zinc-300">{it.answer}</AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </section>
  );
}
