import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// POST /api/v1/upload/transcript — parse transcript and update portfolio + memories
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { content } = await req.json();
  if (!content || typeof content !== "string" || content.length < 10) {
    return NextResponse.json({ error: "Transcript content too short" }, { status: 400 });
  }

  try {
    const extraction = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a transcript parser. Extract structured data from the academic transcript.
Return valid JSON:
{
  "courses": [{"code": "CS 201", "name": "Data Structures", "grade": "A", "semester": "Fall 2025", "credits": 3}],
  "cumulativeGPA": 3.75,
  "majorGPA": 3.85,
  "creditsCompleted": 60,
  "creditsRemaining": 60,
  "major": "Computer Science",
  "matchTags": ["tag1", "tag2"]
}
If any field cannot be determined from the text, use null. Only return the JSON object.`,
        },
        { role: "user", content },
      ],
      temperature: 0,
    });

    const parsed = JSON.parse(extraction.choices[0].message.content || "{}");

    await prisma.studentPortfolio.upsert({
      where: { userId: session.user.id },
      update: {
        transcriptRaw: content,
        courseHistory: parsed.courses || null,
        cumulativeGPA: parsed.cumulativeGPA || null,
        majorGPA: parsed.majorGPA || null,
        creditsCompleted: parsed.creditsCompleted || null,
        creditsRemaining: parsed.creditsRemaining || null,
        matchTags: { push: parsed.matchTags || [] },
      },
      create: {
        userId: session.user.id,
        transcriptRaw: content,
        courseHistory: parsed.courses || null,
        cumulativeGPA: parsed.cumulativeGPA || null,
        majorGPA: parsed.majorGPA || null,
        creditsCompleted: parsed.creditsCompleted || null,
        creditsRemaining: parsed.creditsRemaining || null,
        matchTags: parsed.matchTags || [],
      },
    });

    // Save key data to user memory
    const memoryEntries: { key: string; value: string }[] = [];
    if (parsed.cumulativeGPA) memoryEntries.push({ key: "gpa", value: String(parsed.cumulativeGPA) });
    if (parsed.major) memoryEntries.push({ key: "major", value: parsed.major });
    if (parsed.creditsCompleted) memoryEntries.push({ key: "credits_completed", value: String(parsed.creditsCompleted) });
    if (parsed.courses?.length) {
      memoryEntries.push({
        key: "courses_taken",
        value: parsed.courses.map((c: { code: string; name: string }) => `${c.code} ${c.name}`).join(", "),
      });
    }

    for (const mem of memoryEntries) {
      await prisma.userMemory.upsert({
        where: { userId_key: { userId: session.user.id, key: mem.key } },
        update: { value: mem.value, source: "portfolio" },
        create: { userId: session.user.id, key: mem.key, value: mem.value, source: "portfolio" },
      });
    }

    return NextResponse.json({
      message: `Transcript processed! Found ${parsed.courses?.length || 0} courses, GPA: ${parsed.cumulativeGPA || "N/A"}.`,
      extracted: {
        courseCount: parsed.courses?.length || 0,
        gpa: parsed.cumulativeGPA,
        creditsCompleted: parsed.creditsCompleted,
      },
    });
  } catch (error) {
    console.error("Transcript upload error:", error);
    return NextResponse.json({ error: "Failed to process transcript" }, { status: 500 });
  }
}
