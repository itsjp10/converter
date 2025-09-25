// src/app/api/transcriptions/[id]/route.js

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req, { params }) {
    const { id } = await params;
    try {
        const transcriptions = await prisma.transcription.findMany({
            where: {
                userId: id,
            },
            orderBy: { createdAt: "desc" }
        })
        return NextResponse.json(transcriptions);
    } catch (error) {
        return NextResponse.json({ error: "Error fetching transcriptions" }, { status: 500 })
    }

}