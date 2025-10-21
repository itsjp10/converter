"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { X } from "lucide-react";

const BannerContext = createContext(null);

const toneClasses = {
    success: "border border-emerald-500/40 bg-emerald-900/90 text-emerald-100",
    error: "border border-red-500/40 bg-red-900/90 text-red-50",
    pending: "border border-amber-400/40 bg-amber-900/90 text-amber-50",
    warning: "border border-amber-400/40 bg-amber-900/90 text-amber-50",
    info: "border border-blue-400/40 bg-blue-900/90 text-blue-50",
};

export function DashboardBannerProvider({ children }) {
    const [banner, setBanner] = useState(null);

    const showBanner = useCallback(({ type = "info", title, message }) => {
        if (!title) return;
        setBanner({
            type,
            title,
            message: message ?? "",
            id: Date.now(),
        });
    }, []);

    const hideBanner = useCallback(() => setBanner(null), []);

    const contextValue = useMemo(
        () => ({
            banner,
            showBanner,
            hideBanner,
        }),
        [banner, showBanner, hideBanner],
    );

    const tone = banner ? toneClasses[banner.type] ?? toneClasses.info : toneClasses.info;

    return (
        <BannerContext.Provider value={contextValue}>
            {banner && (
                <div className="pointer-events-none fixed inset-x-0 top-0 z-[80] flex justify-center">
                    <div
                        role="status"
                        aria-live="polite"
                        className={`pointer-events-auto mt-4 w-[min(90vw,40rem)] rounded-lg px-5 py-4 shadow-2xl ring-1 ring-white/10 backdrop-blur-lg ${tone}`}
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1">
                                <p className="text-sm font-semibold tracking-wide text-white/90">
                                    {banner.title}
                                </p>
                                {banner.message && (
                                    <p className="text-xs text-white/70">{banner.message}</p>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={hideBanner}
                                className="rounded-md border border-white/20 bg-white/5 p-1 text-white/70 transition hover:bg-white/10 focus:outline-none focus-visible:ring focus-visible:ring-white/40"
                                aria-label="Dismiss notification"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {children}
        </BannerContext.Provider>
    );
}

export function useDashboardBanner() {
    const context = useContext(BannerContext);
    if (!context) {
        throw new Error("useDashboardBanner must be used within a DashboardBannerProvider");
    }
    return context;
}
