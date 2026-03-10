import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/db";
import type { EntityType } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, role } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, and name are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const validRoles = ["person", "business"];
    const userRole = validRoles.includes(role) ? role : "person";
    // Map user role to entity type (person → person, business → business)
    const entityType = userRole as EntityType;

    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    const passwordHash = await hash(password, 12);

    // Create user + profile in a transaction
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role: userRole,
        profiles: {
          create: {
            type: entityType,
            displayName: name,
            location: "Tuscaloosa, AL",
          },
        },
        messageSettings: {
          create: {},
        },
      },
      include: { profiles: true },
    });

    return NextResponse.json(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        profileId: user.profiles[0]?.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
