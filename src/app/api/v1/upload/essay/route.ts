import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// POST /api/v1/upload/essay — parse personal essay and update portfolio + memories
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { content } = await req.json();
  if (!content || typeof content !== "string" || content.length < 20) {
    return NextResponse.json({ error: "Essay content too short" }, { status: 400 });
  }

  try {
    const extraction = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a personal essay analyzer. Extract the student's goals, interests, strengths, and personality from their essay.
Return valid JSON:
{
  "careerGoals": ["goal1", "goal2"],
  "interests": ["interest1", "interest2"],
  "strengths": ["strength1", "strength2"],
  "personalityTraits": ["trait1", "trait2"],
  "matchTags": ["tag1", "tag2"]
}
Only return the JSON object.`,
        },
        { role: "user", content },
      ],
      temperature: 0,
    });

    const parsed = JSON.parse(extraction.choices[0].message.content || "{}");

    await prisma.studentPortfolio.upsert({
      where: { userId: session.user.id },
      update: {
        essayRaw: content,
        careerGoals: parsed.careerGoals || [],
        interests: parsed.interests || [],
        strengths: parsed.strengths || [],
        personalityTraits: parsed.personalityTraits || [],
        matchTags: { push: parsed.matchTags || [] },
      },
      create: {
        userId: session.user.id,
        essayRaw: content,
        careerGoals: parsed.careerGoals || [],
        interests: parsed.interests || [],
        strengths: parsed.strengths || [],
        personalityTraits: parsed.personalityTraits || [],
        matchTags: parsed.matchTags || [],
      },
    });

    // Save to memory
    const memoryEntries: { key: string; value: string }[] = [];
    if (parsed.careerGoals?.length) memoryEntries.push({ key: "career_interest", value: parsed.careerGoals.join(", ") });
    if (parsed.interests?.length) memoryEntries.push({ key: "interests", value: parsed.interests.join(", ") });

    for (const mem of memoryEntries) {
      await prisma.userMemory.upsert({
        where: { userId_key: { userId: session.user.id, key: mem.key } },
        update: { value: mem.value, source: "portfolio" },
        create: { userId: session.user.id, key: mem.key, value: mem.value, source: "portfolio" },
      });
    }

    return NextResponse.json({
      message: `Essay processed! Found ${parsed.careerGoals?.length || 0} career goals, ${parsed.interests?.length || 0} interests, ${parsed.strengths?.length || 0} strengths.`,
      extracted: {
        goalCount: parsed.careerGoals?.length || 0,
        interestCount: parsed.interests?.length || 0,
        strengthCount: parsed.strengths?.length || 0,
      },
    });
  } catch (error) {
    console.error("Essay upload error:", error);
    return NextResponse.json({ error: "Failed to process essay" }, { status: 500 });
  }
}
