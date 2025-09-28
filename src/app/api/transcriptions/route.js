// src/app/api/transcriptions/delete/route.js

import { NextResponse } from "next/server"
import { prisma } from '@/lib/prisma'


export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return NextResponse.json({ error: "userId is required" }, { status: 500 })
        }

        const transcriptions = await prisma.transcription.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" }
        })
        return NextResponse.json(transcriptions);
    } catch (error) {
        console.log(error)
        return NextResponse.json({ error: "Error getting transcriptions for an user" }, { status: 500 })
    }
}

export async function DELETE(req) {
    try {
        const { ids } = await req.json()
        console.log("this is ids to delete", ids)
        const transcriptions = await prisma.transcription.deleteMany({
            where: {
                id: {
                    in: ids
                }
            }
        })
        return NextResponse.json(transcriptions);
    } catch (error) {
        return NextResponse.json({ error: "Error deleting transcriptions" }, { status: 500 })
    }
}