'use client'

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Copy, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SingleTranscription() {
    const { id } = useParams();
    const [transcription, setTranscription] = useState(null);

    useEffect(() => {
        // 🔹 Simulación de fetch (cámbialo por /api/transcriptions/${id})
        const fakeData = {
            id,
            title: "WhatsApp Ptt 2025-09-17 at 11.32.02 AM.ogg",
            createdAt: "20 September 2025",
            duration: "04 min 57 sec",
            content: `to part of a lecture in an art history class. The class has been studying the history of Western European art. 
            OK, let’s get started. In the last class, we were talking about a period of art that’s also a style of art in Italy,
            a style called the High Renaissance...`,
        };
        setTranscription(fakeData);
    }, [id]);

    if (!transcription) return <p className="text-zinc-400">Loading...</p>;

    return (
        <div className="flex w-full justify-center px-4 py-8">
            <Card className="w-full max-w-5xl border-white/10 bg-white/5 backdrop-blur">
                <CardHeader>
                    <CardTitle className="text-zinc-200 text-lg">
                        {transcription.title}
                    </CardTitle>
                    <div className="mt-2 flex gap-6 text-sm text-zinc-400">
                        <span>{transcription.createdAt}</span>
                        <span>{transcription.duration}</span>
                    </div>
                </CardHeader>

                <CardContent className="flex flex-col md:flex-row gap-8">
                    {/* Texto de la transcripción */}
                    <div className="flex-1 space-y-4">
                        <p className="whitespace-pre-line text-sm leading-relaxed text-zinc-200">
                            {transcription.content}
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="w-full md:w-40 flex-shrink-0 space-y-3">
                        <h3 className="text-sm font-medium text-zinc-400">Actions</h3>
                        <button
                            onClick={() => navigator.clipboard.writeText(transcription.content)}
                            className="flex w-full items-center gap-2 rounded-md border border-white/20 bg-white/5 px-3 py-2 text-sm text-zinc-200 hover:bg-white/10 transition-colors"
                        >
                            <Copy className="h-4 w-4" />
                            Copy
                        </button>
                        <button
                            onClick={() => alert("Delete logic aquí")}
                            className="flex w-full items-center gap-2 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-400 hover:bg-red-500/20 transition-colors"
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete
                        </button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
