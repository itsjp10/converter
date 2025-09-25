// src/app/api/user/route.js

import { NextResponse } from 'next/server'
import {prisma} from '@/lib/prisma'
import { auth } from "@clerk/nextjs/server";

export async function GET() {
    try {
        const { userId: clerkId } = await auth(); // Clerk userId (ClerkID)

        if (!clerkId) { //checking if user is logged in
            console.log("No user ID found");
            return new Response("Unauthorized", { status: 401 });
        }

        const user = await prisma.user.findUnique({ //finding user if logged in db 
            where: { clerkId: clerkId },
        });
        if (!user) {
            console.log("User not found in DB");
            return new Response("User not found", { status: 404 });
        }
        console.log("User found:", user);
        return NextResponse.json({ user });
    } catch (err) {
        console.log(err);
        return new Response("Server error", {status: 500})

    }

}