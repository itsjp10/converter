import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { Document, HeadingLevel, Packer, Paragraph } from "docx";
import ExcelJS from "exceljs";

const CONTENT_TYPES = {
    txt: "text/plain; charset=utf-8",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

const sanitizeFilename = (title, extension) => {
    const safeTitle = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/gi, "-")
        .replace(/^-+|-+$/g, "") || "transcription";
    return `${safeTitle}.${extension}`;
};

const formatDuration = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    if (minutes === 0) {
        return `${String(seconds).padStart(2, "0")} sec`;
    }
    if (seconds === 0) {
        return `${String(minutes).padStart(2, "0")} min`;
    }
    return `${String(minutes).padStart(2, "0")} min ${String(seconds).padStart(2, "0")} sec`;
};

const toTxt = (transcription) => {
    const lines = [
        `Title: ${transcription.title}`,
        `Language: ${transcription.language}`,
        `Duration: ${formatDuration(transcription.duration)}`,
        `Created at: ${transcription.createdAt.toISOString()}`,
        "",
        transcription.content,
    ];
    return lines.join("\n");
};

const toDocx = async (transcription) => {
    const contentParagraphs = transcription.content
        .split(/\r?\n/)
        .map((line) => new Paragraph({ text: line || "", spacing: { after: 200 } }));

    const doc = new Document({
        sections: [
            {
                properties: {},
                children: [
                    new Paragraph({
                        text: transcription.title,
                        heading: HeadingLevel.HEADING_1,
                    }),
                    new Paragraph({
                        text: `Language: ${transcription.language}`,
                    }),
                    new Paragraph({
                        text: `Duration: ${formatDuration(transcription.duration)}`,
                    }),
                    new Paragraph({
                        text: `Created at: ${transcription.createdAt.toISOString()}`,
                    }),
                    new Paragraph({ text: "" }),
                    ...contentParagraphs,
                ],
            },
        ],
    });

    const buffer = await Packer.toBuffer(doc);
    return buffer;
};

const toXlsx = async (transcription) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Transcription");

    worksheet.columns = [
        { header: "Field", key: "field", width: 18 },
        { header: "Value", key: "value", width: 80 },
    ];

    worksheet.addRow({ field: "Title", value: transcription.title });
    worksheet.addRow({ field: "Language", value: transcription.language });
    worksheet.addRow({ field: "Duration", value: formatDuration(transcription.duration) });
    worksheet.addRow({ field: "Created at", value: transcription.createdAt.toISOString() });
    worksheet.addRow({ field: "", value: "" });
    worksheet.addRow({ field: "Content", value: transcription.content });

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(6).font = { bold: true };
    worksheet.getColumn("value").alignment = { wrapText: true, vertical: "top" };

    const arrayBuffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(arrayBuffer);
};

const createExportPayload = async (format, transcription) => {
    switch (format) {
        case "txt":
            return Buffer.from(toTxt(transcription), "utf-8");
        case "docx":
            return await toDocx(transcription);
        case "xlsx":
            return await toXlsx(transcription);
        default:
            return null;
    }
};

const getTranscriptionForUser = async (transcriptionId, clerkUserId) => {
    const user = await prisma.user.findUnique({
        where: { clerkId: clerkUserId },
    });
    if (!user) {
        return { error: NextResponse.json({ error: "User not found" }, { status: 404 }) };
    }

    const transcription = await prisma.transcription.findUnique({
        where: { id: transcriptionId },
    });
    if (!transcription) {
        return { error: NextResponse.json({ error: "Transcription not found" }, { status: 404 }) };
    }

    if (transcription.userId !== user.id) {
        return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
    }

    return { transcription };
};

export async function GET(req, { params }) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = new URL(req.url).searchParams;
    const format = searchParams.get("format")?.toLowerCase();
    if (!format || !Object.hasOwn(CONTENT_TYPES, format)) {
        return NextResponse.json({ error: "Invalid format" }, { status: 400 });
    }

    const { id } = await params;

    try {
        const { transcription, error } = await getTranscriptionForUser(id, userId);
        if (error) return error;

        const payload = await createExportPayload(format, transcription);
        if (!payload) {
            return NextResponse.json({ error: "Unsupported format" }, { status: 400 });
        }

        const filename = sanitizeFilename(transcription.title, format);
        return new NextResponse(payload, {
            headers: {
                "Content-Type": CONTENT_TYPES[format],
                "Content-Disposition": `attachment; filename="${filename}"`,
                "Content-Length": Buffer.byteLength(payload).toString(),
            },
        });
    } catch (err) {
        console.error("[Export transcription]", err);
        return NextResponse.json({ error: "Error exporting transcription" }, { status: 500 });
    }
}

