'use client'

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Copy, Trash2, Calendar, FileText, FileType, FileSpreadsheet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SingleTranscription() {
    const { id } = useParams();
    const [transcription, setTranscription] = useState(null);

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


    if (!transcription) return <p className="text-zinc-400">Loading...</p>;

    return (
        <div className="flex w-full justify-center px-4 py-8">
            <div className="flex w-full max-w-6xl flex-col md:flex-row gap-6">
                {/*Main card */}
                <Card className="flex-1 border-white/10 bg-white/5 backdrop-blur">
                    <CardHeader className="gap-0.5">
                        <div className="mt-2 flex gap-6 text-sm text-zinc-400">
                            <span>{formatDate(transcription.createdAt)}</span>
                            <span>{formatDuration(transcription.duration)}</span>
                        </div>
                        <CardTitle className="text-zinc-200 text-2xl">
                            {transcription.title}
                        </CardTitle>
                    </CardHeader>

                    {/*separator*/}
                    <CardContent>
                        <div className="border-t border-white/10 w-full"/>
                    </CardContent>

                    <CardContent className="flex flex-col gap-8">
                        <div className="flex-1 space-y-4">
                            <p className="whitespace-pre-line text-sm leading-relaxed text-zinc-200">
                                {transcription.content}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/*Actions + Export stacked */}
                <div className="w-full md:w-64 flex flex-col gap-6">
                    {/* Card Actions */}
                    <Card className="border-white/10 bg-white/5 backdrop-blur">
                        <CardHeader>
                            <CardTitle className="text-sm text-zinc-400">Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-3">
                            <button
                                onClick={() => navigator.clipboard.writeText(transcription.content)}
                                className="flex w-full items-center gap-2 rounded-md border border-white/20 bg-white/5 px-3 py-2 text-sm text-zinc-200 hover:bg-white/10 transition-colors"
                            >
                                <Copy className="h-4 w-4" />
                                Copy
                            </button>
                            <button
                                onClick={() => alert('Delete logic aquí')}
                                className="flex w-full items-center gap-2 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-400 hover:bg-red-500/20 transition-colors"
                            >
                                <Trash2 className="h-4 w-4" />
                                Delete
                            </button>
                        </CardContent>
                    </Card>

                    {/* Card Export */}
                    <Card className="border-white/10 bg-white/5 backdrop-blur">
                        <CardHeader>
                            <CardTitle className="text-sm text-zinc-400">Export</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-3">
                            <button className="flex w-full items-center gap-2 rounded-md bg-white/5 hover:bg-white/10 px-3 py-2 text-sm text-zinc-200 transition-colors">
                                <FileText className="h-4 w-4" />
                                Download .TXT
                            </button>
                            <button className="flex w-full items-center gap-2 rounded-md bg-white/5 hover:bg-white/10 px-3 py-2 text-sm text-zinc-200 transition-colors">
                                <FileType className="h-4 w-4" />
                                Download .DOCX
                            </button>
                            <button className="flex w-full items-center gap-2 rounded-md bg-white/5 hover:bg-white/10 px-3 py-2 text-sm text-zinc-200 transition-colors">
                                <FileSpreadsheet className="h-4 w-4" />
                                Download .XLSX
                            </button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
