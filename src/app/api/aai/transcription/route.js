// app/api/aai/transcription/route.js
import { prisma } from '@/lib/prisma'
import { auth } from "@clerk/nextjs/server";

export async function POST(req) {
    try {
        const { userId: clerkId } = await auth(); // Clerk userId (ClerkID)

        if (!clerkId) {
            console.log("No user ID found");
            return new Response("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { content, title, duration, language } = body;

        const user = await prisma.user.findUnique({
            where: { clerkId: clerkId },
        });

        const newTranscription = await prisma.transcription.create({
            data: {
                content,
                title,
                duration,
                language,
                userId: user.id
            },
        });

        return Response.json(newTranscription);
    } catch (err) {
        console.log(err);
        return new Response("Server error", {status: 500})

    }

}