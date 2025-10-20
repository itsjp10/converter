/* global WidgetCheckout */
"use client";

import { useState } from "react";
import { Wallet, Sparkles } from "lucide-react";

import { MINUTE_PACKAGES } from "@/config/balance-packages";
import { useWompiCheckout } from "@/hooks/use-wompi-checkout";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

const WOMPI_PUBLIC_KEY = (process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY ?? "").trim();
const CONFIRMATION_PATH = process.env.NEXT_PUBLIC_WOMPI_REDIRECT_URL;

function formatCurrency(amountInCents) {
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0,
    }).format(amountInCents / 100);
}

function buildReference(pkgId) {
    return `minutes_${pkgId}_${Date.now()}`;
}

function getRedirectUrl() {
    if (CONFIRMATION_PATH) return CONFIRMATION_PATH;
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/dashboard/balance/confirmation`;
}

export function AddBalanceSheet({
    triggerClassName = "",
    triggerLabel = "Add balance",
    children,
}) {
    const [open, setOpen] = useState(false);
    const [isLaunching, setIsLaunching] = useState(false);
    const [checkoutError, setCheckoutError] = useState(null);
    const { ready: wompiReady, status: wompiStatus } = useWompiCheckout();
    const missingPublicKey = WOMPI_PUBLIC_KEY.length === 0;
    const checkoutDisabled = missingPublicKey || !wompiReady || isLaunching;

    const handleCheckout = async (pkg) => {
        if (typeof window === "undefined") return;
        if (!window.WidgetCheckout) {
            console.error("[Wompi] WidgetCheckout not available on window.");
            return;
        }
        if (!wompiReady) {
            console.warn("[Wompi] Checkout attempted before script finished loading.");
            return;
        }
        if (missingPublicKey) {
            console.error("[Wompi] Public key not configured.");
            return;
        }

        setCheckoutError(null);
        setIsLaunching(true);

        const reference = buildReference(pkg.id);

        try {
            const response = await fetch("/api/payments/wompi/signature", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    reference,
                    amountInCents: pkg.amountInCents,
                    currency: "COP",
                }),
            });

            if (!response.ok) {
                const errorBody = await response.json().catch(() => ({}));
                throw new Error(errorBody.error || "Failed to prepare checkout signature");
            }

            const { signature } = await response.json();
            if (!signature) {
                throw new Error("Checkout signature missing in response");
            }

            const checkout = new window.WidgetCheckout({
                currency: "COP",
                amountInCents: pkg.amountInCents,
                reference,
                publicKey: WOMPI_PUBLIC_KEY,
                redirectUrl: getRedirectUrl(),
                signature: {
                    integrity: signature,
                },
            });

            checkout.open(() => setOpen(false));
        } catch (error) {
            console.error("[Wompi] Unable to open widget", error);
            setCheckoutError(error.message || "An unexpected error occurred while creating the payment.");
        } finally {
            setIsLaunching(false);
        }
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                {children ?? (
                    <Button
                        variant="outline"
                        className={`w-full justify-start gap-2 ${triggerClassName}`}
                    >
                        <Wallet className="h-4 w-4" />
                        {triggerLabel}
                    </Button>
                )}
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-md space-y-6 bg-zinc-950 text-zinc-100">
                <SheetHeader className="space-y-2">
                    <SheetTitle className="flex items-center gap-2 text-xl">
                        <Sparkles className="h-5 w-5 text-blue-400" />
                        Add transcription minutes
                    </SheetTitle>
                    <SheetDescription className="text-zinc-400">
                        Choose a package and complete the checkout securely with Wompi to
                        top up your minute balance instantly.
                    </SheetDescription>
                </SheetHeader>

                <div className="space-y-4">
                    {MINUTE_PACKAGES.map((pkg) => (
                        <div
                            key={pkg.id}
                            className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur transition hover:border-blue-400/40"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-sm uppercase tracking-wide text-blue-300">{pkg.title}</p>
                                    <p className="mt-1 text-lg font-semibold text-zinc-100">
                                        {pkg.minutes} minutes
                                    </p>
                                    <p className="mt-1 text-sm text-zinc-400">{pkg.description}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-zinc-400">Price</p>
                                    <p className="text-base font-semibold text-zinc-100">
                                        {formatCurrency(pkg.amountInCents)}
                                    </p>
                                </div>
                            </div>
                            <Button
                                onClick={() => handleCheckout(pkg)}
                                disabled={checkoutDisabled}
                                className="mt-4 w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
                            >
                                {isLaunching ? "Preparing checkout..." : "Purchase with Wompi"}
                            </Button>
                        </div>
                    ))}
                </div>

                <SheetFooter>
                    <p className="text-xs text-zinc-500">
                        Payments are processed by Wompi Colombia. Once your transaction is approved,
                        we will instantly credit the purchased minutes to your balance.
                    </p>
                    {!wompiReady && !missingPublicKey && wompiStatus !== "error" && (
                        <p className="text-xs text-zinc-400">
                            Loading Wompi checkout widget. If this takes too long, check your network connection or disable ad blockers.
                        </p>
                    )}
                    {wompiStatus === "error" && (
                        <p className="text-xs text-red-400">
                            We could not load the Wompi widget. Verify that https://checkout.wompi.co is reachable from your network.
                        </p>
                    )}
                    {missingPublicKey && (
                        <p className="text-xs text-red-400">
                            Wompi public key is missing. Set NEXT_PUBLIC_WOMPI_PUBLIC_KEY in your environment and restart the dev server.
                        </p>
                    )}
                    {checkoutError && (
                        <p className="text-xs text-red-400">
                            {checkoutError}
                        </p>
                    )}
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
