// app/api/aai/status/route.js
import { AssemblyAI } from "assemblyai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return new Response(JSON.stringify({ error: "id is required" }), { status: 400 });

    const apiKey = process.env.ASSEMBLYAI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Missing ASSEMBLYAI_API_KEY on server" }), { status: 500 });
    }

    const client = new AssemblyAI({ apiKey });
    const tr = await client.transcripts.get(id); // { status, text, error, ... }

    return new Response(JSON.stringify(tr), { status: 200 });
  } catch (e) {
    console.error("Status route error:", e);
    return new Response(JSON.stringify({ error: e.message || "Internal error" }), { status: 500 });
  }
}
