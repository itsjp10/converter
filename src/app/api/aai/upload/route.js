// app/api/aai/upload/route.js
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!file) {
      return new Response(JSON.stringify({ error: "No file provided" }), { status: 400 });
    }

    const apiKey = process.env.ASSEMBLYAI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Missing ASSEMBLYAI_API_KEY on server" }), { status: 500 });
    }

    // Body = stream si existe; si no, Buffer
    let body;
    let useStream = false;
    try {
      if (typeof file.stream === "function") {
        body = file.stream();
        useStream = true;
      } else {
        body = Buffer.from(await file.arrayBuffer());
      }
    } catch {
      body = Buffer.from(await file.arrayBuffer());
    }

    // Opciones fetch: agrega duplex: 'half' SOLO si es stream
    const fetchOpts = {
      method: "POST",
      headers: {
        authorization: apiKey,
        "content-type": "application/octet-stream",
      },
      body,
      // @ts-ignore - Node/undici necesita esto cuando body es ReadableStream
      ...(useStream ? { duplex: "half" } : {}),
    };

    const res = await fetch("https://api.assemblyai.com/v2/upload", fetchOpts);

    const text = await res.text();
    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: "AAI upload failed", status: res.status, details: text }),
        { status: 502 }
      );
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON from AAI upload", raw: text }), { status: 502 });
    }

    if (!data.upload_url) {
      return new Response(JSON.stringify({ error: "No upload_url from AAI", raw: data }), { status: 502 });
    }

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (e) {
    console.error("Upload route error:", e);
    return new Response(JSON.stringify({ error: e.message || "Internal error" }), { status: 500 });
  }
}
