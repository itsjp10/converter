// app/api/aai/transcribe/route.js
import { AssemblyAI } from "assemblyai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const { upload_url, language = "auto", fast = true } = await req.json();

    if (!upload_url) {
      return new Response(JSON.stringify({ error: "upload_url is required" }), { status: 400 });
    }

    const apiKey = process.env.ASSEMBLYAI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Missing ASSEMBLYAI_API_KEY on server" }), { status: 500 });
    }

    const client = new AssemblyAI({ apiKey });
    const params =
      language && language !== "auto"
        ? { audio_url: upload_url, speech_model: fast ? "nano" : "universal", language_code: language }
        : { audio_url: upload_url, speech_model: fast ? "nano" : "universal" };

    const created = await client.transcripts.create(params);
    if (!created?.id) {
      return new Response(JSON.stringify({ error: "AAI create failed", raw: created }), { status: 502 });
    }

    return new Response(JSON.stringify({ id: created.id, status: created.status }), { status: 200 });
  } catch (e) {
    console.error("Transcribe route error:", e);
    return new Response(JSON.stringify({ error: e.message || "Internal error" }), { status: 500 });
  }
}
