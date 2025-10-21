"use client";

import { useCallback, useEffect, useState } from "react";
import { Wallet, Sparkles } from "lucide-react";

import { MINUTE_PACKAGES } from "@/config/balance-packages";
import { useWompiCheckout } from "@/hooks/use-wompi-checkout";
import { useDashboardBanner } from "@/components/dashboard-banner-provider";
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
    onPaymentCompleted,
    variant = "default",
}) {
    const [open, setOpen] = useState(false);
    const [pendingPackageId, setPendingPackageId] = useState(null);
    const [checkoutError, setCheckoutError] = useState(null);
    const { ready: wompiReady, status: wompiStatus } = useWompiCheckout();
    const { showBanner } = useDashboardBanner();

    const missingPublicKey = WOMPI_PUBLIC_KEY.length === 0;
    const isProcessing = pendingPackageId !== null;
    const disableAll = missingPublicKey || !wompiReady || isProcessing;

    const resetState = useCallback(() => {
        setPendingPackageId(null);
    }, []);

    const broadcastStatus = useCallback((detail) => {
        if (typeof window === "undefined") return;
        window.dispatchEvent(new CustomEvent("dashboard:payment", { detail }));
    }, []);

    const handleCheckoutResult = useCallback(
        async (result, pkg, reference) => {
            setCheckoutError(null);

            const event = typeof result?.event === "string" ? result.event.toUpperCase() : undefined;
            const transaction = result?.transaction;
            const transactionId = transaction?.id || result?.transactionId;
            const transactionStatus = typeof transaction?.status === "string" ? transaction.status.toUpperCase() : undefined;

            try {
                if (!transactionId) {
                    const fallbackStatus = event || transactionStatus || "CLOSED";
                    const isClosed = fallbackStatus === "CLOSED";
                    const bannerPayload = isClosed
                        ? {
                            type: "info",
                            title: "Checkout closed",
                            message: "You closed the payment window before finishing the transaction.",
                        }
                        : {
                            type: "warning",
                            title: "Payment not completed",
                            message: "We couldn't retrieve the transaction result. Please try again.",
                        };
                    showBanner(bannerPayload);
                    const payload = {
                        status: fallbackStatus,
                        reference,
                        package: pkg,
                        message: bannerPayload.message,
                    };
                    onPaymentCompleted?.(payload);
                    broadcastStatus(payload);
                    return;
                }

                const verifyResponse = await fetch(`/api/payments/wompi/transaction?transactionId=${transactionId}`);
                const verifyData = await verifyResponse.json();

                if (!verifyResponse.ok) {
                    throw new Error(verifyData?.error || "Failed to validate the transaction.");
                }

                const normalizedStatus = (verifyData.status || transactionStatus || "").toUpperCase();
                const minutesAwarded = verifyData.minutes ?? pkg.minutes ?? null;
                const credits = verifyData.credits ?? null;
                const defaultMessage = verifyData.message || undefined;

                if (normalizedStatus === "APPROVED") {
                    const message = defaultMessage || `We added ${minutesAwarded ?? pkg.minutes} minutes to your balance.`;
                    showBanner({ type: "success", title: "Payment approved", message });
                    const payload = {
                        status: "APPROVED",
                        minutes: minutesAwarded,
                        credits,
                        transactionId,
                        reference,
                        package: pkg,
                        message,
                    };
                    onPaymentCompleted?.(payload);
                    broadcastStatus(payload);
                } else if (normalizedStatus === "PENDING") {
                    const message = defaultMessage || "We will update your balance once the payment is confirmed.";
                    showBanner({ type: "pending", title: "Payment pending", message });
                    const payload = {
                        status: "PENDING",
                        minutes: minutesAwarded,
                        credits,
                        transactionId,
                        reference,
                        package: pkg,
                        message,
                    };
                    onPaymentCompleted?.(payload);
                    broadcastStatus(payload);
                } else {
                    const message = defaultMessage || "The transaction was declined. Please try again with another payment method.";
                    showBanner({ type: "error", title: "Payment not approved", message });
                    const payload = {
                        status: normalizedStatus || "DECLINED",
                        minutes: minutesAwarded,
                        credits,
                        transactionId,
                        reference,
                        package: pkg,
                        message,
                    };
                    onPaymentCompleted?.(payload);
                    broadcastStatus(payload);
                }
            } catch (error) {
                console.error("[Wompi] Unable to verify payment", error);
                const message = error.message || "We couldn't confirm the transaction. Please review it later in your payment history.";
                showBanner({ type: "error", title: "Unable to verify payment", message });
                const payload = {
                    status: "ERROR",
                    reference,
                    package: pkg,
                    message,
                };
                onPaymentCompleted?.(payload);
                broadcastStatus(payload);
            } finally {
                resetState();
            }
        },
        [onPaymentCompleted, resetState, showBanner],
    );

    const handleCheckout = useCallback(
        async (pkg) => {
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
            setPendingPackageId(pkg.id);

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

                setOpen(false);
                checkout.open((result) => {
                    handleCheckoutResult(result, pkg, reference);
                });
            } catch (error) {
                console.error("[Wompi] Unable to open widget", error);
                const message = error.message || "An unexpected error occurred while creating the payment.";
                setCheckoutError(message);
                showBanner({ type: "error", title: "Unable to start checkout", message });
                resetState();
            }
        },
        [handleCheckoutResult, missingPublicKey, resetState, showBanner, wompiReady],
    );

    useEffect(() => {
        if (!open) {
            setCheckoutError(null);
        }
    }, [open]);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                {children ?? (
                    <Button
                        variant={variant === "sidebar" ? "secondary" : "outline"}
                        className={`w-full justify-start gap-2 ${
                            variant === "sidebar"
                                ? "bg-indigo-500/10 text-indigo-200 hover:bg-indigo-500/20 border border-indigo-400/40"
                                : ""
                        } ${triggerClassName}`}
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
                                disabled={disableAll}
                                className="mt-4 w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 hover:cursor-pointer"
                            >
                                {pendingPackageId === pkg.id ? "Preparing checkout..." : "Purchase with Wompi"}
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
