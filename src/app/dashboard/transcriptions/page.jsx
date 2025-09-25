'use client'
// src/app/dashboard/transcriptions/page.jsx
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { FileAudio2, CheckCircle2, MoreHorizontal } from "lucide-react";

/* Animación reveal */
function Reveal({ children, delay = 0, y = 16 }) {
    return (
        <motion.div
            initial={{ opacity: 0, y }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay }}
        >
            {children}
        </motion.div>
    );
}

export default function TranscriptionsPage() {
    const [user, setUser] = useState(null);
    const [files, setFiles] = useState([])

    useEffect(() => {
        const getUser = async () => {
            try {
                const res = await fetch("/api/user");
                if (!res.ok) throw new Error("Error fetching user");
                const data = await res.json();
                setUser(data.user);
            } catch (err) {
                console.error(err);
            }
        };

        getUser();
    }, []);

    useEffect(() => {
        const getTranscriptions = async () => {
            try {
                if (!user) return;
                const res = await fetch("/api/transcriptions/" + user.id);
                if (!res.ok) throw new Error("Error fetching transcriptions");
                const data = await res.json();
                setFiles(data);
            } catch (err) {
                console.error(err);
            }
        };

        getTranscriptions();
    }, [user]);

    if (!user) return <p>Loading...</p>;

    return (
        <div className="w-full min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-950 to-zinc-900 text-zinc-50 p-6">
            <Reveal>
                <Card className="border-white/10 bg-white/5 backdrop-blur">
                    <CardHeader>
                        <CardTitle className="text-zinc-200 text-lg">All files</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* Encabezado */}
                        <div className="grid grid-cols-4 gap-4 border-b border-white/10 pb-3 text-sm font-medium text-zinc-400">
                            <span>Name</span>
                            <span>Uploaded</span>
                            <span>Duration</span>
                        </div>

                        {/* Lista */}
                        {files.map((file) => (
                            <div
                                key={file.id}
                                className="grid grid-cols-4 gap-4 items-center border-b border-white/5 py-3 text-sm"
                            >
                                {/* Name */}
                                <div className="flex items-center gap-2 truncate">
                                    <FileAudio2 className="size-4 text-emerald-400 shrink-0" />
                                    <span className="truncate text-zinc-200">{file.title}</span>
                                </div>

                                {/* Uploaded */}
                                <span className="text-zinc-300">{file.createdAt}</span>

                                {/* Duration */}
                                <span className="text-zinc-300">{file.duration}</span>

                                {/* Status */}
                                <div className="flex items-center justify-between">
                                    <MoreHorizontal className="size-4 text-zinc-400 cursor-pointer hover:text-zinc-200" />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </Reveal>
        </div>
    );
}