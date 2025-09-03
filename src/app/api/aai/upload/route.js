// app/api/aai/upload/route.js
export const runtime = "nodejs";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    if (!file) {
      return new Response(JSON.stringify({ error: "No file provided" }), { status: 400 });
    }

    const buf = Buffer.from(await file.arrayBuffer());

    const res = await fetch("https://api.assemblyai.com/v2/upload", {
      method: "POST",
      headers: {
        authorization: process.env.ASSEMBLYAI_API_KEY,
        "content-type": "application/octet-stream",
      },
      body: buf,
    });

    if (!res.ok) {
      const err = await res.text();
      return new Response(JSON.stringify({ error: `Upload failed: ${err}` }), { status: 500 });
    }

    const data = await res.json(); // { upload_url: "..." }
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
