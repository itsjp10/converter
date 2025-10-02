// src/app/api/user/updateBalance/route.js
import { prisma } from "@/lib/prisma";
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from "next/server";

export async function POST(req) {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    try {
        const user = await prisma.user.findUnique({
            where: {
                clerkId: userId
            },
            select: {
                id: true,
                credits: true
            }
        })
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

        const body = await req.json(); //making the request

        const { duration } = body;

        const newBalance = user.credits - Math.floor(duration / 60);

        console.log("this is newBalance", newBalance)

        if (newBalance < 0) return NextResponse.json({error: "Insufficient balance"}, {status: 400})

        const updatedBalance = await prisma.user.update({
            where: {
                id: userId
            },
            data: {
                credits: newBalance
            }
        })
        return NextResponse.json(updatedBalance)

    } catch (error) {
        return NextResponse.json({error: "Server internal error"}, {status: 500})
    }
}