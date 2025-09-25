
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req, { params }) {
    const { userId } = await params;
    try {
        const transcriptions = await prisma.transcription.findMany({
            where: {
                userId: "cmfr5cy8s0002vkj8jgvsbqdj",
            },
            orderBy: { createdAt: "desc" }
        })
        return NextResponse.json(transcriptions);
    } catch (error) {
        return NextResponse.json({ error: "Error fetching transcriptions" }, { status: 500 })
    }

}