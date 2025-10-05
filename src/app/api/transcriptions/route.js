// src/app/api/transcriptions/delete/route.js

import { NextResponse } from "next/server"
import { prisma } from '@/lib/prisma'


export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");
        // Pagination parameters v1
        const page = parseInt(searchParams.get("page") || "1", 10);
        const limit = parseInt(searchParams.get("limit") || "10", 10);
        const skip = (page - 1) * limit;

        if (!userId) {
            return NextResponse.json({ error: "userId is required" }, { status: 500 })
        }

        // Get total count for pagination info
        const total = await prisma.transcription.count({
            where: { userId }
        });

        const transcriptions = await prisma.transcription.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit
        });

        return NextResponse.json({
            transcriptions,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        });
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