// src/app/api/transcriptions/[id]/route.js

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'

export async function GET(req, { params }) {
    const { userId } = await auth() //id from clerk
    const { id } = await params; //transctiption id from query params

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const user = await prisma.user.findUnique({ //user from db
            where: {
                clerkId: userId
            }
        })
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

        try {
            const transcription = await prisma.transcription.findUnique({
                where: { id }
            })
            if (!transcription) {
                return NextResponse.json({ error: "Transcription not found" }, { status: 404 });
            }
            if (transcription.userId !== user.id) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
            }
            return NextResponse.json(transcription);
        } catch (error) {
            return NextResponse.json({ error: "Error fetching transcription" }, { status: 500 })
        }

    } catch (error) {
        return NextResponse.json({ error: "Error fetching user" }, { status: 500 })
    }
}

export async function DELETE(req, { params }) {
    const { userId } = await auth() //id from clerk
    const { id } = await params; //transctiption id from query params

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const user = await prisma.user.findUnique({ //user from db
            where: {
                clerkId: userId
            }
        })
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

        try {
            const transcription = await prisma.transcription.delete({
                where: { id }
            })
            if (!transcription) {
                return NextResponse.json({ error: "Transcription to delete not found" }, { status: 404 });
            }
            if (transcription.userId !== user.id) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
            }
            return NextResponse.json(transcription);
        } catch (error) {

        }
    } catch (error) {
        return NextResponse.json({ error: "Error deleting transcription" }, { status: 500 })
    }
}