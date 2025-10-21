import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";
import { getPackageById } from "@/config/balance-packages";

const WOMPI_PRIVATE_KEY = process.env.WOMPI_PRIVATE_KEY;
const WOMPI_API_URL = process.env.WOMPI_API_URL ?? "https://sandbox.wompi.co/v1";

function parsePackageId(reference) {
    if (!reference) return null;
    const parts = reference.split("_");
    if (parts.length < 3 || parts[0] !== "minutes") return null;
    return parts[1];
}

export async function GET(req) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!WOMPI_PRIVATE_KEY) {
        return NextResponse.json({ error: "Wompi private key not configured" }, { status: 500 });
    }

    const url = new URL(req.url);
    const transactionId = url.searchParams.get("transactionId") || url.searchParams.get("id");

    if (!transactionId) {
        return NextResponse.json({ error: "transactionId query param is required" }, { status: 400 });
    }

    try {
        const wompiResponse = await fetch(`${WOMPI_API_URL}/transactions/${transactionId}`, {
            headers: {
                Authorization: `Bearer ${WOMPI_PRIVATE_KEY}`,
            },
            cache: "no-store",
        });

        if (!wompiResponse.ok) {
            const details = await wompiResponse.text().catch(() => "");
            return NextResponse.json(
                { error: "Failed to retrieve transaction from Wompi", details },
                { status: wompiResponse.status },
            );
        }

        const payload = await wompiResponse.json();
        const data = payload?.data;

        if (!data) {
            return NextResponse.json({ error: "Invalid Wompi response" }, { status: 502 });
        }

        const packageId = parsePackageId(data.reference);
        const selectedPackage = packageId ? getPackageById(packageId) : null;

        if (!selectedPackage) {
            return NextResponse.json({ error: "Unknown package reference" }, { status: 400 });
        }

        if (Number(data.amount_in_cents) !== selectedPackage.amountInCents) {
            return NextResponse.json({ error: "Amount mismatch. Contact support." }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: { id: true, credits: true },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const existingPayment = await prisma.paymentTransaction.findUnique({
            where: { transactionId },
            select: { status: true },
        });

        const previousStatus = existingPayment?.status?.toUpperCase() ?? null;
        const status = data.status?.toUpperCase() ?? "PENDING";
        const minutesToAdd = status === "APPROVED" ? selectedPackage.minutes : 0;

        await prisma.paymentTransaction.upsert({
            where: { transactionId },
            update: {
                reference: data.reference,
                minutes: selectedPackage.minutes,
                amountInCents: selectedPackage.amountInCents,
                status,
                userId: user.id,
            },
            create: {
                transactionId,
                reference: data.reference,
                minutes: selectedPackage.minutes,
                amountInCents: selectedPackage.amountInCents,
                status,
                user: {
                    connect: { id: user.id },
                },
            },
        });

        let updatedCredits = user.credits;

        if (status === "APPROVED" && previousStatus !== "APPROVED") {
            const updatedUser = await prisma.user.update({
                where: { id: user.id },
                data: { credits: user.credits + minutesToAdd },
            });
            updatedCredits = updatedUser.credits;
        }

        return NextResponse.json({
            status,
            minutes: status === "APPROVED" ? selectedPackage.minutes : undefined,
            amountInCents: selectedPackage.amountInCents,
            transactionId,
            credits: updatedCredits,
            message:
                status === "APPROVED"
                    ? previousStatus === "APPROVED"
                        ? "This payment was already processed."
                        : "Balance updated successfully."
                    : "We will update your balance once the payment is confirmed.",
        });
    } catch (error) {
        console.error("Wompi verification error", error);
        return NextResponse.json(
            { error: "Unable to verify payment", details: error.message ?? "Unknown error" },
            { status: 500 },
        );
    }
}
