'use client'

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Copy, Trash2, Calendar, Clock3, Clock, Check, Crown, FileText, FileType, FileSpreadsheet, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SingleTranscription() {
    const { id } = useParams();
    const router = useRouter();
    const [transcription, setTranscription] = useState(null);
    const [isCopied, setIsCopied] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    useEffect(() => {
        async function fetchTranscription() {
            const res = await fetch(`/api/transcriptions/${id}`);
            const data = await res.json();
            setTranscription(data);
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
            console.error(err);
            alert("Error deleting transcription");
        }

    }


    if (!transcription) return <p className="text-zinc-400">Loading...</p>;

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
                                    <span>10 minutes</span>
                                </div>
                                <button className="flex items-center justify-center gap-2 rounded-md border border-indigo-400/40 bg-indigo-500/10 px-3 py-2 text-sm text-indigo-300 hover:bg-indigo-500/20 transition-colors hover:cursor-pointer">
                                    <Crown className="h-4 w-4" />
                                    Subscribe
                                </button>
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
                                <button className="flex w-full items-center gap-2 rounded-md bg-white/5 hover:bg-white/10 px-3 py-2 text-sm text-zinc-200 transition-colors hover:cursor-pointer">
                                    <FileText className="h-4 w-4" />
                                    Download .TXT
                                </button>
                                <button className="flex w-full items-center gap-2 rounded-md bg-white/5 hover:bg-white/10 px-3 py-2 text-sm text-zinc-200 transition-colors hover:cursor-pointer">
                                    <FileType className="h-4 w-4" />
                                    Download .DOCX
                                </button>
                                <button className="flex w-full items-center gap-2 rounded-md bg-white/5 hover:bg-white/10 px-3 py-2 text-sm text-zinc-200 transition-colors hover:cursor-pointer">
                                    <FileSpreadsheet className="h-4 w-4" />
                                    Download .XLSX
                                </button>
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
