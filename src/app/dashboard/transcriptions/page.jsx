'use client'
// src/app/dashboard/transcriptions/page.jsx
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { FileAudio2, Search } from "lucide-react";

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
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState([]);

    const toggleAll = (checked) => {
        if (checked) {
            setSelected(files.map((f) => f.id));
        } else {
            setSelected([]);
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
                            <input
                                type="checkbox"
                                checked={selected.length === files.length && files.length > 0}
                                onChange={(e) => toggleAll(e.target.checked)}
                                className="h-4 w-4 cursor-pointer"
                            />
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
                                    <input
                                        type="checkbox"
                                        checked={selected.includes(file.id)}
                                        onChange={() => toggleOne(file.id)}
                                        className="h-4 w-4 cursor-pointer"
                                    />

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
        </div>
    );
}