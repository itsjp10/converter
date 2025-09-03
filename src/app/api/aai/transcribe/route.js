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

    // --- Selección de modelo según idioma ---
    let speech_model = "universal";
    let params;

    if (language === "auto") {
      // Auto-detección → universal (multilingüe)
      speech_model = "universal";
      params = { audio_url: upload_url, speech_model };
    } else if (language === "en" && fast) {
      // Inglés + rápido → nano
      speech_model = "nano";
      params = { audio_url: upload_url, speech_model, language_code: "en" };
    } else {
      // Cualquier idioma específico (incl. 'en' sin fast) → universal con language_code
      speech_model = "universal";
      params = { audio_url: upload_url, speech_model, language_code: language };
    }

    const created = await client.transcripts.create(params);
    if (!created?.id) {
      return new Response(JSON.stringify({ error: "AAI create failed", raw: created }), { status: 502 });
    }

    return new Response(JSON.stringify({ id: created.id, status: created.status, speech_model, language }), { status: 200 });
  } catch (e) {
    console.error("Transcribe route error:", e);
    return new Response(JSON.stringify({ error: e.message || "Internal error" }), { status: 500 });
  }
}
