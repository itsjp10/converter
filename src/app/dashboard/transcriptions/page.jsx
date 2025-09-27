'use client'
// src/app/dashboard/transcriptions/page.jsx
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { FileAudio2, Search, Trash2 } from "lucide-react";

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
    const [files, setFiles] = useState([]);
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState([]);
    const [showConfirm, setShowConfirm] = useState(false);

    const toggleAll = (checked) => {
        if (checked) {
            setSelected(filteredFiles.map((f) => f.id));
        } else {
            setSelected((prev) =>
                prev.filter((id) => !filteredFiles.some((f) => f.id === id))
            );
        }
    };


    const toggleOne = (id) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const filteredFiles = files.filter((f) =>
        f.title.toLowerCase().includes(search.toLowerCase())
    );

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

    const handleDelete = async () => {
        await fetch("/api/transcriptions", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids: selected }),
        })
        setFiles(files.filter(f => !selected.includes(f.id)))
        setSelected([])
        setShowConfirm(false);
    }

    if (!user) return <p>Loading...</p>;

    return (
        <div className="flex w-full justify-center px-4 py-8">
            <Reveal>
                <Card className="w-full max-w-4xl border-white/10 bg-white/5 backdrop-blur">
                    <CardHeader>
                        <CardTitle className="text-zinc-200 text-lg">All files</CardTitle>
                        <div className="relative mt-3">
                            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full rounded-md border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-sm text-zinc-200 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="min-h-[200px]">
                        {/* Encabezado */}
                        <div className="grid grid-cols-[40px_2fr_1fr_1fr] gap-4 border-b border-white/10 pb-3 text-sm font-medium text-zinc-400">
                            <label className="flex items-center justify-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={selected.length === files.length && files.length > 0}
                                    onChange={(e) => toggleAll(e.target.checked)}
                                    className="peer hidden"
                                />
                                <div className="h-4 w-4 rounded border border-white/20 bg-white/5 
                        peer-checked:bg-emerald-500 peer-checked:border-emerald-500 
                        flex items-center justify-center transition-colors">
                                    {/* Checkmark */}
                                    <svg
                                        className="hidden peer-checked:block h-3 w-3 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            </label>
                            <span>Name</span>
                            <span>Uploaded</span>
                            <span>Duration</span>
                        </div>

                        {/* Lista */}
                        {filteredFiles.length > 0 ? (
                            filteredFiles.map((file) => (
                                <div
                                    key={file.id}
                                    className="grid grid-cols-[40px_2fr_1fr_1fr] gap-4 items-center border-b border-white/5 py-3 text-sm hover:bg-white/5"
                                >
                                    {/* Checkbox */}
                                    <label className="flex items-center justify-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selected.includes(file.id)}
                                            onChange={() => toggleOne(file.id)}
                                            className="peer hidden"
                                        />
                                        <div className="h-4 w-4 rounded border border-white/20 bg-white/5 
                                peer-checked:bg-emerald-500 peer-checked:border-emerald-500 
                                flex items-center justify-center transition-colors">
                                            <svg
                                                className="hidden peer-checked:block h-3 w-3 text-white"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    </label>

                                    {/* Name */}
                                    <div className="flex items-center gap-2 truncate">
                                        <FileAudio2 className="size-4 text-emerald-400 shrink-0" />
                                        <span className="truncate text-zinc-200">{file.title}</span>
                                    </div>

                                    {/* Uploaded */}
                                    <span className="text-zinc-300">{file.createdAt}</span>

                                    {/* Duration */}
                                    <span className="text-zinc-300">{file.duration}</span>
                                </div>
                            ))
                        ) : (
                            <div className="grid grid-cols-[40px_2fr_1fr_1fr] py-12">
                                <p className="col-span-4 text-center text-sm text-zinc-400">
                                    No files found.
                                </p>
                            </div>
                        )}

                    </CardContent>

                </Card>
            </Reveal>
            {selected.length > 0 && (
                <div className="fixed bottom-4 left-0 right-0 flex justify-center px-4">
                    <div className="flex w-full max-w-sm items-center justify-between rounded-xl border border-white/10 bg-zinc-900 px-4 py-2">
                        {/* Texto con contador */}
                        <p className="text-sm text-zinc-200">
                            Selected files: {selected.length}
                        </p>

                        {/* Botón eliminar solo con ícono */}
                        <button
                            onClick={() => setShowConfirm(true)}
                            className="flex items-center justify-center rounded-md border border-red-500/40 bg-red-500/10 p-2 text-red-400 hover:bg-red-500/20 transition-colors"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}


            {/* Modal de confirmación */}
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
                            Are you sure you want to delete {selected.length} file{selected.length > 1 ? "s" : ""}? This action cannot be undone.
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