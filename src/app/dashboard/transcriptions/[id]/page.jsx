'use client'

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { Copy, Trash2, Calendar, Clock3, Clock, Check, Crown, FileText, FileType, FileSpreadsheet, ArrowLeft, LogIn } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Loading from "./loading";
import { AddBalanceSheet } from "@/components/add-balance-sheet";
import { useDashboardBanner } from "@/components/dashboard-banner-provider";

export default function SingleTranscription() {
    const { id } = useParams();
    const router = useRouter();

    const [transcription, setTranscription] = useState(null);
    const [isCopied, setIsCopied] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [downloadingFormat, setDownloadingFormat] = useState(null);
    const [downloadError, setDownloadError] = useState(null);
    const { showBanner } = useDashboardBanner();

    const fetchUserData = useCallback(async () => {
        const res = await fetch("/api/user");
        if (!res.ok) {
            throw new Error(`User fetch failed: ${res.status}`);
        }
        const data = await res.json();
        setUser(data.user);
        return data.user;
    }, []);

    //fetching the user
    useEffect(() => {
        const getUser = async () => {
            try {
                await fetchUserData();
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        getUser();
    }, [fetchUserData]);

    useEffect(() => {
        async function fetchTranscription() {
            try {
                const res = await fetch(`/api/transcriptions/${id}`);
                if (res.status === 404) {
                    setError("404: Transcription not found");
                    return;
                }
                if (res.status === 401) {
                    setError("401: Unauthorized");
                    return;
                }
                if (!res.ok) {
                    setError("500: Error fetching transcription");
                    return;
                }
                const data = await res.json();
                // Simulación de delay para ver skeleton
                //setTimeout(() => setTranscription(data), 10000);
                setTranscription(data)
            } catch (err) {
                setError("Network error fetching transcription");
            }
        }
        fetchTranscription();
    }, [id]);

    function formatDate(isoString) {
        const date = new Date(isoString);

        const dateOptions = {
            day: "2-digit",
            month: "long",
            year: "numeric",
        };

        const formattedDate = date.toLocaleDateString("en-GB", dateOptions);

        return `${formattedDate}`;
    }

    function formatDuration(totalSeconds) {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        if (minutes > 0) {
            // minutos con 2 dígitos, pero 00 en segundos
            if (seconds == 0) {
                return `${String(minutes).padStart(2, "0")} min`;
            }
            // minutos con 2 dígitos, segundos con 2 dígitos
            return `${String(minutes).padStart(2, "0")} min ${String(seconds).padStart(2, "0")} sec`;
        } else {
            // solo segundos, con 2 dígitos
            return `${String(seconds).padStart(2, "0")} sec`;
        }
    }

    const handlePaymentCompleted = useCallback(async ({ status, minutes, credits, message }) => {
        const normalized = (status || "").toUpperCase();

        if (normalized === "APPROVED") {
            if (typeof credits === "number") {
                setUser((prev) => (prev ? { ...prev, credits } : prev));
            } else {
                try {
                    await fetchUserData();
                } catch (err) {
                    console.error("Unable to refresh user after payment", err);
                }
            }
            showBanner({
                type: "success",
                title: "Payment approved",
                message: message || `We added ${minutes ?? ""} minutes to your balance.`,
            });
        } else if (normalized === "PENDING") {
            showBanner({
                type: "pending",
                title: "Payment pending",
                message: message || "We'll update your balance once the payment is confirmed.",
            });
        } else if (normalized === "DECLINED" || normalized === "REJECTED" || normalized === "VOIDED") {
            showBanner({
                type: "error",
                title: "Payment declined",
                message: message || "The transaction was not approved. Please try again with another payment method.",
            });
        } else if (normalized === "ERROR") {
            showBanner({
                type: "error",
                title: "Payment verification failed",
                message: message || "We couldn't verify the transaction. Please review it later.",
            });
        } else {
            showBanner({
                type: "info",
                title: "Checkout closed",
                message: "The payment window closed before finishing the transaction.",
            });
        }
    }, [fetchUserData, showBanner]);

    const sanitizeFilename = (title, extension) => {
        const safeTitle = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/gi, "-")
            .replace(/^-+|-+$/g, "") || "transcription";
        return `${safeTitle}.${extension}`;
    };

    const handleDownload = async (format) => {
        if (!transcription || downloadingFormat) return;

        setDownloadError(null);
        setDownloadingFormat(format);

        try {
            const res = await fetch(`/api/transcriptions/${transcription.id}/export?format=${format}`);
            if (!res.ok) {
                if (res.status === 404) throw new Error("Transcription not found");
                if (res.status === 403) throw new Error("You do not have access to this transcription");
                if (res.status === 401) throw new Error("Please sign in to export");
                const { error: message } = await res.json().catch(() => ({ error: "Failed to export transcription" }));
                throw new Error(message || "Failed to export transcription");
            }

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;

            const disposition = res.headers.get("Content-Disposition");
            const match = disposition?.match(/filename="(.+?)"/i);
            link.download = match?.[1] || sanitizeFilename(transcription.title, format);

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            setDownloadError(err.message || "Failed to export transcription");
        } finally {
            setDownloadingFormat(null);
        }
    };

    const handleDelete = async () => {
        if (!transcription) return;

        try {
            const res = await fetch(`/api/transcriptions/${transcription.id}`, {
                method: "DELETE",
            });

            if (!res.ok) throw new Error("Failed to delete transcription");

            // Redirige al listado de transcriptions
            router.push("/dashboard/transcriptions");
        } catch (err) {
            setError("Error deleting transcription");
        }

    }

    // skeleton loading
    if (isLoading && !error) return <Loading />;

    // error UI
    if (error) {
        const is401 = error.includes("401");
        const is404 = error.includes("404");

        return (
            <div className="flex w-full justify-center px-4 py-12">
                <Card className="max-w-md w-full border-white/10 bg-white/5 backdrop-blur p-6 text-center">
                    <CardTitle
                        className={`text-lg mb-2 ${is401 ? "text-blue-400" : "text-red-400"
                            }`}
                    >
                        {is401
                            ? "You need to log in"
                            : is404
                                ? "Transcription not found"
                                : "Something went wrong"}
                    </CardTitle>

                    <p className="text-sm text-zinc-400 mb-4">
                        {is401
                            ? "Your session has expired or you’re not logged in. Please sign in to continue."
                            : is404
                                ? "The transcription you are looking for does not exist or may have been deleted."
                                : "An unexpected error occurred. Please try again later."}
                    </p>

                    <div className="flex justify-center">
                        {is401 ? (
                            <button
                                onClick={() => router.push("/login")}
                                className="inline-flex items-center gap-2 rounded-md border border-blue-500/40 bg-blue-500/10 px-3 py-2 text-sm text-blue-300 hover:bg-blue-500/20 transition-colors"
                            >
                                <LogIn className="h-4 w-4" />
                                Go to Login
                            </button>
                        ) : (
                            <button
                                onClick={() => router.push("/dashboard/transcriptions")}
                                className="inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/5 px-3 py-2 text-sm text-zinc-200 hover:bg-white/10 transition-colors"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back
                            </button>
                        )}
                    </div>
                </Card>
            </div>
        );
    }

    if (!transcription && !error) return <Loading />;

    if (error) {
        return (
            <div className="flex w-full justify-center px-4 py-12">
                <Card className="max-w-md w-full border-white/10 bg-white/5 backdrop-blur p-6 text-center">
                    <CardTitle className="text-red-400 text-lg mb-2">{error}</CardTitle>
                    <p className="text-sm text-zinc-400">
                        The transcription you are looking for does not exist or may have been deleted.
                    </p>
                    <div className="mt-6 flex justify-center">
                        <button
                            onClick={() => router.push("/dashboard/transcriptions")}
                            className="inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/5 px-3 py-1.5 text-sm text-zinc-200 hover:bg-white/10 transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </button>
                    </div>
                </Card>
            </div>
        );
    }


    return (
        <div className="flex w-full justify-center px-4 py-8">
            <div className="w-full max-w-6xl flex flex-col gap-6">
                                {/* Fila 1: Back */}
                <div>
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-200 hover:bg-white/10 transition-colors hover:cursor-pointer"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </button>
                </div>

                {/* Fila 2: grid de 3 columnas */}
                <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] gap-6 items-start">
                    {/* Columna 1: Subscribe (solo en md+) */}
                    <div className="hidden lg:block">
                        <Card className="w-56 border border-white/10 bg-white/5 backdrop-blur gap-1">
                            <CardHeader>
                                <CardTitle className="text-sm font-semibold text-zinc-200">
                                    Minute balance
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-4">
                                <div className="flex items-center gap-2 text-sm text-zinc-400">
                                    <Clock className="h-4 w-4 text-indigo-400" />
                                    <span>{(user?.credits ?? 0)} minutes</span>
                                </div>
                                <AddBalanceSheet
                                    triggerLabel="Subscribe"
                                    onPaymentCompleted={handlePaymentCompleted}
                                >
                                    <button
                                        type="button"
                                        className="flex w-full items-center justify-center gap-2 rounded-md border border-indigo-400/40 bg-indigo-500/10 px-3 py-2 text-sm text-indigo-300 transition-colors hover:bg-indigo-500/20 hover:cursor-pointer"
                                    >
                                        <Crown className="h-4 w-4" />
                                        Subscribe
                                    </button>
                                </AddBalanceSheet>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Columna 2: Main */}
                    <Card className="border-white/10 bg-white/5 backdrop-blur">
                        <CardHeader className="gap-0.5">
                            <div className="mt-2 flex flex-wrap gap-6 text-sm text-zinc-400">
                                <span className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    {formatDate(transcription.createdAt)}
                                </span>
                                <span className="flex items-center gap-2">
                                    <Clock3 className="h-4 w-4" />
                                    {formatDuration(transcription.duration)}
                                </span>
                            </div>
                            <CardTitle className="text-zinc-200 text-xl">
                                {transcription.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="border-t border-white/10 w-full" />
                        </CardContent>
                        <CardContent className="flex flex-col gap-8">
                            <p className="whitespace-pre-line text-sm leading-relaxed text-zinc-200">
                                {transcription.content}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Columna 3: Actions + Export */}
                    <div className="w-full md:w-56 flex flex-col gap-6">
                        {/* Actions */}
                        <Card className="border-white/10 bg-white/5 backdrop-blur gap-1">
                            <CardHeader>
                                <CardTitle className="text-sm font-semibold text-zinc-200">
                                    Actions
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-3">
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(transcription.content);
                                        setIsCopied(true);
                                        setTimeout(() => setIsCopied(false), 2000);
                                    }}
                                    className={`flex w-full items-center gap-2 rounded-md border ${isCopied
                                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/40"
                                        : "bg-white/5 text-zinc-200 hover:bg-white/10 border-white/20 hover:cursor-pointer"
                                        } px-3 py-2 text-sm transition-colors`}
                                >
                                    {isCopied ? (
                                        <Check className="h-4 w-4" />
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}
                                    {isCopied ? "Copied!" : "Copy"}
                                </button>
                                <button
                                    onClick={() => setShowConfirm(true)}
                                    className="flex w-full items-center gap-2 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-400 hover:bg-red-500/20 transition-colors hover:cursor-pointer"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Delete
                                </button>
                            </CardContent>
                        </Card>

                        {/* Export */}
                        <Card className="border-white/10 bg-white/5 backdrop-blur gap-1">
                            <CardHeader>
                                <CardTitle className="text-sm font-semibold text-zinc-200">
                                    Export
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-3">
                                <button
                                    onClick={() => handleDownload("txt")}
                                    disabled={downloadingFormat !== null}
                                    className={`flex w-full items-center gap-2 rounded-md bg-white/5 hover:bg-white/10 px-3 py-2 text-sm text-zinc-200 transition-colors ${downloadingFormat ? "opacity-60 cursor-not-allowed" : "hover:cursor-pointer"}`}
                                >
                                    <FileText className="h-4 w-4" />
                                    {downloadingFormat === "txt" ? "Preparing..." : "Download .TXT"}
                                </button>
                                <button
                                    onClick={() => handleDownload("docx")}
                                    disabled={downloadingFormat !== null}
                                    className={`flex w-full items-center gap-2 rounded-md bg-white/5 hover:bg-white/10 px-3 py-2 text-sm text-zinc-200 transition-colors ${downloadingFormat ? "opacity-60 cursor-not-allowed" : "hover:cursor-pointer"}`}
                                >
                                    <FileType className="h-4 w-4" />
                                    {downloadingFormat === "docx" ? "Preparing..." : "Download .DOCX"}
                                </button>
                                <button
                                    onClick={() => handleDownload("xlsx")}
                                    disabled={downloadingFormat !== null}
                                    className={`flex w-full items-center gap-2 rounded-md bg-white/5 hover:bg-white/10 px-3 py-2 text-sm text-zinc-200 transition-colors ${downloadingFormat ? "opacity-60 cursor-not-allowed" : "hover:cursor-pointer"}`}
                                >
                                    <FileSpreadsheet className="h-4 w-4" />
                                    {downloadingFormat === "xlsx" ? "Preparing..." : "Download .XLSX"}
                                </button>
                                {downloadError && (
                                    <p className="text-xs text-red-400">{downloadError}</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
            {/* 🔹 Modal de confirmación */}
            {showConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    {/* Fondo */}
                    <div
                        className="absolute inset-0 bg-black/60"
                        onClick={() => setShowConfirm(false)}
                    />
                    {/* Contenido */}
                    <div className="relative w-full max-w-md rounded-xl border border-white/10 bg-zinc-900 p-6 shadow-lg">
                        <h2 className="text-lg font-medium text-zinc-200">Confirm delete</h2>
                        <p className="mt-2 text-sm text-zinc-400">
                            Are you sure you want to delete{" "}
                            <span className="text-zinc-200 font-semibold">
                                {transcription.title}
                            </span>
                            ? This action cannot be undone.
                        </p>
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="rounded-md border border-white/20 bg-white/5 px-4 py-2 text-sm text-zinc-200 hover:bg-white/10 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="rounded-md border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-400 hover:bg-red-500/20 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
