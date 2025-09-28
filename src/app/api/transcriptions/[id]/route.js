// src/app/api/transcriptions/[id]/route.js

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req, { params }) {
    const { id } = await params;
    try {
        const transcription = await prisma.transcription.findUnique({
            where: { id }
        })
        if (!transcription) {
            return NextResponse.json({ error: "Transcription not found" }, { status: 404 });
        }
        return NextResponse.json(transcription);
    } catch (error) {
        return NextResponse.json({ error: "Error fetching transcription" }, { status: 500 })
    }
}

export async function DELETE(req, { params }) {
    const { id } = await params;
    try {
        const transcription = await prisma.transcription.delete({
            where: { id }
        })
        return NextResponse.json(transcription);
    } catch (error) {
        return NextResponse.json({ error: "Error deleting transcription" }, { status: 500 })
    }
}