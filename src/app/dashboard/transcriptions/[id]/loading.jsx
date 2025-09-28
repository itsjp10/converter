'use client';

import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="flex w-full justify-center px-4 py-8 animate-pulse">
      <div className="w-full max-w-6xl flex flex-col gap-6">
        {/* Back button skeleton */}
        <div className="h-8 w-24 rounded-md bg-white/10" />

        {/* Grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] gap-6 items-start">
          
          {/* Col 1: subscribe skeleton (solo md+) */}
          <div className="hidden lg:block">
            <Card className="w-56 border border-white/10 bg-white/5 backdrop-blur">
              <CardHeader>
                <div className="h-4 w-24 rounded bg-white/10" />
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="h-4 w-20 rounded bg-white/10" />
                <div className="h-8 w-full rounded bg-white/10" />
              </CardContent>
            </Card>
          </div>

          {/* Col 2: main skeleton */}
          <Card className="border-white/10 bg-white/5 backdrop-blur">
            <CardHeader className="gap-0.5">
              <div className="h-4 w-48 rounded bg-white/10 mb-2" />
              <div className="h-6 w-64 rounded bg-white/10" />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="h-4 w-full rounded bg-white/10" />
              <div className="h-4 w-5/6 rounded bg-white/10" />
              <div className="h-4 w-3/4 rounded bg-white/10" />
              <div className="h-4 w-2/3 rounded bg-white/10" />
            </CardContent>
          </Card>

          {/* Col 3: actions/export skeleton */}
          <div className="w-full md:w-56 flex flex-col gap-6">
            <Card className="border-white/10 bg-white/5 backdrop-blur">
              <CardHeader>
                <div className="h-4 w-20 rounded bg-white/10" />
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="h-8 w-full rounded bg-white/10" />
                <div className="h-8 w-full rounded bg-white/10" />
              </CardContent>
            </Card>
            <Card className="border-white/10 bg-white/5 backdrop-blur">
              <CardHeader>
                <div className="h-4 w-20 rounded bg-white/10" />
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="h-8 w-full rounded bg-white/10" />
                <div className="h-8 w-full rounded bg-white/10" />
                <div className="h-8 w-full rounded bg-white/10" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
