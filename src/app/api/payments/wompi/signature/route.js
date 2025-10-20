import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import crypto from "crypto";

const WOMPI_INTEGRITY_SECRET = process.env.WOMPI_INTEGRITY_SECRET;

export async function POST(req) {
    if (!WOMPI_INTEGRITY_SECRET) {
        return NextResponse.json({ error: "Integrity secret not configured" }, { status: 500 });
    }

    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let payload;
    try {
        payload = await req.json();
    } catch (error) {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { reference, amountInCents, currency } = payload ?? {};

    if (
        typeof reference !== "string" ||
        !reference ||
        typeof amountInCents !== "number" ||
        Number.isNaN(amountInCents) ||
        typeof currency !== "string" ||
        !currency
    ) {
        return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const signature = crypto
        .createHash("sha256")
        .update(`${reference}${amountInCents}${currency}${WOMPI_INTEGRITY_SECRET}`)
        .digest("hex");

    return NextResponse.json({ signature });
}
