'use client'
// src/app/dashboard/transcriptions/page.jsx
import React from "react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileAudio2, Search, Trash2, ArrowLeft, LogIn } from "lucide-react";
import Loading from "./loading";
import { useRouter } from "next/navigation";

export default function TranscriptionsPage() {
    const [user, setUser] = useState(null);
    const [files, setFiles] = useState([]);
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState([]);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    const router = useRouter();

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
                if (!res.ok) throw new Error(`User fetch failed: ${res.status}`);
                const data = await res.json();
                setUser(data.user);
            } catch (err) {
                setError(err.message);
                setIsLoading(false);
            }
        };
        getUser();
    }, []);

    useEffect(() => {
        if (!user) {
            setIsLoading(false);
            return;
        }

        const getTranscriptions = async () => {
            try {
                setIsLoading(true);
                const res = await fetch(`/api/transcriptions?userId=${user.id}&page=${page}&limit=${limit}`);
                if (!res.ok)
                    throw new Error(`Transcriptions fetch failed: ${res.status}`);
                const data = await res.json();
                setFiles(data.transcriptions);
                setTotalPages(data.totalPages);
                setTotal(data.total);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        getTranscriptions();
    }, [user, page, limit]);

    function formatDate(isoString) {
        const date = new Date(isoString);
        const dateOptions = { day: "2-digit", month: "long", year: "numeric" };
        const timeOptions = { hour: "2-digit", minute: "2-digit", hour12: false };
        const formattedDate = date.toLocaleDateString("en-GB", dateOptions);
        const formattedTime = date.toLocaleTimeString("en-GB", timeOptions);
        return `${formattedDate}, ${formattedTime}`;
    }

    function formatDuration(totalSeconds) {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        if (minutes > 0) {
            if (seconds == 0) {
                return `${String(minutes).padStart(2, "0")} min`;
            }
            return `${String(minutes).padStart(2, "0")} min ${String(seconds).padStart(
                2,
                "0"
            )} sec`;
        } else {
            return `${String(seconds).padStart(2, "0")} sec`;
        }
    }

    const handleDelete = async () => {
        await fetch("/api/transcriptions", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids: selected }),
        });
        setFiles(files.filter((f) => !selected.includes(f.id)));
        setSelected([]);
        setShowConfirm(false);
    };

    if (isLoading) return <Loading />;

    if (error) {
        const is401 = error.includes("401");
        const is404 = error.includes("404");

        return (
            <div className="flex w-full justify-center px-4 py-12">
                <Card className="max-w-md border-white/10 bg-white/5 backdrop-blur p-6 text-center">
                    <CardTitle
                        className={`text-lg mb-2 ${is401 ? "text-blue-400" : "text-red-400"}`}
                    >
                        {is401
                            ? "You need to log in"
                            : is404
                                ? "Not found"
                                : "Something went wrong"}
                    </CardTitle>

                    <p className="text-sm text-zinc-400 mb-4">
                        {is401
                            ? "Your session has expired or you’re not logged in. Please sign in to continue."
                            : is404
                                ? "The requested resource doesn’t exist."
                                : "An unexpected error occurred. Try again later."}
                    </p>

                    {is401 ? (
                        <div className="flex justify-center">
                            <button
                                onClick={() => router.push("/login")}
                                className="inline-flex items-center gap-2 rounded-md border border-blue-500/40 bg-blue-500/10 px-3 py-2 text-sm text-blue-300 hover:bg-blue-500/20 transition-colors"
                            >
                                <LogIn className="h-4 w-4" />
                                Go to Login
                            </button>
                        </div>

                    ) : (
                        <button
                            onClick={() => router.push("/dashboard")}
                            className="inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/5 px-4 py-2 text-sm text-zinc-200 hover:bg-white/10 transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Dashboard
                        </button>
                    )}
                </Card>
            </div>
        );
    }

    // UI principal
    return (
        <div className="flex w-full justify-center px-4 py-8">
            <Card className="w-full max-w-4xl border-white/10 bg-white/5 backdrop-blur overflow-visible">
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
                <CardContent className="min-h-[200px] overflow-visible">
                    {/* Encabezado */}
                    <div className="grid grid-cols-[40px_2fr_1fr_1fr] gap-4 border-b border-white/10 pb-3 text-sm font-medium text-zinc-400">
                        <label className="flex items-center justify-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={selected.length === files.length && files.length > 0}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => toggleAll(e.target.checked)}
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
                        <span>Name</span>
                        <span>Uploaded</span>
                        <span>Duration</span>
                    </div>

                    {/* Lista */}
                    {filteredFiles.length > 0 ? (
                        filteredFiles.map((file) => (
                            <div
                                key={file.id}
                                onClick={() => router.push(`/dashboard/transcriptions/${file.id}`)}
                                className="grid grid-cols-[40px_2fr_1fr_1fr] gap-4 items-center border-b border-white/5 py-3 text-sm hover:bg-white/5 hover:cursor-pointer"
                            >
                                {/* Checkbox */}
                                <label
                                    className="flex items-center justify-center cursor-pointer"
                                    onClick={(e) => e.stopPropagation()}
                                >
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
                                <span className="text-zinc-300">{formatDate(file.createdAt)}</span>

                                {/* Duration */}
                                <span className="text-zinc-300">{formatDuration(file.duration)}</span>
                            </div>
                        ))
                    ) : (
                        <div className="grid grid-cols-[40px_2fr_1fr_1fr] py-12">
                            <p className="col-span-4 text-center text-sm text-zinc-400">
                                No files found.
                            </p>
                        </div>
                    )}

                    {/* Pagination controls */}
                    {totalPages && (
                        <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-3">
                            {/* Left side: page info */}
                            <div className="text-sm text-zinc-400">
                                Showing{" "}
                                <span className="text-zinc-200 font-medium">
                                    {Math.min((page - 1) * limit + 1, total)}-
                                    {Math.min(page * limit, total)}
                                </span>{" "}
                                of <span className="text-zinc-200 font-medium">{total}</span> files
                            </div>

                            {/* Center: pagination buttons */}
                            <div className="flex items-center gap-2">
                                <button
                                    disabled={page === 1}
                                    onClick={() => setPage(1)}
                                    className="px-2 py-1 rounded bg-white/5 text-zinc-300 hover:bg-white/10 disabled:opacity-40"
                                >
                                    « First
                                </button>
                                <button
                                    disabled={page === 1}
                                    onClick={() => setPage(page - 1)}
                                    className="px-3 py-1 rounded bg-white/10 text-zinc-200 hover:bg-white/20 disabled:opacity-40"
                                >
                                    Previous
                                </button>

                                {/* Page numbers */}
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                                        .filter(
                                            (p) =>
                                                p === 1 ||
                                                p === totalPages ||
                                                (p >= page - 1 && p <= page + 1)
                                        )
                                        .map((p, i, arr) => (
                                            <React.Fragment key={p}>
                                                <button
                                                    onClick={() => setPage(p)}
                                                    className={`px-3 py-1 rounded text-sm transition-colors ${page === p
                                                        ? "bg-blue-500/30 text-blue-200 border border-blue-400/30"
                                                        : "bg-white/5 text-zinc-300 hover:bg-white/10"
                                                        }`}
                                                >
                                                    {p}
                                                </button>
                                                {arr[i + 1] && arr[i + 1] - p > 1 && (
                                                    <span className="text-zinc-500">...</span>
                                                )}
                                            </React.Fragment>
                                        ))}
                                </div>

                                <button
                                    disabled={page === totalPages}
                                    onClick={() => setPage(page + 1)}
                                    className="px-3 py-1 rounded bg-white/10 text-zinc-200 hover:bg-white/20 disabled:opacity-40"
                                >
                                    Next
                                </button>
                                <button
                                    disabled={page === totalPages}
                                    onClick={() => setPage(totalPages)}
                                    className="px-2 py-1 rounded bg-white/5 text-zinc-300 hover:bg-white/10 disabled:opacity-40"
                                >
                                    Last »
                                </button>
                            </div>

                            {/* Right side: limit selector */}
                            <div className="relative z-20 flex items-center gap-2">
                                <label htmlFor="limit" className="text-sm text-zinc-400 whitespace-nowrap">
                                    Rows per page:
                                </label>
                                <select
                                    id="limit"
                                    value={limit}
                                    onChange={(e) => {
                                        setLimit(Number(e.target.value));
                                        setPage(1);
                                    }}
                                    className="px-2 py-1 rounded-md bg-zinc-800/80 text-zinc-200 border border-white/10 
                   focus:outline-none focus:ring-1 focus:ring-blue-500 
                   backdrop-blur supports-[backdrop-filter]:bg-zinc-800/70"
                                    style={{
                                        position: "relative",
                                        zIndex: 50,
                                    }}
                                >
                                    {[10, 20, 50].map((opt) => (
                                        <option key={opt} value={opt} className="bg-zinc-800 text-zinc-200">
                                            {opt}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                </CardContent>
            </Card>


            {/* Banner flotante con eliminar */}
            {selected.length > 0 && (
                <div className="fixed bottom-4 left-0 right-0 flex justify-center px-4">
                    <div className="flex w-full max-w-sm items-center justify-between rounded-xl border border-white/10 bg-zinc-900 px-4 py-2">
                        <p className="text-sm text-zinc-200">
                            Selected files: {selected.length}
                        </p>
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
                    <div
                        className="absolute inset-0 bg-black/60"
                        onClick={() => setShowConfirm(false)}
                    />
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
