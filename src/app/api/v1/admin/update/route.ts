import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// POST /api/v1/admin/update — natural language data update
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const { prompt } = await req.json();
  if (!prompt || typeof prompt !== "string") {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
  }

  try {
    // Get existing profiles for context
    const profiles = await prisma.profile.findMany({
      select: { id: true, displayName: true, type: true, department: true, opportunityType: true },
      take: 50,
    });

    const profileList = profiles.map((p) => `${p.displayName} (${p.type}, ID: ${p.id})`).join("\n");

    // Use GPT to determine the action
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a university data management assistant. The admin wants to update platform data.

Existing entities:
${profileList}

Based on the admin's request, determine the action and return valid JSON:
{
  "action": "create_profile" | "update_profile" | "create_info_section" | "update_info_section",
  "data": {
    // For create_profile: { type, displayName, bio, department, category, campusRole, opportunityType, tags, eligibility, compensation, deadline, applyUrl }
    // For update_profile: { id, ...fields to update }
    // For create_info_section: { profileId, section, subsection, title, data }
    // For update_info_section: { profileId, section, subsection, data }
  },
  "summary": "Human-readable summary of what was done"
}
Only return the JSON object.`,
        },
        { role: "user", content: prompt },
      ],
      temperature: 0,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");

    // Execute the action
    switch (result.action) {
      case "create_profile": {
        const d = result.data;
        // Use admin's user ID as owner
        await prisma.profile.create({
          data: {
            userId: session.user.id,
            type: d.type || "opportunity",
            displayName: d.displayName || "New Entity",
            bio: d.bio,
            department: d.department,
            category: d.category,
            campusRole: d.campusRole,
            opportunityType: d.opportunityType,
            tags: d.tags || [],
            eligibility: d.eligibility,
            compensation: d.compensation,
            deadline: d.deadline ? new Date(d.deadline) : undefined,
            applyUrl: d.applyUrl,
          },
        });
        break;
      }
      case "update_profile": {
        const { id, ...fields } = result.data;
        if (id) {
          if (fields.deadline) fields.deadline = new Date(fields.deadline);
          await prisma.profile.update({ where: { id }, data: fields });
        }
        break;
      }
      case "create_info_section": {
        const d = result.data;
        if (d.profileId) {
          await prisma.infoSection.create({
            data: {
              profileId: d.profileId,
              section: d.section || "info",
              subsection: d.subsection,
              title: d.title,
              data: d.data || {},
            },
          });
        }
        break;
      }
      case "update_info_section": {
        const d = result.data;
        if (d.profileId && d.section) {
          await prisma.infoSection.upsert({
            where: {
              profileId_section_subsection: {
                profileId: d.profileId,
                section: d.section,
                subsection: d.subsection || null,
              },
            },
            update: { data: d.data, title: d.title },
            create: {
              profileId: d.profileId,
              section: d.section,
              subsection: d.subsection,
              title: d.title,
              data: d.data || {},
            },
          });
        }
        break;
      }
      default:
        return NextResponse.json({ message: `Unrecognized action: ${result.action}. ${result.summary}` });
    }

    return NextResponse.json({ message: result.summary || "Update completed." });
  } catch (error) {
    console.error("Admin update error:", error);
    return NextResponse.json({ error: "Failed to process update" }, { status: 500 });
  }
}
