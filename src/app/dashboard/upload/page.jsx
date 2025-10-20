"use client";
import React from "react";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { Button, } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, Trash2, FileAudio2, Languages, Clock, Loader2, } from "lucide-react";

/* ---------- Helpers visuales para mantener el estilo ---------- */
function Reveal({ children, delay = 0, y = 16, once = true, className = "" }) {
    const ref = React.useRef(null);
    const isInView = useInView(ref, { margin: "-10% 0px -10% 0px", once });
    return (
        <div ref={ref} className={className}>
            <motion.div
                initial={{ opacity: 0, y }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, ease: "easeOut", delay }}
            >
                {children}
            </motion.div>
        </div>
    );
}

function Grid() {
    return (
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-[radial-gradient(50%_50%_at_50%_0%,rgba(59,130,246,0.18),rgba(0,0,0,0)_60%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:24px_24px] opacity-[0.15]" />
        </div>
    );
}

function Noise() {
    return (
        <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 opacity-20 mix-blend-soft-light"
            style={{
                backgroundImage:
                    "url('data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 200 200\\'%3E%3Cfilter id=\\'n\\'%3E%3CfeTurbulence type=\\'fractalNoise\\' baseFrequency=\\'0.65\\' numOctaves=\\'2\\'/%3E%3CfeColorMatrix type=\\'saturate\\' values=\\'0\\'/%3E%3C/filter%3E%3Crect width=\\'100%25\\' height=\\'100%25\\' filter=\\'url(%23n)\\'/%3E%3C/svg%3E')",
            }}
        />
    );
}
/* -------------------------------------------------------------- */

const BYTES_ACCEPT =
    "audio/*,video/mp4,video/quicktime,video/x-matroska,video/webm";

const PROGRESS_STEPS = [
    { key: "uploading", label: "Uploading file" },
    { key: "transcribing", label: "Requesting transcription" },
    { key: "queued", label: "Waiting in queue" },
    { key: "processing", label: "Processing audio" },
    { key: "saving", label: "Saving to dashboard" },
];

const STAGE_MESSAGES = {
    uploading: {
        title: "Uploading your media",
        description: "Sending the file securely so transcription can begin.",
    },
    transcribing: {
        title: "Transcription request queued",
        description: "We've asked AssemblyAI to transcribe your audio.",
    },
    queued: {
        title: "Waiting for processing",
        description: "Your file is in line. This usually takes less than a minute.",
    },
    processing: {
        title: "Transcribing in progress",
        description: "We're converting speech to text. Feel free to stay on this page.",
    },
    saving: {
        title: "Finishing up",
        description: "Saving the transcript and updating your dashboard.",
    },
    default: {
        title: "Preparing conversion",
        description: "We're getting everything ready for the transcription.",
    },
};

export default function UploadPage() {
    const [user, setUser] = useState(null);
    const [files, setFiles] = useState([]); // [{file, url, duration}]
    const [dragOver, setDragOver] = useState(false);
    const [langOn, setLangOn] = useState(false);
    const [language, setLanguage] = useState("auto");
    const [balanceMinutes, setBalanceMinutes] = useState(0);

    const [results, setResults] = useState([]); // [{name, text, id}]
    const [loading, setLoading] = useState(false);
    const [loadingStage, setLoadingStage] = useState(null);

    const [duration, setDuration] = useState(0)

    useEffect(() => {
        const getUser = async () => {
            try {
                const res = await fetch("/api/user");
                if (!res.ok) throw new Error(`User fetch failed: ${res.status}`);
                const data = await res.json();
                setUser(data.user);
            } catch (err) {
                throw new Error(`No user logged in: ${err.message}`);
            }
        };
        getUser();
    }, []);

    useEffect(() => {
        const getBalance = () => {
            if (!user) return;
            try {
                setBalanceMinutes(user.credits);
            } catch (error) {
                throw new Error("Failed to load credits from user")
            }
        }
        getBalance()
    }, [user]);


    // Cargar duracion real de cada audio/video
    const addFiles = React.useCallback((fileList) => {
        const incoming = Array.from(fileList || []);
        incoming.forEach((file) => {
            const url = URL.createObjectURL(file);
            const media = document.createElement(
                file.type.startsWith("video/") ? "video" : "audio"
            );
            media.preload = "metadata";
            media.src = url;
            media.onloadedmetadata = () => {
                setDuration(Number.isFinite(media.duration) ? media.duration : 0);
                setFiles((prev) => [...prev, { file, url, duration }]);
                URL.revokeObjectURL(media.src);
            };
            media.onerror = () => {
                setFiles((prev) => [...prev, { file, url, duration: 0 }]);
            };
        });
    }, []);

    const onDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        addFiles(e.dataTransfer.files);
    };

    const onChoose = (e) => addFiles(e.target.files);

    const activeStageKey = loadingStage ?? (loading ? "uploading" : null);
    const stageDetails = STAGE_MESSAGES[activeStageKey] ?? STAGE_MESSAGES.default;
    const activeStageIndex = PROGRESS_STEPS.findIndex((step) => step.key === activeStageKey);

    const removeAt = (idx) =>
        setFiles((prev) => prev.filter((_, i) => i !== idx));

    const formatTime = (secs) => {
        const s = Math.floor(secs || 0);
        const m = Math.floor(s / 60);
        const r = s % 60;
        const mm = String(m).padStart(2, "0");
        const ss = String(r).padStart(2, "0");
        return `0:${mm}:${ss}`;
    };

    const totalFmt = formatTime(duration);

    return (
        <div className="w-full min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-950 to-zinc-900 text-zinc-50">
            <Noise />
            <Grid />

            <main className="mx-auto max-w-5xl px-4 py-12 md:py-16">
                <Reveal>
                    <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
                        Upload &amp; transcribe
                    </h1>
                    <p className="mt-3 max-w-2xl text-zinc-300">
                        Drag and drop or upload files. We'll calculate the total duration, and you can set the transcription language if you need to.
                    </p>
                </Reveal>

                <section className="mt-8">
                    <Card className="border-white/10 bg-white/5 backdrop-blur">
                        <CardHeader>
                            <CardTitle className="text-zinc-200">Your files</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Zona Drag & Drop */}
                            <div
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    setDragOver(true);
                                }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={onDrop}
                                className={[
                                    "rounded-2xl border-2 border-dashed p-8 transition",
                                    dragOver
                                        ? "border-cyan-400 bg-cyan-400/10"
                                        : "border-white/15 bg-white/5",
                                ].join(" ")}
                            >
                                <div className="flex flex-col items-center gap-3 text-center">
                                    <div className="grid size-12 place-items-center rounded-xl bg-white/10">
                                        <Upload className="size-5" />
                                    </div>
                                    <p className="text-lg">Drag and drop files here</p>
                                    <input
                                        id="file-picker"
                                        type="file"
                                        className="hidden"
                                        accept={BYTES_ACCEPT}
                                        multiple
                                        onChange={onChoose}
                                    />
                                    <Button
                                        type="button"
                                        onClick={() =>
                                            document.getElementById("file-picker")?.click()
                                        }
                                        className="bg-blue-500 hover:bg-blue-600"
                                    >
                                        Upload files
                                    </Button>
                                    <p className="text-xs text-zinc-400">
                                        MP3, WAV, M4A, MP4, MOV, MKV, etc.
                                    </p>
                                </div>
                            </div>

                            {/* Lista de archivos */}
                            <div className="space-y-3">
                                {files.map((f, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                                    >
                                        <div className="flex min-w-0 items-center gap-3">
                                            <div className="grid size-9 place-items-center rounded-lg bg-emerald-500/15 text-emerald-300">
                                                <FileAudio2 className="size-4" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="truncate text-sm text-zinc-200">
                                                    {f.file.name}
                                                </p>
                                                <div className="mt-0.5 flex items-center gap-2 text-xs text-zinc-400">
                                                    <Clock className="size-3" />
                                                    <span>{formatTime(duration)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            className="text-zinc-300 hover:bg-white/10"
                                            onClick={() => removeAt(i)}
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                    </div>
                                ))}

                                {files.length === 0 && (
                                    <p className="text-center text-sm text-zinc-400">
                                        No files yet.
                                    </p>
                                )}
                            </div>

                            {/* Totales / Idioma / Balance */}
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="text-sm">
                                    <p className="font-medium text-zinc-200">Total duration</p>
                                    <p className="text-zinc-400">{totalFmt}</p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2">
                                        <div
                                            role="switch"
                                            aria-checked={langOn}
                                            tabIndex={0}
                                            onClick={() => setLangOn((v) => !v)}
                                            onKeyDown={(e) =>
                                                (e.key === "Enter" || e.key === " ") &&
                                                setLangOn((v) => !v)
                                            }
                                            className={[
                                                "h-6 w-11 cursor-pointer rounded-full transition",
                                                langOn ? "bg-cyan-500" : "bg-white/10",
                                            ].join(" ")}
                                        >
                                            <div
                                                className={[
                                                    "h-5 w-5 translate-x-0.5 rounded-full bg-white transition",
                                                    langOn ? "translate-x-[22px]" : "",
                                                ].join(" ")}
                                            />
                                        </div>
                                        <span className="flex items-center gap-1 text-sm text-zinc-200">
                                            <Languages className="size-4" />
                                            Transcription Language
                                        </span>
                                    </div>

                                    <select
                                        disabled={!langOn}
                                        value={language}
                                        onChange={(e) => setLanguage(e.target.value)}
                                        className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-sm text-zinc-200 disabled:opacity-50"
                                    >
                                        <option value="auto">Auto-detect</option>
                                        <option value="en">English</option>
                                        <option value="es">Espanol</option>
                                        <option value="pt">Portugues</option>
                                        <option value="fr">Francais</option>
                                        <option value="de">Deutsch</option>
                                        <option value="ru">Russkiy</option>  {/* <- nuevo */}

                                    </select>

                                </div>

                                <div className="text-sm">
                                    <p className="text-zinc-400">Your balance</p>
                                    <p className="font-medium text-zinc-200">
                                        {Math.floor(balanceMinutes / 60)}:
                                        {String(balanceMinutes % 60).padStart(2, "0")}:00
                                    </p>
                                </div>
                            </div>

                            {/* CTA */}
                            <div className="pt-2">
                                <Button
                                    disabled={loading || files.length === 0 || balanceMinutes <= Math.floor(duration / 60)}
                                    className={`w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 ${
                                        (loading || files.length === 0 || balanceMinutes <= Math.floor(duration / 60))
                                            ? "cursor-not-allowed"
                                            : "cursor-pointer"
                                    }`}
                                    onClick={async () => {
                                        if (loading) return;
                                        try {
                                            setLoading(true);
                                            setLoadingStage("uploading");
                                            setResults([]);

                                            const file = files[0]?.file;
                                            if (!file) {
                                                alert("No file selected");
                                                setLoading(false);
                                                setLoadingStage(null);
                                                return;
                                            }

                                            // 1) Upload
                                            const fd = new FormData();
                                            fd.append("file", file);
                                            const upRes = await fetch("/api/aai/upload", { method: "POST", body: fd });
                                            const upJson = await upRes.json();
                                            if (!upRes.ok) {
                                                console.error("Upload error:", upJson);
                                                alert(upJson.error || "Upload failed");
                                                setLoading(false);
                                                setLoadingStage(null);
                                                return;
                                            }
                                            const upload_url = upJson.upload_url;
                                            if (!upload_url) {
                                                alert("Upload failed: no upload_url");
                                                setLoading(false);
                                                setLoadingStage(null);
                                                return;
                                            }

                                            // 2) Create transcription
                                            const lang = langOn ? language : "auto";
                                            setLoadingStage("transcribing");

                                            const trRes = await fetch("/api/aai/transcribe", {
                                                method: "POST",
                                                headers: { "Content-Type": "application/json" },
                                                body: JSON.stringify({ upload_url, language: lang, fast: true }), // fast puede cambiar abajo
                                            });

                                            const trJson = await trRes.json();
                                            if (!trRes.ok) {
                                                console.error("Transcribe error:", trJson);
                                                alert(trJson.error || "Transcribe failed");
                                                setLoading(false);
                                                setLoadingStage(null);
                                                return;
                                            }
                                            const id = trJson.id;
                                            if (!id) {
                                                alert("Transcribe failed: no id");
                                                setLoading(false);
                                                setLoadingStage(null);
                                                return;
                                            }

                                            setLoadingStage("queued");

                                            // 3) Poll
                                            async function poll() {
                                                const res = await fetch(`/api/aai/status?id=${id}`);
                                                const data = await res.json();
                                                if (!res.ok) {
                                                    console.error("Status error:", data);
                                                    alert(data.error || "Status failed");
                                                    setLoading(false);
                                                    setLoadingStage(null);
                                                    return;
                                                }
                                                if (data.status === "completed") {
                                                    setLoadingStage("saving");
                                                    setResults([{ name: file.name, text: data.text, id }]);
                                                    try {
                                                        const newTranscription = await fetch("/api/aai/transcription", {
                                                            method: "POST",
                                                            headers: {
                                                                "Content-Type": "application/json",
                                                            },
                                                            body: JSON.stringify({
                                                                content: data.text,
                                                                title: file.name,
                                                                duration: duration,
                                                                language: language,
                                                            }),
                                                        });
                                                        console.log(newTranscription);

                                                        const response = await fetch("/api/user/updateBalance", {
                                                            method: "POST",
                                                            headers: {
                                                                "Content-Type": "application/json",
                                                            },
                                                            body: JSON.stringify({
                                                                duration: duration,
                                                            }),
                                                        });
                                                        if (response.status === 200) {
                                                            const creditData = await response.json();
                                                            if (creditData && creditData.credits !== undefined) {
                                                                setBalanceMinutes(creditData.credits);
                                                            } else {
                                                                console.error("Error: No credits in response");
                                                            }
                                                        } else {
                                                            console.error("Error updating balance", response.status);
                                                        }
                                                    } catch (err) {
                                                        console.error("Error finalizing transcription", err);
                                                    } finally {
                                                        setLoading(false);
                                                        setLoadingStage(null);
                                                    }
                                                    return;
                                                }                                                if (data.status === "error") {
                                                    alert(data.error || "Transcription error");
                                                    setLoading(false);
                                                setLoadingStage(null);
                                                return;
                                                }
                                                if (data.status === "processing" || data.status === "queued") {
                                                    setLoadingStage(data.status);
                                                }
                                                setTimeout(poll, 2000);
                                            }
                                            poll();
                                        } catch (e) {
                                            console.error(e);
                                            alert(e.message || "Unexpected error");
                                            setLoading(false);
                                            setLoadingStage(null);
                                        }
                                    }}
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Converting...
                                        </span>
                                    ) : (
                                        "Convert to text"
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                    {results.length > 0 && (
                        <section className="mt-8 space-y-4">
                            <h2 className="text-xl font-semibold">Results</h2>
                            {results.map((r, i) => (
                                <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-4">
                                    <p className="text-sm text-zinc-400 mb-1">{r.name}</p>
                                    <p className="whitespace-pre-wrap text-zinc-100">{r.text || "(empty transcript)"}</p>
                                </div>
                            ))}
                        </section>
                    )}

                    <AnimatePresence>
                        {loading && (
                            <motion.div
                                key="transcription-progress"
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -12 }}
                                transition={{ duration: 0.25, ease: "easeOut" }}
                                className="mt-6"
                            >
                                <Card className="border border-blue-500/30 bg-blue-500/10 backdrop-blur">
                                    <CardContent className="flex flex-col gap-4 p-4 sm:p-5">
                                        <div className="flex items-start gap-3">
                                            <div className="rounded-full bg-blue-500/20 p-2">
                                                <Loader2 className="h-5 w-5 animate-spin text-blue-100" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-blue-100">{stageDetails.title}</p>
                                                <p className="text-xs text-blue-100/80">{stageDetails.description}</p>
                                            </div>
                                        </div>
                                        <div className="grid gap-2 text-xs text-blue-100/70">
                                            {PROGRESS_STEPS.map((step, index) => {
                                                const isActive = index === activeStageIndex;
                                                const isComplete = activeStageIndex > index;
                                                return (
                                                    <div key={step.key} className="flex items-center gap-2">
                                                        <span
                                                            className={`h-2.5 w-2.5 rounded-full ${
                                                                isComplete
                                                                    ? "bg-blue-300"
                                                                    : isActive
                                                                        ? "bg-blue-200 animate-pulse"
                                                                        : "bg-blue-200/30"
                                                            }`}
                                                        />
                                                        <span className={`${isActive || isComplete ? "text-blue-100" : ""}`}>
                                                            {step.label}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>

                </section>

                <div className="mt-6 flex flex-wrap gap-2">
                    <Badge variant="secondary" className="bg-white/10 text-white">
                        Fast queue
                    </Badge>
                    <Badge variant="secondary" className="bg-white/10 text-white">
                        Diarization
                    </Badge>
                    <Badge variant="secondary" className="bg-white/10 text-white">
                        Timestamps
                    </Badge>
                </div>
            </main>
        </div>
    );
}
