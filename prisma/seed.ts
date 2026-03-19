import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding AgentNet — Universal Entity Platform...\n");

  // Clean in dependency order
  await prisma.webhookLog.deleteMany();
  await prisma.claimRequest.deleteMany();
  await prisma.connectedAccount.deleteMany();
  await prisma.userMemory.deleteMany();
  await prisma.chatMessage.deleteMany();
  await prisma.chatSession.deleteMany();
  await prisma.actionLog.deleteMany();
  await prisma.quote.deleteMany();
  await prisma.serviceRequest.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.order.deleteMany();
  await prisma.infoSection.deleteMany();
  await prisma.businessEndpoint.deleteMany();
  await prisma.capability.deleteMany();
  await prisma.message.deleteMany();
  await prisma.apiKey.deleteMany();
  await prisma.messageSettings.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.service.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();
  console.log("  Cleared existing data\n");

  const pw = await hash("password123", 12);
  const shelbeyPw = await hash("Born2007!", 12);

  // =====================================================
  // STUDENT ACCOUNT — Shelbey (shelbeyousey@gmail.com)
  // =====================================================
  console.log("Creating student account...");
  const shelbey = await prisma.user.create({
    data: {
      email: "shelbeyousey@gmail.com",
      passwordHash: shelbeyPw,
      name: "Shelbey Ousey",
      role: "person",
      profiles: {
        create: {
          type: "person",
          displayName: "Shelbey Ousey",
          bio: "Computer Science student at UA. Interested in AI, full-stack development, and building products.",
          location: "Tuscaloosa, AL",
          status: "available",
          category: "student",
          campusRole: "student",
          department: "Computer Science",
          tags: ["cs", "ai", "developer", "student", "typescript", "nextjs"],
          skills: {
            create: [
              { name: "TypeScript", category: "Programming" },
              { name: "Next.js", category: "Programming" },
              { name: "AI / LLMs", category: "Technology" },
              { name: "Python", category: "Programming" },
              { name: "Full-Stack Development", category: "Programming" },
            ],
          },
          capabilities: { create: [{ type: "messaging" }] },
        },
      },
      messageSettings: { create: {} },
    },
  });
  console.log("  Shelbey Ousey (student) — " + shelbey.id);

  // =====================================================
  // ADMIN ACCOUNT — sbyousey@crimson.ua.edu
  // =====================================================
  console.log("Creating admin account...");
  const admin = await prisma.user.create({
    data: {
      email: "sbyousey@crimson.ua.edu",
      passwordHash: shelbeyPw,
      name: "Shelbey Ousey (Admin)",
      role: "admin",
      profiles: {
        create: {
          type: "person",
          displayName: "AgentNet Admin",
          bio: "University of Alabama platform administrator.",
          location: "Tuscaloosa, AL",
          status: "available",
          category: "staff",
          campusRole: "staff",
          department: "Information Technology",
          tags: ["admin", "ua", "platform"],
          capabilities: { create: [{ type: "messaging" }] },
        },
      },
      messageSettings: { create: {} },
    },
  });
  console.log("  Admin — " + admin.id);

  // =====================================================
  // Shelbey's student memories (demo data)
  // =====================================================
  console.log("Creating student memories...");
  const shelbeyMemories = [
    { key: "name", value: "Shelbey Ousey" },
    { key: "major", value: "Computer Science" },
    { key: "year", value: "Sophomore" },
    { key: "classification", value: "Undergraduate" },
    { key: "college", value: "College of Engineering" },
    { key: "gpa", value: "3.7" },
    { key: "student_id", value: "12345678" },
    { key: "email", value: "shelbeyousey@gmail.com" },
    { key: "hometown", value: "Alabama" },
    { key: "semester", value: "Fall 2026" },
    { key: "courses_taken", value: "CS 100, CS 101, CS 200, CS 201, MATH 125, MATH 126, MATH 227, MATH 301, PH 101, PH 102, EN 101, EN 102" },
    { key: "courses_planned", value: "CS 301, CS 302, CS 403, CS 360, CS 457" },
    { key: "interests", value: "artificial intelligence, machine learning, web development, startups" },
    { key: "career_interest", value: "software engineering, AI research, tech startups" },
    { key: "track", value: "Software Engineering" },
    { key: "advisor", value: "Dr. Karen Wells" },
    { key: "credits_completed", value: "62" },
    { key: "expected_graduation", value: "May 2028" },
    { key: "internship", value: "Looking for Summer 2027 software engineering internships" },
    { key: "research", value: "Interested in NLP and LLM research" },
    { key: "skills", value: "TypeScript, Python, Next.js, React, Node.js, SQL, Git" },
    { key: "allergy", value: "peanuts" },
    { key: "dietary", value: "no peanuts, prefers grilled food" },
    { key: "favorite_food", value: "grilled chicken, pasta" },
    { key: "fitness", value: "goes to the Rec Center 3x/week, likes weightlifting" },
    { key: "schedule", value: "MWF classes 9am-2pm, TR classes 10am-1pm, evenings free" },
    { key: "barber_preference", value: "fade cuts, Crimson Cuts preferred" },
    { key: "resume_uploaded", value: "no" },
  ];
  for (const m of shelbeyMemories) {
    await prisma.userMemory.create({ data: { userId: shelbey.id, key: m.key, value: m.value, source: "user_stated" } });
  }
  console.log(`  ${shelbeyMemories.length} memories for Shelbey`);

  // =====================================================
  // CS PROFESSORS
  // =====================================================
  console.log("Creating CS professors...");

  const profMitchell = await prisma.user.create({
    data: {
      email: "smitchell@ua.edu", passwordHash: pw, name: "Dr. Sarah Mitchell", role: "person",
      profiles: {
        create: {
          type: "person", displayName: "Dr. Sarah Mitchell",
          bio: "Associate Professor of Computer Science. Research: machine learning, NLP, and AI safety. Teaching CS 403 (AI), CS 201 (Data Structures), CS 495 (ML Seminar).",
          location: "Tuscaloosa, AL", status: "available", category: "faculty",
          campusRole: "professor", department: "Computer Science",
          title: "Associate Professor", officeLocation: "Shelby Hall 3218",
          officeHours: "Mon/Wed 2:00-4:00 PM",
          tags: ["cs", "machine-learning", "nlp", "ai", "python", "research"],
          isClaimable: true,
          services: { create: [
            { name: "Office Hours", description: "Drop-in advising for CS 403/201 students.", category: "Academic", duration: 20, isBookable: true },
            { name: "Research Meeting", description: "Discuss ML/NLP research opportunities.", category: "Research", duration: 30, isBookable: true },
          ]},
          capabilities: { create: [{ type: "booking" }, { type: "availability" }, { type: "messaging" }] },
          infoSections: { create: [
            { section: "courses", title: "Current Courses", data: { courses: [
              { code: "CS 403", name: "Introduction to Artificial Intelligence", schedule: "MWF 10:00-10:50 AM", location: "Shelby 1103", seats: 45, enrolled: 38 },
              { code: "CS 201", name: "Data Structures & Algorithms", schedule: "TR 2:00-3:15 PM", location: "Shelby 1103", seats: 60, enrolled: 55 },
              { code: "CS 495", name: "Machine Learning Seminar", schedule: "F 3:00-4:30 PM", location: "Shelby 2218", seats: 20, enrolled: 12 },
            ]}},
            { section: "research", title: "Research Areas", data: {
              areas: ["Machine Learning", "Natural Language Processing", "AI Safety", "Responsible AI"],
              lab: "UA Intelligent Systems Lab",
              current_projects: [
                { name: "Bias Detection in LLMs", description: "Developing tools to identify and mitigate bias in large language models.", openPositions: 2 },
                { name: "Campus AI Assistant", description: "Building intelligent assistants for university operations.", openPositions: 1 },
              ],
              lookingForStudents: true,
              idealBackground: "CS juniors/seniors with Python and ML coursework (CS 403 or equivalent)",
            }},
            { section: "office_hours", title: "Office Hours", data: {
              schedule: [
                { day: "Monday", start: "14:00", end: "16:00", location: "Shelby Hall 3218" },
                { day: "Wednesday", start: "14:00", end: "16:00", location: "Shelby Hall 3218" },
              ],
              notes: "No appointment needed during posted hours.",
            }},
          ]},
        },
      },
      messageSettings: { create: {} },
    },
  });
  console.log("  Dr. Sarah Mitchell (CS/AI) — " + profMitchell.id);

  const profChen = await prisma.user.create({
    data: {
      email: "wchen@ua.edu", passwordHash: pw, name: "Dr. Wei Chen", role: "person",
      profiles: {
        create: {
          type: "person", displayName: "Dr. Wei Chen",
          bio: "Professor of Computer Science. Research: cybersecurity, distributed systems, and cloud computing. Teaching CS 457 (Networks), CS 426 (Parallel Computing).",
          location: "Tuscaloosa, AL", status: "available", category: "faculty",
          campusRole: "professor", department: "Computer Science",
          title: "Professor", officeLocation: "Shelby Hall 2310",
          officeHours: "Tue/Thu 1:00-3:00 PM",
          tags: ["cs", "cybersecurity", "networks", "distributed-systems", "cloud"],
          isClaimable: true,
          services: { create: [
            { name: "Office Hours", description: "Advising for CS 457/426 students.", category: "Academic", duration: 20, isBookable: true },
            { name: "Research Discussion", description: "Cybersecurity and systems research.", category: "Research", duration: 30, isBookable: true },
          ]},
          capabilities: { create: [{ type: "booking" }, { type: "availability" }, { type: "messaging" }] },
          infoSections: { create: [
            { section: "courses", title: "Current Courses", data: { courses: [
              { code: "CS 457", name: "Computer Networks & Security", schedule: "TR 11:00 AM-12:15 PM", location: "Shelby 2112", seats: 40, enrolled: 35 },
              { code: "CS 426", name: "Parallel Computing", schedule: "MWF 1:00-1:50 PM", location: "Shelby 2112", seats: 30, enrolled: 22 },
            ]}},
            { section: "research", title: "Research", data: {
              areas: ["Cybersecurity", "Distributed Systems", "Cloud Computing", "IoT Security"],
              lab: "UA Systems Security Lab",
              current_projects: [
                { name: "IoT Vulnerability Scanner", description: "Automated detection of vulnerabilities in IoT devices.", openPositions: 1 },
                { name: "Secure Cloud Architectures", description: "Designing resilient multi-cloud systems.", openPositions: 2 },
              ],
              lookingForStudents: true,
              idealBackground: "CS students with networking or security coursework",
            }},
          ]},
        },
      },
      messageSettings: { create: {} },
    },
  });
  console.log("  Dr. Wei Chen (CS/Security) — " + profChen.id);

  const profJohnson = await prisma.user.create({
    data: {
      email: "rjohnson@ua.edu", passwordHash: pw, name: "Dr. Rachel Johnson", role: "person",
      profiles: {
        create: {
          type: "person", displayName: "Dr. Rachel Johnson",
          bio: "Assistant Professor of Computer Science. Research: software engineering, human-computer interaction, and developer tools. Teaching CS 360 (Software Engineering), CS 302 (Operating Systems).",
          location: "Tuscaloosa, AL", status: "available", category: "faculty",
          campusRole: "professor", department: "Computer Science",
          title: "Assistant Professor", officeLocation: "Shelby Hall 2205",
          officeHours: "Mon/Fri 10:00 AM-12:00 PM",
          tags: ["cs", "software-engineering", "hci", "dev-tools", "agile"],
          isClaimable: true,
          services: { create: [
            { name: "Office Hours", description: "CS 360/302 student advising.", category: "Academic", duration: 20, isBookable: true },
            { name: "Project Review", description: "Review capstone or personal projects.", category: "Academic", duration: 30, isBookable: true },
          ]},
          capabilities: { create: [{ type: "booking" }, { type: "availability" }, { type: "messaging" }] },
          infoSections: { create: [
            { section: "courses", title: "Current Courses", data: { courses: [
              { code: "CS 360", name: "Software Engineering", schedule: "MWF 11:00-11:50 AM", location: "Shelby 1205", seats: 50, enrolled: 44 },
              { code: "CS 302", name: "Operating Systems", schedule: "TR 3:30-4:45 PM", location: "Shelby 1103", seats: 45, enrolled: 40 },
            ]}},
            { section: "research", title: "Research", data: {
              areas: ["Software Engineering", "HCI", "Developer Productivity", "Open Source"],
              lab: "UA Software Innovation Lab",
              current_projects: [
                { name: "AI-Assisted Code Review", description: "Using LLMs to improve code review quality.", openPositions: 2 },
                { name: "Developer Experience Metrics", description: "Measuring and improving developer productivity.", openPositions: 1 },
              ],
              lookingForStudents: true,
              idealBackground: "CS students with software engineering interest and coding portfolio",
            }},
          ]},
        },
      },
      messageSettings: { create: {} },
    },
  });
  console.log("  Dr. Rachel Johnson (CS/SE) — " + profJohnson.id);

  const profThompson = await prisma.user.create({
    data: {
      email: "dthompson@ua.edu", passwordHash: pw, name: "Dr. David Thompson", role: "person",
      profiles: {
        create: {
          type: "person", displayName: "Dr. David Thompson",
          bio: "Professor of Computer Science. Research: computer vision, robotics, and deep learning. Teaching CS 470 (Computer Vision), CS 491 (Deep Learning).",
          location: "Tuscaloosa, AL", status: "available", category: "faculty",
          campusRole: "professor", department: "Computer Science",
          title: "Professor", officeLocation: "Shelby Hall 3105",
          officeHours: "Wed/Fri 2:00-4:00 PM",
          tags: ["cs", "computer-vision", "robotics", "deep-learning", "pytorch"],
          isClaimable: true,
          services: { create: [
            { name: "Office Hours", description: "CS 470/491 student advising.", category: "Academic", duration: 20, isBookable: true },
            { name: "Research Meeting", description: "Vision and robotics research.", category: "Research", duration: 30, isBookable: true },
          ]},
          capabilities: { create: [{ type: "booking" }, { type: "availability" }, { type: "messaging" }] },
          infoSections: { create: [
            { section: "courses", title: "Current Courses", data: { courses: [
              { code: "CS 470", name: "Computer Vision", schedule: "TR 9:30-10:45 AM", location: "Shelby 2218", seats: 30, enrolled: 25 },
              { code: "CS 491", name: "Deep Learning", schedule: "MWF 2:00-2:50 PM", location: "Shelby 2218", seats: 25, enrolled: 23 },
            ]}},
            { section: "research", title: "Research", data: {
              areas: ["Computer Vision", "Robotics", "Deep Learning", "Autonomous Systems"],
              lab: "UA Vision & Robotics Lab",
              current_projects: [
                { name: "Autonomous Campus Navigation", description: "Self-driving delivery robots for campus.", openPositions: 3 },
                { name: "Medical Image Analysis", description: "Deep learning for radiology diagnosis.", openPositions: 1 },
              ],
              lookingForStudents: true,
              idealBackground: "CS students with ML coursework and Python/PyTorch experience",
            }},
          ]},
        },
      },
      messageSettings: { create: {} },
    },
  });
  console.log("  Dr. David Thompson (CS/Vision) — " + profThompson.id);

  // =====================================================
  // OTHER DEPARTMENT PROFESSORS
  // =====================================================
  console.log("Creating other department professors...");

  const profRivera = await prisma.user.create({
    data: {
      email: "jrivera@ua.edu", passwordHash: pw, name: "Dr. James Rivera", role: "person",
      profiles: {
        create: {
          type: "person", displayName: "Dr. James Rivera",
          bio: "Professor of Finance at Culverhouse. Specializes in corporate finance, investment analysis, and fintech. Advisor for Student Investment Fund.",
          location: "Tuscaloosa, AL", status: "available", category: "faculty",
          campusRole: "professor", department: "Finance",
          title: "Professor of Finance", officeLocation: "Bidgood Hall 326",
          officeHours: "Tue/Thu 10:00 AM-12:00 PM",
          tags: ["finance", "business", "investing", "fintech", "culverhouse"],
          isClaimable: true,
          services: { create: [
            { name: "Office Hours", description: "FI 302/410 advising.", category: "Academic", duration: 15, isBookable: true },
            { name: "Career Advising", description: "Finance career and grad school guidance.", category: "Career", duration: 20, isBookable: true },
          ]},
          capabilities: { create: [{ type: "booking" }, { type: "availability" }, { type: "messaging" }] },
          infoSections: { create: [
            { section: "courses", title: "Courses", data: { courses: [
              { code: "FI 302", name: "Corporate Finance", schedule: "TR 9:30-10:45 AM", location: "Bidgood 230" },
              { code: "FI 410", name: "Investment Analysis", schedule: "TR 11:00 AM-12:15 PM", location: "Bidgood 230" },
            ]}},
          ]},
        },
      },
      messageSettings: { create: {} },
    },
  });
  console.log("  Dr. James Rivera (Finance) — " + profRivera.id);

  const profPark = await prisma.user.create({
    data: {
      email: "mpark@ua.edu", passwordHash: pw, name: "Dr. Min-Jun Park", role: "person",
      profiles: {
        create: {
          type: "person", displayName: "Dr. Min-Jun Park",
          bio: "Associate Professor of Mechanical Engineering. Research: thermal systems, renewable energy, and advanced manufacturing. Teaching ME 301 (Thermodynamics II), ME 460 (Heat Transfer).",
          location: "Tuscaloosa, AL", status: "available", category: "faculty",
          campusRole: "professor", department: "Mechanical Engineering",
          title: "Associate Professor", officeLocation: "Houser Hall 2015",
          officeHours: "Mon/Wed 1:00-3:00 PM",
          tags: ["mechanical-engineering", "thermodynamics", "renewable-energy", "manufacturing"],
          isClaimable: true,
          services: { create: [
            { name: "Office Hours", description: "ME 301/460 advising.", category: "Academic", duration: 20, isBookable: true },
            { name: "Research Meeting", description: "Energy systems research.", category: "Research", duration: 30, isBookable: true },
          ]},
          capabilities: { create: [{ type: "booking" }, { type: "availability" }, { type: "messaging" }] },
          infoSections: { create: [
            { section: "research", title: "Research", data: {
              areas: ["Thermal Systems", "Renewable Energy", "Advanced Manufacturing"],
              current_projects: [
                { name: "Solar Thermal Storage", description: "Novel materials for solar energy storage.", openPositions: 2 },
              ],
              lookingForStudents: true,
            }},
          ]},
        },
      },
      messageSettings: { create: {} },
    },
  });
  console.log("  Dr. Min-Jun Park (ME) — " + profPark.id);

  // =====================================================
  // ACADEMIC ADVISORS
  // =====================================================
  console.log("Creating academic advisors...");

  const advisorWells = await prisma.user.create({
    data: {
      email: "kwells@ua.edu", passwordHash: pw, name: "Dr. Karen Wells", role: "person",
      profiles: {
        create: {
          type: "person", displayName: "Dr. Karen Wells",
          bio: "Senior Academic Advisor for Computer Science. Helps CS students with degree planning, course selection, prerequisite navigation, and graduation requirements.",
          location: "Tuscaloosa, AL", status: "available", category: "advisor",
          campusRole: "advisor", department: "Computer Science",
          title: "Senior Academic Advisor", officeLocation: "Shelby Hall 1105",
          officeHours: "Mon-Fri 9:00 AM-4:00 PM",
          tags: ["cs", "advising", "degree-planning", "prerequisites", "graduation"],
          services: { create: [
            { name: "Advising Appointment", description: "Course planning, degree audit review, graduation check.", category: "Academic", duration: 30, isBookable: true },
            { name: "Quick Question", description: "Drop-in for quick questions about registration.", category: "Academic", duration: 10, isBookable: true },
          ]},
          capabilities: { create: [{ type: "booking" }, { type: "availability" }, { type: "messaging" }] },
          infoSections: { create: [
            { section: "degree_requirements", title: "CS Degree Requirements (B.S.)", data: {
              totalCredits: 120,
              coreCourses: [
                { code: "CS 100", name: "Intro to Computer Science", credits: 3, prereqs: [] },
                { code: "CS 101", name: "Programming I (Python)", credits: 3, prereqs: [] },
                { code: "CS 200", name: "Programming II (Java)", credits: 3, prereqs: ["CS 101"] },
                { code: "CS 201", name: "Data Structures & Algorithms", credits: 3, prereqs: ["CS 200", "MATH 125"] },
                { code: "CS 250", name: "Discrete Mathematics", credits: 3, prereqs: ["MATH 125"] },
                { code: "CS 301", name: "Algorithms", credits: 3, prereqs: ["CS 201", "CS 250"] },
                { code: "CS 302", name: "Operating Systems", credits: 3, prereqs: ["CS 201"] },
                { code: "CS 360", name: "Software Engineering", credits: 3, prereqs: ["CS 201"] },
                { code: "CS 370", name: "Computer Organization", credits: 3, prereqs: ["CS 201"] },
                { code: "CS 403", name: "Artificial Intelligence", credits: 3, prereqs: ["CS 301"] },
                { code: "CS 426", name: "Parallel Computing", credits: 3, prereqs: ["CS 302"] },
                { code: "CS 457", name: "Computer Networks", credits: 3, prereqs: ["CS 302"] },
                { code: "CS 470", name: "Computer Vision", credits: 3, prereqs: ["CS 301", "MATH 301"] },
                { code: "CS 491", name: "Deep Learning", credits: 3, prereqs: ["CS 403"] },
                { code: "CS 495", name: "ML Seminar", credits: 3, prereqs: ["CS 403"] },
              ],
              mathRequirements: [
                { code: "MATH 125", name: "Calculus I", credits: 4 },
                { code: "MATH 126", name: "Calculus II", credits: 4 },
                { code: "MATH 227", name: "Calculus III", credits: 4 },
                { code: "MATH 301", name: "Linear Algebra", credits: 3 },
                { code: "MATH 355", name: "Probability & Statistics", credits: 3 },
              ],
              scienceRequirements: "Two lab science sequences (PH 101/102, CH 101/102, or BSC 108/109)",
              electiveCredits: 15,
              tracks: [
                { name: "Software Engineering", courses: ["CS 360", "CS 302", "CS 457"] },
                { name: "AI & Machine Learning", courses: ["CS 403", "CS 491", "CS 495", "CS 470"] },
                { name: "Systems & Security", courses: ["CS 302", "CS 426", "CS 457"] },
                { name: "Data Science", courses: ["CS 403", "CS 491", "MATH 355"] },
              ],
            }},
            { section: "common_plans", title: "Recommended Course Sequences", data: {
              fourYearPlan: {
                year1_fall: ["CS 100", "MATH 125", "EN 101", "PH 101", "UA 100"],
                year1_spring: ["CS 101", "MATH 126", "EN 102", "PH 102"],
                year2_fall: ["CS 200", "CS 250", "MATH 227", "Humanities Elective"],
                year2_spring: ["CS 201", "MATH 301", "MATH 355", "Social Science Elective"],
                year3_fall: ["CS 301", "CS 302", "CS 360", "CS Elective"],
                year3_spring: ["CS 370", "CS 403", "CS Elective", "Free Elective"],
                year4_fall: ["CS 457", "CS Elective", "CS Elective", "Free Elective"],
                year4_spring: ["CS 495/491", "CS Elective", "Free Elective", "Free Elective"],
              },
            }},
          ]},
        },
      },
      messageSettings: { create: {} },
    },
  });
  console.log("  Dr. Karen Wells (CS Advisor) — " + advisorWells.id);

  const advisorHarris = await prisma.user.create({
    data: {
      email: "lharris@ua.edu", passwordHash: pw, name: "Lisa Harris", role: "person",
      profiles: {
        create: {
          type: "person", displayName: "Lisa Harris",
          bio: "Academic Advisor for College of Engineering. Assists engineering students with general education requirements, inter-college transfers, and university policies.",
          location: "Tuscaloosa, AL", status: "available", category: "advisor",
          campusRole: "advisor", department: "Engineering",
          title: "Academic Advisor", officeLocation: "Houser Hall 1010",
          officeHours: "Mon-Thu 8:30 AM-4:30 PM, Fri 8:30 AM-12:00 PM",
          tags: ["engineering", "advising", "gen-ed", "transfer"],
          services: { create: [
            { name: "Advising Appointment", description: "General engineering advising.", category: "Academic", duration: 30, isBookable: true },
          ]},
          capabilities: { create: [{ type: "booking" }, { type: "messaging" }] },
        },
      },
      messageSettings: { create: {} },
    },
  });
  console.log("  Lisa Harris (Engineering Advisor) — " + advisorHarris.id);

  // =====================================================
  // UA COURSE CATALOG (Fall 2026)
  // =====================================================
  console.log("Creating UA Course Catalog...");

  const catalogUser = await prisma.user.create({
    data: {
      email: "registrar@ua.edu", passwordHash: pw, name: "UA Registrar", role: "person",
      profiles: {
        create: {
          type: "site", displayName: "UA Course Catalog — Fall 2026",
          bio: "Complete course catalog for Fall 2026 at The University of Alabama. Browse by department.",
          location: "Tuscaloosa, AL", status: "available", category: "academic",
          tags: ["courses", "catalog", "fall-2026", "registration", "schedule"],
          infoSections: { create: [
            { section: "courses", subsection: "computer_science", title: "Computer Science (CS)", data: { courses: [
              { code: "CS 100", name: "Intro to Computer Science", credits: 3, instructor: "Dr. Amy Liu", schedule: "MWF 9:00-9:50 AM", location: "Shelby 1103", seats: 120, enrolled: 95, prereqs: [] },
              { code: "CS 101", name: "Programming I (Python)", credits: 3, instructor: "Dr. Amy Liu", schedule: "MWF 11:00-11:50 AM", location: "Shelby 1103", seats: 80, enrolled: 72, prereqs: [] },
              { code: "CS 200", name: "Programming II (Java)", credits: 3, instructor: "Dr. Tom Baker", schedule: "TR 9:30-10:45 AM", location: "Shelby 1205", seats: 60, enrolled: 54, prereqs: ["CS 101"] },
              { code: "CS 201", name: "Data Structures & Algorithms", credits: 3, instructor: "Dr. Sarah Mitchell", schedule: "TR 2:00-3:15 PM", location: "Shelby 1103", seats: 60, enrolled: 55, prereqs: ["CS 200", "MATH 125"] },
              { code: "CS 250", name: "Discrete Mathematics", credits: 3, instructor: "Dr. Tom Baker", schedule: "MWF 1:00-1:50 PM", location: "Shelby 1205", seats: 50, enrolled: 42, prereqs: ["MATH 125"] },
              { code: "CS 301", name: "Algorithms", credits: 3, instructor: "Dr. Sarah Mitchell", schedule: "MWF 10:00-10:50 AM", location: "Shelby 2112", seats: 45, enrolled: 38, prereqs: ["CS 201", "CS 250"] },
              { code: "CS 302", name: "Operating Systems", credits: 3, instructor: "Dr. Rachel Johnson", schedule: "TR 3:30-4:45 PM", location: "Shelby 1103", seats: 45, enrolled: 40, prereqs: ["CS 201"] },
              { code: "CS 360", name: "Software Engineering", credits: 3, instructor: "Dr. Rachel Johnson", schedule: "MWF 11:00-11:50 AM", location: "Shelby 1205", seats: 50, enrolled: 44, prereqs: ["CS 201"] },
              { code: "CS 370", name: "Computer Organization", credits: 3, instructor: "Dr. Wei Chen", schedule: "MWF 2:00-2:50 PM", location: "Shelby 2112", seats: 40, enrolled: 33, prereqs: ["CS 201"] },
              { code: "CS 403", name: "Artificial Intelligence", credits: 3, instructor: "Dr. Sarah Mitchell", schedule: "MWF 10:00-10:50 AM", location: "Shelby 1103", seats: 45, enrolled: 38, prereqs: ["CS 301"] },
              { code: "CS 426", name: "Parallel Computing", credits: 3, instructor: "Dr. Wei Chen", schedule: "MWF 1:00-1:50 PM", location: "Shelby 2112", seats: 30, enrolled: 22, prereqs: ["CS 302"] },
              { code: "CS 457", name: "Computer Networks & Security", credits: 3, instructor: "Dr. Wei Chen", schedule: "TR 11:00 AM-12:15 PM", location: "Shelby 2112", seats: 40, enrolled: 35, prereqs: ["CS 302"] },
              { code: "CS 470", name: "Computer Vision", credits: 3, instructor: "Dr. David Thompson", schedule: "TR 9:30-10:45 AM", location: "Shelby 2218", seats: 30, enrolled: 25, prereqs: ["CS 301", "MATH 301"] },
              { code: "CS 491", name: "Deep Learning", credits: 3, instructor: "Dr. David Thompson", schedule: "MWF 2:00-2:50 PM", location: "Shelby 2218", seats: 25, enrolled: 23, prereqs: ["CS 403"] },
              { code: "CS 495", name: "Machine Learning Seminar", credits: 3, instructor: "Dr. Sarah Mitchell", schedule: "F 3:00-4:30 PM", location: "Shelby 2218", seats: 20, enrolled: 12, prereqs: ["CS 403"] },
            ]}},
            { section: "courses", subsection: "math", title: "Mathematics (MATH)", data: { courses: [
              { code: "MATH 112", name: "Precalculus", credits: 3, instructor: "Dr. Lisa Park", schedule: "MWF 8:00-8:50 AM", seats: 100, enrolled: 82 },
              { code: "MATH 125", name: "Calculus I", credits: 4, instructor: "Dr. Mark Stevens", schedule: "MTWF 9:00-9:50 AM", seats: 80, enrolled: 74 },
              { code: "MATH 126", name: "Calculus II", credits: 4, instructor: "Dr. Mark Stevens", schedule: "MTWF 10:00-10:50 AM", seats: 60, enrolled: 51 },
              { code: "MATH 227", name: "Calculus III", credits: 4, instructor: "Dr. Emily Ross", schedule: "MTWF 11:00-11:50 AM", seats: 50, enrolled: 38 },
              { code: "MATH 237", name: "Linear Algebra for Applications", credits: 3, instructor: "Dr. Emily Ross", schedule: "MWF 1:00-1:50 PM", seats: 45, enrolled: 30 },
              { code: "MATH 301", name: "Linear Algebra", credits: 3, instructor: "Dr. Emily Ross", schedule: "MWF 2:00-2:50 PM", seats: 40, enrolled: 28 },
              { code: "MATH 355", name: "Probability & Statistics", credits: 3, instructor: "Dr. Lisa Park", schedule: "TR 2:00-3:15 PM", seats: 60, enrolled: 48 },
            ]}},
            { section: "courses", subsection: "finance", title: "Finance (FI)", data: { courses: [
              { code: "FI 302", name: "Corporate Finance", credits: 3, instructor: "Dr. James Rivera", schedule: "TR 9:30-10:45 AM", seats: 80, enrolled: 72 },
              { code: "FI 410", name: "Investment Analysis", credits: 3, instructor: "Dr. James Rivera", schedule: "TR 11:00 AM-12:15 PM", seats: 50, enrolled: 44 },
              { code: "FI 420", name: "Financial Modeling", credits: 3, instructor: "Dr. Sandra Lee", schedule: "MWF 10:00-10:50 AM", seats: 40, enrolled: 35 },
            ]}},
            { section: "courses", subsection: "engineering", title: "Mechanical Engineering (ME)", data: { courses: [
              { code: "ME 200", name: "Statics", credits: 3, instructor: "Dr. Robert Kim", schedule: "MWF 9:00-9:50 AM", seats: 60, enrolled: 52 },
              { code: "ME 210", name: "Dynamics", credits: 3, instructor: "Dr. Robert Kim", schedule: "MWF 11:00-11:50 AM", seats: 50, enrolled: 43 },
              { code: "ME 301", name: "Thermodynamics II", credits: 3, instructor: "Dr. Min-Jun Park", schedule: "TR 9:30-10:45 AM", seats: 45, enrolled: 38 },
              { code: "ME 460", name: "Heat Transfer", credits: 3, instructor: "Dr. Min-Jun Park", schedule: "TR 2:00-3:15 PM", seats: 35, enrolled: 28 },
            ]}},
            { section: "registration", title: "Registration Info", data: {
              earlyRegistration: "March 15, 2026",
              openRegistration: "April 1, 2026",
              lastDayToAdd: "August 28, 2026",
              lastDayToDrop: "October 15, 2026",
              classesBegin: "August 19, 2026",
              classesEnd: "December 4, 2026",
              finals: "December 7-13, 2026",
            }},
          ]},
        },
      },
      messageSettings: { create: {} },
    },
  });
  console.log("  UA Course Catalog — " + catalogUser.id);

  // =====================================================
  // CAMPUS SITES
  // =====================================================
  console.log("Creating campus sites...");

  const lakeside = await prisma.user.create({
    data: {
      email: "lakeside@ua.edu", passwordHash: pw, name: "Lakeside Dining", role: "person",
      profiles: {
        create: {
          type: "site", displayName: "Lakeside Dining Hall",
          bio: "One of UA's main dining halls featuring multiple food stations with all-you-can-eat meal plan access.",
          location: "Tuscaloosa, AL", status: "available", category: "dining",
          address: "500 Margaret Dr, Tuscaloosa, AL 35401",
          hours: "Mon-Fri 7:00 AM-9:00 PM, Sat-Sun 8:00 AM-8:00 PM",
          tags: ["dining", "food", "meal-plan", "campus", "breakfast", "lunch", "dinner"],
          capabilities: { create: [{ type: "ordering" }] },
          infoSections: { create: [
            { section: "menu", subsection: "grill", title: "Grill Station", data: { items: [
              { name: "Classic Burger", price: "$6.99", description: "1/3 lb beef patty, lettuce, tomato, onion", allergens: ["gluten"] },
              { name: "Grilled Chicken Sandwich", price: "$7.49", description: "Marinated chicken breast, mayo, lettuce", allergens: ["gluten"] },
              { name: "Veggie Burger", price: "$6.99", description: "Plant-based patty, all toppings", allergens: ["soy", "gluten"] },
              { name: "Chicken Tenders", price: "$7.99", description: "Hand-breaded, served with fries", allergens: ["gluten"] },
              { name: "Grilled Chicken Caesar Wrap", price: "$7.29", description: "Romaine, parmesan, caesar dressing", allergens: ["dairy", "gluten"] },
            ]}},
            { section: "menu", subsection: "pizza", title: "Pizza Station", data: { items: [
              { name: "Cheese Pizza (slice)", price: "$3.49", allergens: ["dairy", "gluten"] },
              { name: "Pepperoni Pizza (slice)", price: "$3.99", allergens: ["dairy", "gluten"] },
              { name: "BBQ Chicken Pizza (slice)", price: "$4.29", allergens: ["dairy", "gluten"] },
            ]}},
            { section: "menu", subsection: "salad", title: "Salad Bar", data: { items: [
              { name: "Build Your Own Salad", price: "$6.99", description: "Choose base, proteins, toppings, dressing", allergens: [] },
              { name: "Caesar Salad", price: "$5.99", allergens: ["dairy"] },
              { name: "Grilled Chicken Salad", price: "$7.99", allergens: [] },
            ]}},
            { section: "menu", subsection: "comfort", title: "Comfort Station", data: { items: [
              { name: "Mac & Cheese", price: "$5.49", allergens: ["dairy", "gluten"] },
              { name: "Mashed Potatoes & Gravy", price: "$3.99", allergens: ["dairy"] },
              { name: "Grilled Salmon", price: "$9.99", allergens: ["fish"] },
              { name: "Rotisserie Chicken", price: "$8.49", allergens: [] },
            ]}},
            { section: "hours", title: "Hours", data: {
              weekday: { breakfast: "7:00-10:00 AM", lunch: "11:00 AM-2:00 PM", dinner: "5:00-9:00 PM" },
              weekend: { brunch: "8:00 AM-1:00 PM", dinner: "5:00-8:00 PM" },
            }},
          ]},
        },
      },
      messageSettings: { create: {} },
    },
  });
  console.log("  Lakeside Dining — " + lakeside.id);

  const gorgas = await prisma.user.create({
    data: {
      email: "gorgas@ua.edu", passwordHash: pw, name: "Gorgas Library", role: "person",
      profiles: {
        create: {
          type: "site", displayName: "Gorgas Library",
          bio: "UA's main research library. Study rooms, computer labs, printing, research databases, and quiet study floors.",
          location: "Tuscaloosa, AL", status: "available", category: "library",
          address: "501 University Blvd, Tuscaloosa, AL 35401",
          hours: "Mon-Thu 7:30 AM-2:00 AM, Fri 7:30 AM-8:00 PM, Sat 10:00 AM-8:00 PM, Sun 12:00 PM-2:00 AM",
          tags: ["library", "study", "research", "printing", "study-rooms", "quiet"],
          services: { create: [
            { name: "Study Room (2-person)", description: "Small study room, max 2 hours.", category: "Space", duration: 120, isBookable: true },
            { name: "Study Room (6-person)", description: "Group study room, max 3 hours.", category: "Space", duration: 180, isBookable: true },
            { name: "Computer Lab Access", description: "Access to lab computers with software suite.", category: "Technology", isBookable: false },
          ]},
          capabilities: { create: [{ type: "booking" }, { type: "availability" }] },
          infoSections: { create: [
            { section: "facilities", title: "Facilities", data: {
              floors: ["1st Floor: Circulation, Reference, Computer Lab", "2nd Floor: Quiet Study, Research Databases", "3rd Floor: Special Collections", "4th Floor: Silent Study Zone"],
              studyRooms: { small: 12, large: 6, bookingRequired: true },
              computers: 80,
              printing: { bw: "$0.10/page", color: "$0.50/page" },
            }},
          ]},
        },
      },
      messageSettings: { create: {} },
    },
  });
  console.log("  Gorgas Library — " + gorgas.id);

  const recCenter = await prisma.user.create({
    data: {
      email: "rec@ua.edu", passwordHash: pw, name: "UA Rec Center", role: "person",
      profiles: {
        create: {
          type: "site", displayName: "UA Student Recreation Center",
          bio: "State-of-the-art fitness facility with weight rooms, pools, basketball courts, group fitness classes, and outdoor pursuits.",
          location: "Tuscaloosa, AL", status: "available", category: "recreation",
          hours: "Mon-Fri 6:00 AM-11:00 PM, Sat-Sun 9:00 AM-9:00 PM",
          tags: ["gym", "fitness", "recreation", "pool", "basketball", "workout"],
          services: { create: [
            { name: "Personal Training Session", description: "1-on-1 training with certified trainer.", category: "Fitness", duration: 60, price: "$30", isBookable: true },
            { name: "Group Fitness Class", description: "Yoga, spin, HIIT, and more.", category: "Fitness", duration: 45, isBookable: true },
          ]},
          capabilities: { create: [{ type: "booking" }, { type: "availability" }] },
          infoSections: { create: [
            { section: "facilities", title: "Facilities", data: {
              areas: ["Weight Room (free weights + machines)", "Cardio Zone (treadmills, bikes, ellipticals)", "Olympic Pool (lap swimming)", "Basketball Courts (4)", "Racquetball Courts (6)", "Indoor Track (1/8 mile)", "Rock Climbing Wall", "Outdoor Pursuits Center"],
              classes: ["Yoga (Mon/Wed/Fri 7 AM, 5 PM)", "Spin (Tue/Thu 6 AM, 12 PM)", "HIIT (Mon/Wed 4 PM)", "Pilates (Tue/Thu 5:30 PM)", "Zumba (Fri 4 PM)"],
            }},
          ]},
        },
      },
      messageSettings: { create: {} },
    },
  });
  console.log("  UA Rec Center — " + recCenter.id);

  // =====================================================
  // CAREER CENTER & GRAD SCHOOL
  // =====================================================
  console.log("Creating career center & grad school...");

  const careerCenter = await prisma.user.create({
    data: {
      email: "career@ua.edu", passwordHash: pw, name: "UA Career Center", role: "person",
      profiles: {
        create: {
          type: "site", displayName: "UA Career Center",
          bio: "Career counseling, resume reviews, mock interviews, job fairs, and internship connections for UA students.",
          location: "Tuscaloosa, AL", status: "available", category: "career",
          officeLocation: "Student Center 2200",
          hours: "Mon-Fri 8:00 AM-5:00 PM",
          tags: ["career", "resume", "interview", "internship", "job", "networking"],
          services: { create: [
            { name: "Resume Review", description: "One-on-one resume feedback session.", category: "Career", duration: 30, isBookable: true },
            { name: "Mock Interview", description: "Practice behavioral and technical interviews.", category: "Career", duration: 45, isBookable: true },
            { name: "Career Counseling", description: "Explore career paths aligned with your interests.", category: "Career", duration: 30, isBookable: true },
          ]},
          capabilities: { create: [{ type: "booking" }, { type: "availability" }, { type: "messaging" }] },
          infoSections: { create: [
            { section: "career_paths", subsection: "cs", title: "CS Career Paths", data: { paths: [
              { title: "Software Engineer", avgSalary: "$110,000", topEmployers: ["Google", "Amazon", "Microsoft", "Meta", "Apple"], skills: ["Data Structures", "System Design", "Problem Solving"] },
              { title: "ML/AI Engineer", avgSalary: "$130,000", topEmployers: ["OpenAI", "Google DeepMind", "NVIDIA", "Meta AI"], skills: ["Python", "PyTorch", "ML Theory", "Statistics"] },
              { title: "Data Scientist", avgSalary: "$105,000", topEmployers: ["McKinsey", "Capital One", "Spotify", "Netflix"], skills: ["Statistics", "SQL", "Python", "Visualization"] },
              { title: "Cybersecurity Analyst", avgSalary: "$95,000", topEmployers: ["CrowdStrike", "Palo Alto Networks", "NSA", "Deloitte"], skills: ["Networks", "Security Tools", "Risk Assessment"] },
              { title: "Product Manager", avgSalary: "$115,000", topEmployers: ["Google", "Apple", "Stripe", "Uber"], skills: ["User Research", "Analytics", "Communication", "Strategic Thinking"] },
            ]}},
            { section: "career_paths", subsection: "engineering", title: "Engineering Career Paths", data: { paths: [
              { title: "Mechanical Engineer", avgSalary: "$85,000", topEmployers: ["Boeing", "SpaceX", "Lockheed Martin", "Tesla"] },
              { title: "Civil Engineer", avgSalary: "$80,000", topEmployers: ["AECOM", "Jacobs", "US Army Corps"] },
            ]}},
            { section: "career_paths", subsection: "finance", title: "Finance Career Paths", data: { paths: [
              { title: "Investment Banker", avgSalary: "$120,000+bonus", topEmployers: ["Goldman Sachs", "JP Morgan", "Morgan Stanley"] },
              { title: "Financial Analyst", avgSalary: "$75,000", topEmployers: ["Deloitte", "EY", "KPMG", "PwC"] },
            ]}},
            { section: "events", title: "Upcoming Events", data: { events: [
              { name: "Fall Career Fair", date: "September 18, 2026", location: "Ferguson Center", description: "200+ employers across all industries" },
              { name: "Engineering Career Night", date: "October 2, 2026", location: "Shelby Hall", description: "Tech companies recruiting for internships" },
              { name: "Resume Workshop", date: "Every Tuesday", location: "Student Center 2200", description: "Drop-in resume feedback" },
            ]}},
          ]},
        },
      },
      messageSettings: { create: {} },
    },
  });
  console.log("  UA Career Center — " + careerCenter.id);

  const gradSchool = await prisma.user.create({
    data: {
      email: "gradschool@ua.edu", passwordHash: pw, name: "UA Graduate School", role: "person",
      profiles: {
        create: {
          type: "site", displayName: "UA Graduate School",
          bio: "Information about graduate programs, funding, GRE requirements, and application process at the University of Alabama.",
          location: "Tuscaloosa, AL", status: "available", category: "academic",
          hours: "Mon-Fri 8:00 AM-4:30 PM",
          tags: ["graduate", "masters", "phd", "funding", "gre", "grad-school"],
          capabilities: { create: [{ type: "messaging" }] },
          infoSections: { create: [
            { section: "programs", subsection: "cs", title: "CS Graduate Programs", data: {
              programs: [
                { degree: "M.S. in Computer Science", duration: "2 years", gre: "Optional but recommended", minGPA: 3.0, funding: "GTA/GRA available ($22,000/year + tuition waiver)", researchAreas: ["AI/ML", "Cybersecurity", "Software Engineering", "Data Science", "Computer Vision"], deadline: "February 1 (Fall), October 1 (Spring)" },
                { degree: "Ph.D. in Computer Science", duration: "4-5 years", gre: "Required (310+ recommended)", minGPA: 3.3, funding: "Full funding for admitted students ($26,000/year + tuition + insurance)", researchAreas: ["Machine Learning", "NLP", "Systems Security", "Robotics"], deadline: "January 15 (Fall)" },
              ],
            }},
            { section: "programs", subsection: "engineering", title: "Engineering Graduate Programs", data: {
              programs: [
                { degree: "M.S. in Mechanical Engineering", duration: "2 years", minGPA: 3.0, funding: "GTA/GRA available" },
                { degree: "M.S. in Electrical Engineering", duration: "2 years", minGPA: 3.0, funding: "GTA/GRA available" },
              ],
            }},
            { section: "application", title: "Application Process", data: {
              steps: ["1. Check program requirements", "2. Take GRE if required", "3. Request transcripts", "4. Write statement of purpose", "5. Get 3 letters of recommendation", "6. Apply online at grad.ua.edu", "7. Interview (for some programs)"],
              generalDeadlines: { fall: "February 1", spring: "October 1", summer: "March 1" },
            }},
          ]},
        },
      },
      messageSettings: { create: {} },
    },
  });
  console.log("  UA Graduate School — " + gradSchool.id);

  // =====================================================
  // OPPORTUNITIES (research, internships, scholarships)
  // =====================================================
  console.log("Creating opportunities...");

  const oppResearchML = await prisma.user.create({
    data: {
      email: "opp-ml@ua.edu", passwordHash: pw, name: "ML Research", role: "person",
      profiles: {
        create: {
          type: "opportunity", displayName: "Undergraduate ML Research Assistant",
          bio: "Join Dr. Mitchell's Intelligent Systems Lab working on bias detection in large language models. Gain hands-on experience with NLP, Python, and published research.",
          location: "Tuscaloosa, AL", status: "available", category: "research",
          department: "Computer Science", opportunityType: "research",
          eligibility: "CS juniors/seniors with 3.3+ GPA, CS 403 completed or enrolled",
          compensation: "$15/hr, 10-15 hrs/week",
          deadline: new Date("2026-10-01"),
          tags: ["research", "ml", "nlp", "ai", "python", "undergraduate", "fall-2026"],
          infoSections: { create: [
            { section: "details", title: "Position Details", data: {
              responsibilities: ["Implement NLP models for bias detection", "Run experiments and analyze results", "Contribute to research papers", "Attend weekly lab meetings"],
              requirements: ["Python fluency", "CS 403 (AI) completed or in progress", "3.3+ GPA", "Interest in NLP/ML research"],
              benefits: ["Research publication opportunity", "Letter of recommendation", "Grad school preparation", "Flexible hours"],
              howToApply: "Email Dr. Mitchell at smitchell@ua.edu with resume and transcript",
            }},
          ]},
        },
      },
      messageSettings: { create: {} },
    },
  });
  console.log("  ML Research Assistant — " + oppResearchML.id);

  const oppInternSWE = await prisma.user.create({
    data: {
      email: "opp-swe@ua.edu", passwordHash: pw, name: "SWE Internship", role: "person",
      profiles: {
        create: {
          type: "opportunity", displayName: "Summer 2027 Software Engineering Internship — Various Companies",
          bio: "Software engineering internship opportunities at top tech companies. UA Career Center coordinates recruitment for Google, Amazon, Microsoft, and 50+ other employers.",
          location: "Various", status: "available", category: "internship",
          department: "Computer Science", opportunityType: "internship",
          eligibility: "CS sophomores/juniors, 3.0+ GPA preferred",
          compensation: "$35-55/hr + housing stipend",
          deadline: new Date("2026-11-15"),
          tags: ["internship", "software-engineering", "summer-2027", "tech", "google", "amazon", "microsoft"],
          infoSections: { create: [
            { section: "details", title: "Internship Info", data: {
              companies: [
                { name: "Google", role: "SWE Intern", pay: "$50/hr + housing", deadline: "October 15", link: "careers.google.com" },
                { name: "Amazon", role: "SDE Intern", pay: "$47/hr + housing", deadline: "November 1", link: "amazon.jobs" },
                { name: "Microsoft", role: "SWE Intern", pay: "$45/hr + housing", deadline: "November 15", link: "careers.microsoft.com" },
                { name: "Meta", role: "SWE Intern", pay: "$55/hr + housing", deadline: "October 1", link: "metacareers.com" },
                { name: "Apple", role: "SWE Intern", pay: "$42/hr + housing", deadline: "November 30", link: "jobs.apple.com" },
              ],
              preparation: ["LeetCode practice (medium difficulty)", "System design basics", "Behavioral interview prep", "Resume polishing at Career Center"],
              timeline: "Applications open August-November, interviews October-February, offers December-March",
            }},
          ]},
        },
      },
      messageSettings: { create: {} },
    },
  });
  console.log("  SWE Internship — " + oppInternSWE.id);

  const oppScholarship1 = await prisma.user.create({
    data: {
      email: "opp-schol1@ua.edu", passwordHash: pw, name: "Dean's Excellence Scholarship", role: "person",
      profiles: {
        create: {
          type: "opportunity", displayName: "Dean's Excellence Scholarship — College of Engineering",
          bio: "Annual scholarship for outstanding engineering students demonstrating academic excellence and leadership. $5,000/year renewable for up to 3 years.",
          location: "Tuscaloosa, AL", status: "available", category: "scholarship",
          department: "Engineering", opportunityType: "scholarship",
          eligibility: "Engineering students with 3.5+ GPA, sophomore standing or above",
          compensation: "$5,000/year (renewable)",
          deadline: new Date("2027-02-01"),
          tags: ["scholarship", "engineering", "academic-excellence", "leadership", "spring-2027"],
          infoSections: { create: [
            { section: "details", title: "Scholarship Details", data: {
              amount: "$5,000/year for up to 3 years",
              requirements: ["3.5+ cumulative GPA", "Enrolled in College of Engineering", "Sophomore standing or above", "Leadership involvement (clubs, research, community service)"],
              application: ["500-word essay on engineering goals", "2 faculty recommendations", "Resume", "Unofficial transcript"],
              selectionCriteria: "Academic merit (40%), leadership (30%), essay quality (30%)",
            }},
          ]},
        },
      },
      messageSettings: { create: {} },
    },
  });
  console.log("  Dean's Excellence Scholarship — " + oppScholarship1.id);

  const oppScholarship2 = await prisma.user.create({
    data: {
      email: "opp-schol2@ua.edu", passwordHash: pw, name: "UA CS Research Fellowship", role: "person",
      profiles: {
        create: {
          type: "opportunity", displayName: "UA Computer Science Research Fellowship",
          bio: "Competitive fellowship supporting undergraduate CS students pursuing original research. Includes stipend, conference travel funding, and faculty mentorship.",
          location: "Tuscaloosa, AL", status: "available", category: "scholarship",
          department: "Computer Science", opportunityType: "scholarship",
          eligibility: "CS juniors/seniors with research experience and 3.3+ GPA",
          compensation: "$3,000 stipend + $1,500 conference travel",
          deadline: new Date("2027-03-15"),
          tags: ["scholarship", "research", "cs", "fellowship", "conference-travel", "spring-2027"],
        },
      },
      messageSettings: { create: {} },
    },
  });
  console.log("  CS Research Fellowship — " + oppScholarship2.id);

  const oppResearchVision = await prisma.user.create({
    data: {
      email: "opp-vision@ua.edu", passwordHash: pw, name: "Vision Lab Research", role: "person",
      profiles: {
        create: {
          type: "opportunity", displayName: "Computer Vision Research — Autonomous Navigation",
          bio: "Work with Dr. Thompson on autonomous campus delivery robots. Involves computer vision, sensor fusion, and path planning using Python and ROS.",
          location: "Tuscaloosa, AL", status: "available", category: "research",
          department: "Computer Science", opportunityType: "research",
          eligibility: "CS students with ML coursework, Python/PyTorch preferred",
          compensation: "$14/hr, 10-20 hrs/week",
          deadline: new Date("2026-09-15"),
          tags: ["research", "computer-vision", "robotics", "autonomous", "python", "pytorch", "fall-2026"],
        },
      },
      messageSettings: { create: {} },
    },
  });
  console.log("  Vision Lab Research — " + oppResearchVision.id);

  const oppVolunteer = await prisma.user.create({
    data: {
      email: "opp-tutor@ua.edu", passwordHash: pw, name: "CS Peer Tutoring", role: "person",
      profiles: {
        create: {
          type: "opportunity", displayName: "CS Peer Tutor — Help Fellow Students",
          bio: "Become a peer tutor for lower-division CS courses (CS 100, 101, 200, 201). Great way to solidify your own knowledge, build leadership skills, and earn service hours.",
          location: "Tuscaloosa, AL", status: "available", category: "volunteer",
          department: "Computer Science", opportunityType: "volunteer",
          eligibility: "CS students who earned A/B in CS 100-201, patient and good communicators",
          compensation: "Volunteer — counts as service hours for honors and organizations",
          tags: ["volunteer", "tutoring", "cs", "teaching", "leadership", "peer-tutor"],
        },
      },
      messageSettings: { create: {} },
    },
  });
  console.log("  CS Peer Tutor — " + oppVolunteer.id);

  // =====================================================
  // LOCAL BUSINESSES
  // =====================================================
  console.log("Creating local businesses...");

  const crimsonCuts = await prisma.user.create({
    data: {
      email: "crimsoncuts@gmail.com", passwordHash: pw, name: "Crimson Cuts", role: "business",
      profiles: {
        create: {
          type: "business", displayName: "Crimson Cuts Barbershop",
          bio: "Tuscaloosa's favorite barbershop near campus. Fades, lineups, beard trims, and more. Walk-ins welcome, appointments preferred.",
          location: "Tuscaloosa, AL", status: "available", category: "barbershop",
          address: "1215 University Blvd, Tuscaloosa, AL",
          hours: "Mon-Sat 9:00 AM-7:00 PM, Sun Closed",
          tags: ["barbershop", "haircut", "fade", "beard", "grooming"],
          services: { create: [
            { name: "Classic Fade", price: "$20", duration: 30, isBookable: true, category: "Haircuts" },
            { name: "Skin Fade", price: "$25", duration: 40, isBookable: true, category: "Haircuts" },
            { name: "Beard Trim", price: "$12", duration: 15, isBookable: true, category: "Grooming" },
            { name: "Haircut + Beard", price: "$30", duration: 45, isBookable: true, category: "Combo" },
          ]},
          capabilities: { create: [{ type: "booking" }, { type: "availability" }] },
        },
      },
      messageSettings: { create: {} },
    },
  });
  console.log("  Crimson Cuts — " + crimsonCuts.id);

  // =====================================================
  // STUDENT TUTORS
  // =====================================================
  console.log("Creating student tutors...");

  const tutorMath = await prisma.user.create({
    data: {
      email: "jtaylor@crimson.ua.edu", passwordHash: pw, name: "Jordan Taylor", role: "person",
      profiles: {
        create: {
          type: "person", displayName: "Jordan Taylor",
          bio: "Math & CS tutor. Dean's List, 3.9 GPA. Tutoring Calc I-III, Linear Algebra, Data Structures, and Intro CS. Patient and thorough explanations.",
          location: "Tuscaloosa, AL", status: "available", category: "tutor",
          campusRole: "tutor", department: "Mathematics",
          tags: ["tutor", "math", "calculus", "cs", "data-structures", "algebra"],
          services: { create: [
            { name: "Math Tutoring (1hr)", price: "$20/hr", duration: 60, isBookable: true, category: "Academic" },
            { name: "CS Tutoring (1hr)", price: "$25/hr", duration: 60, isBookable: true, category: "Academic" },
          ]},
          capabilities: { create: [{ type: "booking" }, { type: "availability" }, { type: "messaging" }] },
        },
      },
      messageSettings: { create: {} },
    },
  });
  console.log("  Jordan Taylor (Tutor) — " + tutorMath.id);

  // =====================================================
  // SUMMARY
  // =====================================================
  const profileCount = await prisma.profile.count();
  const capCount = await prisma.capability.count();
  const serviceCount = await prisma.service.count();
  const skillCount = await prisma.skill.count();
  const infoCount = await prisma.infoSection.count();
  const memCount = await prisma.userMemory.count();

  console.log("\n=============================================");
  console.log("AgentNet — Universal Entity Platform — Seeded!");
  console.log("");
  console.log("  Profiles:       " + profileCount);
  console.log("  Capabilities:   " + capCount);
  console.log("  Services:       " + serviceCount);
  console.log("  Skills:         " + skillCount);
  console.log("  Info Sections:  " + infoCount);
  console.log("  Memories:       " + memCount);
  console.log("");
  console.log("  Student login:  shelbeyousey@gmail.com / Born2007!");
  console.log("  Admin login:    sbyousey@crimson.ua.edu / Born2007!");
  console.log("  Other logins:   password123");
  console.log("=============================================");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });