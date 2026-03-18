import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// POST /api/v1/upload/resume — parse resume text and update portfolio + memories
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { content } = await req.json();
  if (!content || typeof content !== "string" || content.length < 20) {
    return NextResponse.json({ error: "Resume content too short" }, { status: 400 });
  }

  try {
    // Use GPT to extract structured data from resume
    const extraction = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a resume parser. Extract structured data from the resume text. 
Return valid JSON with these fields:
{
  "skills": ["skill1", "skill2"],  
  "experience": [{"title": "Job Title", "company": "Company", "dates": "Start-End", "description": "Brief desc"}],
  "education": [{"school": "School Name", "degree": "Degree", "dates": "Start-End", "gpa": "3.5 or null"}],
  "projects": [{"name": "Project Name", "description": "Brief desc", "tech": ["tech1", "tech2"]}],
  "matchTags": ["tag1", "tag2"]  // lowercase tags for opportunity matching based on skills and interests
}
Only return the JSON object, no other text.`,
        },
        { role: "user", content },
      ],
      temperature: 0,
    });

    const parsed = JSON.parse(extraction.choices[0].message.content || "{}");

    // Upsert portfolio
    await prisma.studentPortfolio.upsert({
      where: { userId: session.user.id },
      update: {
        resumeRaw: content,
        resumeSkills: parsed.skills || [],
        resumeExperience: parsed.experience || null,
        resumeEducation: parsed.education || null,
        resumeProjects: parsed.projects || null,
        matchTags: { push: parsed.matchTags || [] },
      },
      create: {
        userId: session.user.id,
        resumeRaw: content,
        resumeSkills: parsed.skills || [],
        resumeExperience: parsed.experience || null,
        resumeEducation: parsed.education || null,
        resumeProjects: parsed.projects || null,
        matchTags: parsed.matchTags || [],
      },
    });

    // Also save to user memory for the chat engine
    const memoryEntries = [
      { key: "skills", value: (parsed.skills || []).join(", ") },
      { key: "resume_uploaded", value: "yes" },
    ];
    if (parsed.experience?.length > 0) {
      memoryEntries.push({
        key: "experience",
        value: parsed.experience.map((e: { title: string; company: string }) => `${e.title} at ${e.company}`).join("; "),
      });
    }

    for (const mem of memoryEntries) {
      if (mem.value) {
        await prisma.userMemory.upsert({
          where: { userId_key: { userId: session.user.id, key: mem.key } },
          update: { value: mem.value, source: "portfolio" },
          create: { userId: session.user.id, key: mem.key, value: mem.value, source: "portfolio" },
        });
      }
    }

    return NextResponse.json({
      message: `Resume processed! Found ${parsed.skills?.length || 0} skills, ${parsed.experience?.length || 0} experiences, ${parsed.projects?.length || 0} projects.`,
      extracted: {
        skillCount: parsed.skills?.length || 0,
        experienceCount: parsed.experience?.length || 0,
        projectCount: parsed.projects?.length || 0,
      },
    });
  } catch (error) {
    console.error("Resume upload error:", error);
    return NextResponse.json({ error: "Failed to process resume" }, { status: 500 });
  }
}
