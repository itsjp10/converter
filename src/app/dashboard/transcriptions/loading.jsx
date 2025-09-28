'use client';

import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="flex w-full justify-center px-4 py-8">
      <Card className="w-full max-w-4xl border-white/10 bg-white/5 backdrop-blur animate-pulse">
        <CardHeader className="space-y-4">
          {/* Título fake */}
          <div className="h-5 w-32 rounded-md bg-white/10" />

          {/* Search bar fake */}
          <div className="h-9 w-full rounded-md bg-white/10" />
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Encabezado fake */}
          <div className="grid grid-cols-[40px_2fr_1fr_1fr] gap-4">
            <div className="h-4 w-4 rounded bg-white/10" />
            <div className="h-4 w-24 rounded bg-white/10" />
            <div className="h-4 w-20 rounded bg-white/10" />
            <div className="h-4 w-16 rounded bg-white/10" />
          </div>

          {/* Filas fake */}
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-[40px_2fr_1fr_1fr] gap-4 items-center"
            >
              <div className="h-4 w-4 rounded bg-white/10" />
              <div className="h-4 w-32 rounded bg-white/10" />
              <div className="h-4 w-20 rounded bg-white/10" />
              <div className="h-4 w-16 rounded bg-white/10" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
