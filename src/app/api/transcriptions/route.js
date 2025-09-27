// src/app/api/transcriptions/delete/route.js

import { NextResponse } from "next/server"
import { prisma } from '@/lib/prisma'


export async function DELETE(req) {

    try {
        const { ids } = await req.json()
        console.log("this is ids to delete",ids)
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