'use client'
// src/app/dashboard/transcriptions/page.jsx
import { useEffect, useState } from "react";


export default function TranscriptionsPage() {
    const [user, setUser] = useState(null);

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

    if (!user) return <p>Loading...</p>;

    return (
    <div>
      <h1>Dashboard - Transcriptions</h1>
      <p>User ID: {user.id}</p>
      <p>Clerk ID: {user.clerkId}</p>
    </div>
  );
}