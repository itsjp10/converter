"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Clock, Loader2, XOctagon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const STATUS_CONFIG = {
    LOADING: {
        icon: Loader2,
        title: "Verifying your payment",
        description: "We are validating the transaction with Wompi. This will only take a moment.",
        tone: "text-blue-300",
        bg: "bg-blue-500/10 border-blue-500/40",
    },
    APPROVED: {
        icon: CheckCircle2,
        title: "Payment approved",
        description: "Your minutes were added successfully. You can continue transcribing right away.",
        tone: "text-emerald-400",
        bg: "bg-emerald-500/10 border-emerald-500/40",
    },
    PENDING: {
        icon: Clock,
        title: "Payment pending",
        description: "We are waiting for Wompi to confirm the transaction. This may take a few minutes.",
        tone: "text-amber-300",
        bg: "bg-amber-500/10 border-amber-500/30",
    },
    DECLINED: {
        icon: XOctagon,
        title: "Payment declined",
        description: "The transaction was not approved. Please try again or use a different payment method.",
        tone: "text-red-400",
        bg: "bg-red-500/10 border-red-500/30",
    },
    ERROR: {
        icon: XOctagon,
        title: "Payment verification error",
        description: "We couldn't validate this transaction. Please try again later or contact support.",
        tone: "text-red-400",
        bg: "bg-red-500/10 border-red-500/30",
    },
};

export default function BalanceConfirmationPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const transactionId = searchParams.get("id") || searchParams.get("transactionId");

    const [state, setState] = useState({
        status: "LOADING",
        minutes: null,
        amount: null,
        message: null,
    });

    useEffect(() => {
        if (!transactionId) {
            setState({
                status: "ERROR",
                minutes: null,
                amount: null,
                message: "Transaction id not found in the redirect URL.",
            });
            return;
        }

        const verify = async () => {
            try {
                const res = await fetch(`/api/payments/wompi/transaction?transactionId=${transactionId}`);
                const payload = await res.json();

                if (!res.ok) {
                    throw new Error(payload?.error || "Unable to verify payment.");
                }

                setState({
                    status: payload.status,
                    minutes: payload.minutes || null,
                    amount: payload.amountInCents || null,
                    message: payload.message || null,
                });
            } catch (error) {
                setState({
                    status: "ERROR",
                    minutes: null,
                    amount: null,
                    message: error.message,
                });
            }
        };

        verify();
    }, [transactionId]);

    const config = STATUS_CONFIG[state.status] ?? STATUS_CONFIG.PENDING;
    const Icon = config?.icon ?? Clock;

    const formattedAmount =
        typeof state.amount === "number"
            ? new Intl.NumberFormat("es-CO", {
                style: "currency",
                currency: "COP",
                minimumFractionDigits: 0,
            }).format(state.amount / 100)
            : null;

    const isError = state.status === "ERROR";
    const showDetails = !isError && state.status !== "LOADING";
    const iconExtraClass = state.status === "LOADING" ? "animate-spin" : "";

    return (
        <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
            <Card className="w-full max-w-lg border-white/10 bg-white/5 backdrop-blur">
                <CardHeader className="space-y-3 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/5">
                        <Icon className={`h-7 w-7 ${config.tone} ${iconExtraClass}`} />
                    </div>
                    <CardTitle className="text-2xl font-semibold text-zinc-100">
                        {config.title}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-center text-sm text-zinc-300">
                    <p>{state.message && isError ? state.message : config.description}</p>

                    {showDetails && (
                        <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-left">
                            <p className="text-xs uppercase text-zinc-400">Transaction details</p>
                            <div className="mt-2 grid grid-cols-2 gap-3 text-sm text-zinc-200">
                                <div>
                                    <p className="text-xs text-zinc-400">Transaction ID</p>
                                    <p className="truncate font-medium">{transactionId}</p>
                                </div>
                                {state.minutes && (
                                    <div>
                                        <p className="text-xs text-zinc-400">Minutes added</p>
                                        <p className="font-medium">{state.minutes} minutes</p>
                                    </div>
                                )}
                                {formattedAmount && (
                                    <div>
                                        <p className="text-xs text-zinc-400">Amount</p>
                                        <p className="font-medium">{formattedAmount}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-xs text-zinc-400">Status</p>
                                    <p className="font-medium">{state.status}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col gap-2 pt-4">
                        <Button
                            onClick={() => router.push("/dashboard/transcriptions")}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            Go to transcriptions
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => router.push("/dashboard/upload")}
                            className="border-white/20 text-zinc-200 hover:bg-white/10"
                        >
                            Upload another file
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
