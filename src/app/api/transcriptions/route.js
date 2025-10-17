// src/app/api/transcriptions/delete/route.js

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");
        const page = parseInt(searchParams.get("page") || "1", 10);
        const limit = parseInt(searchParams.get("limit") || "10", 10);
        const skip = (page - 1) * limit;

        if (!userId) {
            return NextResponse.json({ error: "userId is required" }, { status: 400 });
        }

        const [total, transcriptions, aggregates, languageStats] = await Promise.all([
            prisma.transcription.count({
                where: { userId },
            }),
            prisma.transcription.findMany({
                where: { userId },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            prisma.transcription.aggregate({
                where: { userId },
                _sum: { duration: true },
                _avg: { duration: true },
                _max: { duration: true, createdAt: true },
            }),
            prisma.transcription.groupBy({
                where: { userId },
                by: ["language"],
                _count: { language: true },
                _sum: { duration: true },
                orderBy: { _count: { language: "desc" } },
            }),
        ]);

        const totalDuration = aggregates._sum?.duration || 0;
        const averageDuration = aggregates._avg?.duration ? Number(aggregates._avg.duration) : 0;
        const longestDuration = aggregates._max?.duration || 0;
        const latestCreatedAt = aggregates._max?.createdAt || null;

        const languages = languageStats.map((item) => ({
            language: item.language,
            count: item._count.language,
            totalDuration: item._sum?.duration || 0,
        }));

        return NextResponse.json({
            transcriptions,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            stats: {
                totalDuration,
                averageDuration,
                longestDuration,
                latestCreatedAt: latestCreatedAt ? latestCreatedAt.toISOString() : null,
                languageCount: languages.length,
                languages,
            },
        });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Error getting transcriptions for a user" }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        const { ids } = await req.json();
        console.log("this is ids to delete", ids);
        const transcriptions = await prisma.transcription.deleteMany({
            where: {
                id: {
                    in: ids
                }
            }
        });
        return NextResponse.json(transcriptions);
    } catch (error) {
        return NextResponse.json({ error: "Error deleting transcriptions" }, { status: 500 });
    }
}
