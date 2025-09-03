// app/api/aai/transcribe/route.js
import { AssemblyAI } from "assemblyai";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const { upload_url, language = "auto" } = await req.json();
    if (!upload_url) {
      return new Response(JSON.stringify({ error: "upload_url is required" }), { status: 400 });
    }

    const client = new AssemblyAI({
      apiKey: process.env.ASSEMBLYAI_API_KEY,
    });

    // Si usas autodetección, evita setear language_code explícito.
    const params =
      language && language !== "auto"
        ? { audio_url: upload_url, speech_model: "universal", language_code: language }
        : { audio_url: upload_url, speech_model: "universal" };

    const transcript = await client.transcripts.transcribe(params);
    // transcript = { id, status, text, ... }

    return new Response(
      JSON.stringify({ id: transcript.id, status: transcript.status, text: transcript.text }),
      { status: 200 }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
