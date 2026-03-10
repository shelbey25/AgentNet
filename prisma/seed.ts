import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding AgentNet — Bama Campus MVP...\n");

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
  // PLATFORM OWNER — Shelbey
  // =====================================================

  console.log("Creating platform owner...");

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
          bio: "Computer Science student at the University of Alabama. Building AgentNet — the campus AI platform.",
          location: "Tuscaloosa, AL",
          status: "available",
          category: "student",
          campusRole: "student",
          department: "Computer Science",
          tags: ["cs", "ai", "agentnet", "developer", "student"],
          skills: {
            create: [
              { name: "TypeScript", category: "Programming" },
              { name: "Next.js", category: "Programming" },
              { name: "AI / LLMs", category: "Technology" },
              { name: "Full-Stack Development", category: "Programming" },
            ],
          },
          capabilities: {
            create: [
              { type: "messaging" },
            ],
          },
        },
      },
      messageSettings: { create: {} },
    },
  });
  console.log("  Shelbey Ousey — " + shelbey.id);

  // =====================================================
  // CAMPUS PEOPLE — Professors
  // =====================================================

  console.log("Creating professors...");

  // Dr. Sarah Mitchell — CS Professor
  const profMitchell = await prisma.user.create({
    data: {
      email: "smitchell@ua.edu",
      passwordHash: pw,
      name: "Dr. Sarah Mitchell",
      role: "person",
      profiles: {
        create: {
          type: "person",
          displayName: "Dr. Sarah Mitchell",
          bio: "Associate Professor of Computer Science. Research focus: machine learning, natural language processing, and AI safety. Teaching CS 403 (AI), CS 201 (Data Structures), and CS 495 (ML Seminar).",
          location: "Tuscaloosa, AL",
          status: "available",
          category: "faculty",
          campusRole: "professor",
          department: "Computer Science",
          title: "Associate Professor",
          officeLocation: "Shelby Hall 3218",
          officeHours: "Mon/Wed 2:00-4:00 PM, or by appointment",
          tags: ["computer-science", "machine-learning", "nlp", "ai", "python"],
          isClaimable: true,
          services: {
            create: [
              { name: "Office Hours", description: "Drop-in advising for CS 403 and CS 201 students.", category: "Academic", duration: 20, isBookable: true },
              { name: "Research Meeting", description: "Discussion of ML/NLP research opportunities.", category: "Research", duration: 30, isBookable: true },
            ],
          },
          capabilities: {
            create: [
              { type: "booking" },
              { type: "availability" },
              { type: "messaging" },
            ],
          },
          infoSections: {
            create: [
              {
                section: "office_hours",
                title: "Office Hours",
                data: {
                  schedule: [
                    { day: "Monday", start: "14:00", end: "16:00", location: "Shelby Hall 3218" },
                    { day: "Wednesday", start: "14:00", end: "16:00", location: "Shelby Hall 3218" },
                  ],
                  notes: "No appointment needed during posted hours. For other times, book via the platform.",
                },
              },
              {
                section: "courses",
                title: "Current Courses",
                data: {
                  courses: [
                    { code: "CS 403", name: "Introduction to Artificial Intelligence", schedule: "MWF 10:00-10:50 AM", location: "Shelby 1103" },
                    { code: "CS 201", name: "Data Structures & Algorithms", schedule: "TR 2:00-3:15 PM", location: "Shelby 1103" },
                    { code: "CS 495", name: "Machine Learning Seminar", schedule: "F 3:00-4:30 PM", location: "Shelby 2218" },
                  ],
                },
              },
              {
                section: "research",
                title: "Research Areas",
                data: {
                  areas: ["Machine Learning", "Natural Language Processing", "AI Safety", "Responsible AI"],
                  lab: "UA Intelligent Systems Lab",
                  current_projects: [
                    { name: "Bias Detection in LLMs", description: "Developing tools to identify and mitigate bias in large language models." },
                    { name: "Campus AI Assistant", description: "Building intelligent assistants for university operations." },
                  ],
                  publications_url: "https://scholar.google.com/citations?user=example",
                },
              },
            ],
          },
        },
      },
      messageSettings: { create: {} },
    },
  });
  console.log("  Dr. Sarah Mitchell (CS) — " + profMitchell.id);

  // Dr. James Rivera — Business Professor
  const profRivera = await prisma.user.create({
    data: {
      email: "jrivera@ua.edu",
      passwordHash: pw,
      name: "Dr. James Rivera",
      role: "person",
      profiles: {
        create: {
          type: "person",
          displayName: "Dr. James Rivera",
          bio: "Professor of Finance at Culverhouse College of Business. Specializes in corporate finance, investment analysis, and fintech. Advisor for the Student Investment Fund.",
          location: "Tuscaloosa, AL",
          status: "available",
          category: "faculty",
          campusRole: "professor",
          department: "Finance",
          title: "Professor of Finance",
          officeLocation: "Bidgood Hall 326",
          officeHours: "Tue/Thu 10:00 AM-12:00 PM",
          tags: ["finance", "business", "investing", "fintech", "culverhouse"],
          isClaimable: true,
          services: {
            create: [
              { name: "Office Hours", description: "Open advising for FI 302 and FI 410 students.", category: "Academic", duration: 15, isBookable: true },
              { name: "Career Advising", description: "Finance career guidance and grad school advice.", category: "Career", duration: 20, isBookable: true },
            ],
          },
          capabilities: {
            create: [
              { type: "booking" },
              { type: "availability" },
              { type: "messaging" },
            ],
          },
          infoSections: {
            create: [
              {
                section: "office_hours",
                title: "Office Hours",
                data: {
                  schedule: [
                    { day: "Tuesday", start: "10:00", end: "12:00", location: "Bidgood Hall 326" },
                    { day: "Thursday", start: "10:00", end: "12:00", location: "Bidgood Hall 326" },
                  ],
                },
              },
              {
                section: "courses",
                title: "Current Courses",
                data: {
                  courses: [
                    { code: "FI 302", name: "Corporate Finance", schedule: "MWF 11:00-11:50 AM", location: "Bidgood 130" },
                    { code: "FI 410", name: "Investment Analysis", schedule: "TR 3:30-4:45 PM", location: "Bidgood 250" },
                  ],
                },
              },
            ],
          },
        },
      },
      messageSettings: { create: {} },
    },
  });
  console.log("  Dr. James Rivera (Finance) — " + profRivera.id);

  // Dr. Anika Patel — Engineering Professor
  const profPatel = await prisma.user.create({
    data: {
      email: "apatel@ua.edu",
      passwordHash: pw,
      name: "Dr. Anika Patel",
      role: "person",
      profiles: {
        create: {
          type: "person",
          displayName: "Dr. Anika Patel",
          bio: "Assistant Professor of Mechanical Engineering. Research in robotics, autonomous systems, and biomechanics. Leads the UA Robotics Lab.",
          location: "Tuscaloosa, AL",
          status: "available",
          category: "faculty",
          campusRole: "professor",
          department: "Mechanical Engineering",
          title: "Assistant Professor",
          officeLocation: "Hardaway Hall 208",
          officeHours: "Mon 1:00-3:00 PM, Fri 10:00 AM-12:00 PM",
          tags: ["engineering", "robotics", "mechanical", "autonomous-systems", "biomechanics"],
          isClaimable: true,
          services: {
            create: [
              { name: "Office Hours", description: "Advising for ME 360 and ME 495 students.", category: "Academic", duration: 20, isBookable: true },
              { name: "Lab Tour", description: "Tour of the UA Robotics Lab for prospective students.", category: "Research", duration: 45, isBookable: true },
            ],
          },
          capabilities: {
            create: [
              { type: "booking" },
              { type: "availability" },
              { type: "messaging" },
            ],
          },
          infoSections: {
            create: [
              {
                section: "office_hours",
                title: "Office Hours",
                data: {
                  schedule: [
                    { day: "Monday", start: "13:00", end: "15:00", location: "Hardaway Hall 208" },
                    { day: "Friday", start: "10:00", end: "12:00", location: "Hardaway Hall 208" },
                  ],
                },
              },
              {
                section: "research",
                title: "Research",
                data: {
                  areas: ["Robotics", "Autonomous Systems", "Biomechanics"],
                  lab: "UA Robotics Lab — Hardaway Hall 110",
                  current_projects: [
                    { name: "Soft Robotics for Rehabilitation", description: "Developing compliant robotic devices for physical therapy." },
                  ],
                },
              },
            ],
          },
        },
      },
      messageSettings: { create: {} },
    },
  });
  console.log("  Dr. Anika Patel (ME) — " + profPatel.id);

  // =====================================================
  // CAMPUS PEOPLE — Advisors
  // =====================================================

  console.log("\nCreating advisors...");

  // Lisa Nguyen — Academic Advisor
  const advisorLisa = await prisma.user.create({
    data: {
      email: "lnguyen@ua.edu",
      passwordHash: pw,
      name: "Lisa Nguyen",
      role: "person",
      profiles: {
        create: {
          type: "person",
          displayName: "Lisa Nguyen",
          bio: "Academic advisor for Computer Science and Data Science majors in the College of Engineering. Helps with course planning, degree audits, and graduation requirements.",
          location: "Tuscaloosa, AL",
          status: "available",
          category: "advising",
          campusRole: "advisor",
          department: "Computer Science",
          title: "Academic Advisor",
          officeLocation: "Houser Hall 127",
          officeHours: "Mon-Fri 9:00 AM-4:30 PM (by appointment)",
          tags: ["advising", "computer-science", "data-science", "degree-planning", "engineering"],
          services: {
            create: [
              { name: "Advising Appointment", description: "Course planning, degree audit, or registration help.", category: "Advising", duration: 30, isBookable: true },
              { name: "Quick Question", description: "Brief check-in for simple questions.", category: "Advising", duration: 10, isBookable: true },
            ],
          },
          capabilities: {
            create: [
              { type: "booking" },
              { type: "availability" },
              { type: "messaging" },
              { type: "service_requests" },
            ],
          },
          infoSections: {
            create: [
              {
                section: "services",
                title: "Advising Services",
                data: {
                  services: [
                    { name: "Course Planning", description: "Help selecting courses for next semester" },
                    { name: "Degree Audit Review", description: "Review your progress toward graduation" },
                    { name: "Major/Minor Declaration", description: "Help declaring or changing your major" },
                    { name: "Graduation Check", description: "Verify you are on track to graduate" },
                  ],
                },
              },
            ],
          },
        },
      },
      messageSettings: { create: {} },
    },
  });
  console.log("  Lisa Nguyen (CS Advisor) — " + advisorLisa.id);

  // Marcus Thompson — Career Advisor
  const advisorMarcus = await prisma.user.create({
    data: {
      email: "mthompson@ua.edu",
      passwordHash: pw,
      name: "Marcus Thompson",
      role: "person",
      profiles: {
        create: {
          type: "person",
          displayName: "Marcus Thompson",
          bio: "Career counselor at the UA Career Center. Specializes in resume reviews, interview prep, and connecting students with internships and employers. Former recruiter at a Fortune 500 company.",
          location: "Tuscaloosa, AL",
          status: "available",
          category: "career",
          campusRole: "advisor",
          department: "Career Center",
          title: "Senior Career Counselor",
          officeLocation: "Student Services Center 200",
          officeHours: "Mon-Thu 9:00 AM-5:00 PM, Fri 9:00 AM-3:00 PM",
          tags: ["career", "resume", "interview", "internship", "jobs", "networking"],
          services: {
            create: [
              { name: "Resume Review", description: "Get feedback on your resume from a career professional.", category: "Career", duration: 30, isBookable: true },
              { name: "Mock Interview", description: "Practice interviews with professional feedback.", category: "Career", duration: 45, isBookable: true },
              { name: "Career Coaching", description: "Explore career paths and job search strategies.", category: "Career", duration: 30, isBookable: true },
            ],
          },
          capabilities: {
            create: [
              { type: "booking" },
              { type: "availability" },
              { type: "messaging" },
              { type: "service_requests" },
            ],
          },
        },
      },
      messageSettings: { create: {} },
    },
  });
  console.log("  Marcus Thompson (Career Advisor) — " + advisorMarcus.id);

  // =====================================================
  // CAMPUS PEOPLE — Student Tutors
  // =====================================================

  console.log("\nCreating student tutors...");

  // Jordan Williams — CS/Math Tutor
  const tutorJordan = await prisma.user.create({
    data: {
      email: "jwilliams@crimson.ua.edu",
      passwordHash: pw,
      name: "Jordan Williams",
      role: "person",
      profiles: {
        create: {
          type: "person",
          displayName: "Jordan Williams",
          bio: "Junior CS major and peer tutor. Available for CS 100/101/201, Calculus I/II, and Discrete Math. 3.9 GPA. ACM club member.",
          location: "Tuscaloosa, AL",
          status: "available",
          category: "tutoring",
          campusRole: "tutor",
          department: "Computer Science",
          title: "Peer Tutor",
          tags: ["tutoring", "computer-science", "math", "calculus", "programming", "python", "java"],
          skills: {
            create: [
              { name: "Python", category: "Programming" },
              { name: "Java", category: "Programming" },
              { name: "Data Structures", category: "CS" },
              { name: "Calculus", category: "Math" },
              { name: "Discrete Math", category: "Math" },
            ],
          },
          services: {
            create: [
              { name: "CS Tutoring", description: "Help with CS 100, 101, 201 — Python and Java.", category: "Tutoring", price: "$20/hr", duration: 60, isBookable: true },
              { name: "Math Tutoring", description: "Calculus I, II, and Discrete Math.", category: "Tutoring", price: "$20/hr", duration: 60, isBookable: true },
              { name: "Code Review", description: "Review and debug your programming assignments.", category: "Tutoring", price: "$15/session", duration: 30, isBookable: true },
            ],
          },
          capabilities: {
            create: [
              { type: "booking" },
              { type: "availability" },
              { type: "messaging" },
              { type: "quotes" },
            ],
          },
        },
      },
      messageSettings: { create: {} },
    },
  });
  console.log("  Jordan Williams (CS/Math Tutor) — " + tutorJordan.id);

  // Maya Chen — Writing/English Tutor
  const tutorMaya = await prisma.user.create({
    data: {
      email: "mchen@crimson.ua.edu",
      passwordHash: pw,
      name: "Maya Chen",
      role: "person",
      profiles: {
        create: {
          type: "person",
          displayName: "Maya Chen",
          bio: "Senior English major and Writing Center tutor. I help with essays, research papers, lab reports, and personal statements. Any subject, any level.",
          location: "Tuscaloosa, AL",
          status: "available",
          category: "tutoring",
          campusRole: "tutor",
          department: "English",
          title: "Writing Center Tutor",
          tags: ["writing", "english", "essays", "research-papers", "grammar", "editing"],
          skills: {
            create: [
              { name: "Academic Writing", category: "Writing" },
              { name: "Research Papers", category: "Writing" },
              { name: "Essay Editing", category: "Writing" },
              { name: "APA/MLA Citation", category: "Writing" },
            ],
          },
          services: {
            create: [
              { name: "Writing Tutoring", description: "Help with essays, papers, and written assignments.", category: "Tutoring", price: "$18/hr", duration: 60, isBookable: true },
              { name: "Paper Review", description: "Detailed feedback on a draft before submission.", category: "Tutoring", price: "$25/paper", duration: 45, isBookable: true },
            ],
          },
          capabilities: {
            create: [
              { type: "booking" },
              { type: "availability" },
              { type: "messaging" },
              { type: "quotes" },
            ],
          },
        },
      },
      messageSettings: { create: {} },
    },
  });
  console.log("  Maya Chen (Writing Tutor) — " + tutorMaya.id);

  // Derek Brown — Chemistry/Biology Tutor
  const tutorDerek = await prisma.user.create({
    data: {
      email: "dbrown@crimson.ua.edu",
      passwordHash: pw,
      name: "Derek Brown",
      role: "person",
      profiles: {
        create: {
          type: "person",
          displayName: "Derek Brown",
          bio: "Pre-med junior tutoring in Chemistry, Biology, and Organic Chemistry. Study group organizer. MCAT score: 520.",
          location: "Tuscaloosa, AL",
          status: "available",
          category: "tutoring",
          campusRole: "tutor",
          department: "Chemistry",
          title: "Peer Tutor",
          tags: ["chemistry", "biology", "organic-chemistry", "pre-med", "science", "mcat"],
          skills: {
            create: [
              { name: "General Chemistry", category: "Science" },
              { name: "Organic Chemistry", category: "Science" },
              { name: "Biology", category: "Science" },
              { name: "MCAT Prep", category: "Test Prep" },
            ],
          },
          services: {
            create: [
              { name: "Chemistry Tutoring", description: "CH 101/102, Organic Chemistry I/II.", category: "Tutoring", price: "$22/hr", duration: 60, isBookable: true },
              { name: "Biology Tutoring", description: "BSC 108, BSC 114, Microbiology.", category: "Tutoring", price: "$22/hr", duration: 60, isBookable: true },
              { name: "Study Group Session", description: "Lead study group (2-5 students).", category: "Tutoring", price: "$10/person/hr", duration: 90, isBookable: true },
            ],
          },
          capabilities: {
            create: [
              { type: "booking" },
              { type: "availability" },
              { type: "messaging" },
              { type: "quotes" },
            ],
          },
        },
      },
      messageSettings: { create: {} },
    },
  });
  console.log("  Derek Brown (Science Tutor) — " + tutorDerek.id);

  // =====================================================
  // CAMPUS SITES — Dining Halls
  // =====================================================

  console.log("\nCreating dining sites...");

  // Lakeside Dining Hall
  const lakeside = await prisma.user.create({
    data: {
      email: "lakeside@dining.ua.edu",
      passwordHash: pw,
      name: "Lakeside Dining",
      role: "business",
      profiles: {
        create: {
          type: "site",
          displayName: "Lakeside Dining Hall",
          bio: "All-you-can-eat dining hall beside the lake. Features rotating stations: grill, pizza, salad bar, comfort food, international, and desserts. Accepts Dining Dollars and Bama Cash.",
          location: "Tuscaloosa, AL",
          status: "available",
          category: "dining",
          address: "500 Margaret Dr, Tuscaloosa, AL 35401",
          hours: "Mon-Fri 7am-9pm, Sat-Sun 10am-8pm",
          phone: "(205) 348-6847",
          tags: ["dining", "cafeteria", "meal-plan", "all-you-can-eat", "lakeside"],
          integrationType: "manual",
          paymentMode: "pay_on_pickup",
          capabilities: {
            create: [
              { type: "ordering" },
              { type: "messaging" },
            ],
          },
          infoSections: {
            create: [
              // Menu root — overview of available stations
              {
                section: "menu",
                title: "Today's Menu",
                data: {
                  note: "Menu rotates daily. All items included with meal plan swipe ($9.50 guest price).",
                  stations: ["grill", "pizza", "salad", "comfort", "international", "desserts"],
                },
              },
              // Menu subsections — one per station
              {
                section: "menu",
                subsection: "grill",
                title: "Grill Station",
                data: {
                  items: [
                    { id: "grilled_chicken", name: "Grilled Chicken Breast", description: "Seasoned and char-grilled" },
                    { id: "burger", name: "Cheeseburger", description: "1/4 lb patty with toppings bar" },
                    { id: "chicken_tenders", name: "Chicken Tenders", description: "Hand-breaded, 4 pc" },
                    { id: "veggie_burger", name: "Black Bean Veggie Burger", description: "Plant-based patty" },
                  ],
                },
              },
              {
                section: "menu",
                subsection: "pizza",
                title: "Pizza Station",
                data: {
                  items: [
                    { id: "cheese_pizza", name: "Cheese Pizza", description: "Fresh baked, by the slice" },
                    { id: "pepperoni_pizza", name: "Pepperoni Pizza", description: "Classic pepperoni" },
                    { id: "bbq_chicken_pizza", name: "BBQ Chicken Pizza", description: "Rotates daily" },
                  ],
                },
              },
              {
                section: "menu",
                subsection: "salad",
                title: "Salad Bar",
                data: {
                  items: [
                    { id: "caesar_salad", name: "Caesar Salad", description: "Romaine, croutons, parmesan" },
                    { id: "garden_salad", name: "Garden Salad", description: "Mixed greens, build your own" },
                    { id: "fruit_cup", name: "Fresh Fruit Cup", description: "Seasonal mix" },
                  ],
                },
              },
              {
                section: "menu",
                subsection: "comfort",
                title: "Comfort Station",
                data: {
                  items: [
                    { id: "pasta_marinara", name: "Pasta Marinara", description: "With garlic bread" },
                    { id: "mac_n_cheese", name: "Mac & Cheese", description: "Baked, creamy" },
                    { id: "chicken_pot_pie", name: "Chicken Pot Pie", description: "Homestyle" },
                  ],
                },
              },
              {
                section: "menu",
                subsection: "international",
                title: "International Station",
                data: {
                  items: [
                    { id: "stir_fry", name: "Vegetable Stir Fry", description: "Wok-tossed with soy glaze" },
                    { id: "chicken_tikka", name: "Chicken Tikka Masala", description: "With basmati rice" },
                    { id: "beef_tacos", name: "Street Tacos", description: "Corn tortillas, cilantro, onion" },
                  ],
                },
              },
              {
                section: "menu",
                subsection: "desserts",
                title: "Desserts",
                data: {
                  items: [
                    { id: "brownie", name: "Fudge Brownie", description: "Rich chocolate" },
                    { id: "cookie", name: "Chocolate Chip Cookie", description: "Warm, fresh-baked" },
                    { id: "soft_serve", name: "Soft Serve Ice Cream", description: "Vanilla, chocolate, swirl" },
                    { id: "fruit_cobbler", name: "Peach Cobbler", description: "Southern-style, warm" },
                  ],
                },
              },
              {
                section: "hours",
                title: "Operating Hours",
                data: {
                  hours: [
                    { day: "Monday-Friday", meals: { breakfast: "7:00-10:00 AM", lunch: "11:00 AM-2:00 PM", dinner: "5:00-9:00 PM" } },
                    { day: "Saturday-Sunday", meals: { brunch: "10:00 AM-2:00 PM", dinner: "5:00-8:00 PM" } },
                  ],
                },
              },
              {
                section: "location",
                title: "Location & Payment",
                data: {
                  address: "500 Margaret Dr",
                  building: "Lakeside",
                  nearest_parking: "Lakeside Parking Deck",
                  accepts: ["Dining Dollars", "Bama Cash", "Credit/Debit"],
                },
              },
              {
                section: "pricing",
                title: "Pricing",
                data: {
                  meal_plan_swipe: "Included with any meal plan",
                  guest_price: "$9.50 per meal",
                  dining_dollars: "Accepted",
                  bama_cash: "Accepted",
                },
              },
            ],
          },
        },
      },
      messageSettings: { create: {} },
    },
  });
  console.log("  Lakeside Dining Hall — " + lakeside.id);

  // Fresh Food Company (Burke Dining)
  const burke = await prisma.user.create({
    data: {
      email: "freshfood@dining.ua.edu",
      passwordHash: pw,
      name: "Fresh Food Company",
      role: "business",
      profiles: {
        create: {
          type: "site",
          displayName: "Fresh Food Company (Burke)",
          bio: "Dining hall in Burke Hall East. Known for made-to-order omelets, brick-oven pizza, and the fresh salad bar. Popular with West Campus residents.",
          location: "Tuscaloosa, AL",
          status: "available",
          category: "dining",
          address: "851 Hackberry Lane, Tuscaloosa, AL 35401",
          hours: "Mon-Fri 7am-9pm, Sat-Sun 10am-8pm",
          tags: ["dining", "cafeteria", "meal-plan", "burke", "west-campus"],
          integrationType: "manual",
          paymentMode: "pay_on_pickup",
          capabilities: {
            create: [
              { type: "ordering" },
              { type: "messaging" },
            ],
          },
          infoSections: {
            create: [
              // Menu root — overview of stations
              {
                section: "menu",
                title: "Today's Menu",
                data: {
                  note: "Meal plan swipe or $9.50 guest price.",
                  stations: ["breakfast", "pizza", "southern", "salad", "tex_mex", "comfort"],
                },
              },
              {
                section: "menu",
                subsection: "breakfast",
                title: "Breakfast Station",
                data: {
                  items: [
                    { id: "omelet", name: "Made-to-Order Omelet", description: "Choose your fillings: cheese, peppers, ham, mushrooms, spinach" },
                    { id: "pancakes", name: "Buttermilk Pancakes", description: "Stack of 3 with syrup and butter" },
                    { id: "breakfast_burrito", name: "Breakfast Burrito", description: "Eggs, cheese, sausage, salsa" },
                  ],
                },
              },
              {
                section: "menu",
                subsection: "pizza",
                title: "Brick Oven Pizza",
                data: {
                  items: [
                    { id: "brick_pizza", name: "Brick Oven Margherita", description: "Fresh mozzarella, basil, tomato" },
                    { id: "meat_lovers", name: "Meat Lovers", description: "Pepperoni, sausage, bacon, ham" },
                    { id: "veggie_pizza", name: "Garden Veggie", description: "Bell peppers, onions, mushrooms, olives" },
                  ],
                },
              },
              {
                section: "menu",
                subsection: "southern",
                title: "Southern Station",
                data: {
                  items: [
                    { id: "bbq_chicken", name: "BBQ Chicken", description: "Slow-smoked with cornbread" },
                    { id: "fried_catfish", name: "Fried Catfish", description: "Mississippi-style with hush puppies" },
                    { id: "collard_greens", name: "Collard Greens", description: "Slow-cooked with smoked turkey" },
                  ],
                },
              },
              {
                section: "menu",
                subsection: "salad",
                title: "Fresh Salad Bar",
                data: {
                  items: [
                    { id: "garden_salad", name: "Garden Salad Bar", description: "Build your own with 20+ toppings" },
                    { id: "grain_bowl", name: "Grain Bowl", description: "Quinoa, roasted veggies, choice of protein" },
                  ],
                },
              },
              {
                section: "menu",
                subsection: "tex_mex",
                title: "Tex-Mex Station",
                data: {
                  items: [
                    { id: "tacos", name: "Chicken Tacos", description: "Soft corn tortillas, pico, lime crema" },
                    { id: "burrito_bowl", name: "Burrito Bowl", description: "Rice, beans, choice of protein, toppings" },
                    { id: "quesadilla", name: "Cheese Quesadilla", description: "With salsa and sour cream" },
                  ],
                },
              },
              {
                section: "menu",
                subsection: "comfort",
                title: "Comfort Station",
                data: {
                  items: [
                    { id: "soup", name: "Soup of the Day", description: "Rotates daily — ask staff" },
                    { id: "grilled_cheese", name: "Grilled Cheese", description: "Sourdough with cheddar and gouda" },
                    { id: "chicken_noodle", name: "Chicken Noodle Soup", description: "Homemade" },
                  ],
                },
              },
              {
                section: "hours",
                title: "Operating Hours",
                data: {
                  hours: [
                    { day: "Monday-Friday", meals: { breakfast: "7:00-10:00 AM", lunch: "11:00 AM-2:00 PM", dinner: "5:00-9:00 PM" } },
                    { day: "Saturday-Sunday", meals: { brunch: "10:00 AM-2:00 PM", dinner: "5:00-8:00 PM" } },
                  ],
                },
              },
            ],
          },
        },
      },
      messageSettings: { create: {} },
    },
  });
  console.log("  Fresh Food Company (Burke) — " + burke.id);

  // =====================================================
  // CAMPUS SITES — Library & Rec
  // =====================================================

  console.log("\nCreating campus sites...");

  // Gorgas Library
  const gorgas = await prisma.user.create({
    data: {
      email: "gorgas@lib.ua.edu",
      passwordHash: pw,
      name: "Gorgas Library",
      role: "business",
      profiles: {
        create: {
          type: "site",
          displayName: "Gorgas Library",
          bio: "The University of Alabama's main library. Study rooms, computer labs, research databases, printing services, and the Sanford Media Center. Open late during finals.",
          location: "Tuscaloosa, AL",
          status: "available",
          category: "library",
          address: "501 University Blvd, Tuscaloosa, AL 35401",
          hours: "Mon-Thu 7am-2am, Fri 7am-6pm, Sat 10am-6pm, Sun 12pm-2am",
          phone: "(205) 348-6047",
          website: "https://lib.ua.edu",
          tags: ["library", "study", "research", "computers", "printing", "study-rooms"],
          capabilities: {
            create: [
              { type: "booking" },
              { type: "availability" },
              { type: "messaging" },
            ],
          },
          services: {
            create: [
              { name: "Study Room Reservation", description: "Reserve a group study room (2-8 people).", category: "Library", duration: 120, isBookable: true },
              { name: "Research Consultation", description: "Get help from a research librarian.", category: "Library", duration: 30, isBookable: true },
            ],
          },
          infoSections: {
            create: [
              {
                section: "hours",
                title: "Library Hours",
                data: {
                  hours: [
                    { day: "Monday-Thursday", open: "7:00 AM", close: "2:00 AM" },
                    { day: "Friday", open: "7:00 AM", close: "6:00 PM" },
                    { day: "Saturday", open: "10:00 AM", close: "6:00 PM" },
                    { day: "Sunday", open: "12:00 PM", close: "2:00 AM" },
                  ],
                  finals_hours: "24/7 during finals week",
                },
              },
              // Services root — overview
              {
                section: "services",
                title: "Library Services",
                data: {
                  overview: "Gorgas offers study rooms, computer labs, printing, research help, and interlibrary loans.",
                  categories: ["study_rooms", "computers", "printing", "research_help", "interlibrary_loan"],
                },
              },
              {
                section: "services",
                subsection: "study_rooms",
                title: "Study Rooms",
                data: {
                  count: 20,
                  capacity: "2-8 people per room",
                  how_to_reserve: "Book through AgentNet or at the front desk",
                  max_duration: "4 hours per reservation",
                  equipment: ["Whiteboard", "HDMI display", "Power outlets"],
                  floors: "2nd and 3rd floors",
                },
              },
              {
                section: "services",
                subsection: "computers",
                title: "Computer Lab",
                data: {
                  workstations: 100,
                  location: "1st floor, east wing",
                  software: ["Microsoft Office", "SPSS", "MATLAB", "Adobe Creative Cloud", "AutoCAD"],
                  hours: "Same as library hours",
                  note: "Login with your myBama credentials",
                },
              },
              {
                section: "services",
                subsection: "printing",
                title: "Printing Services",
                data: {
                  bw_price: "$0.05/page",
                  color_price: "$0.25/page",
                  payment: "ACTCard (Bama Cash)",
                  locations: ["1st floor near entrance", "2nd floor study area", "3rd floor quiet zone"],
                  formats: ["Letter", "Legal", "11x17"],
                  scanning: "Free scanning at all print stations",
                },
              },
              {
                section: "services",
                subsection: "research_help",
                title: "Research Help",
                data: {
                  description: "Get 1-on-1 help from a research librarian",
                  topics: ["Database searching", "Citation management", "Literature reviews", "Data analysis resources"],
                  how_to_book: "Schedule via lib.ua.edu/research-consult or drop in at the Reference Desk (2nd floor)",
                  walk_in_hours: "Mon-Fri 9 AM - 5 PM",
                },
              },
              {
                section: "services",
                subsection: "interlibrary_loan",
                title: "Interlibrary Loan",
                data: {
                  description: "Request books and articles from other university libraries",
                  turnaround: "Articles: 1-3 days, Books: 5-10 business days",
                  cost: "Free for UA students and faculty",
                  how_to_request: "Submit request at lib.ua.edu/ill",
                },
              },
            ],
          },
        },
      },
      messageSettings: { create: {} },
    },
  });
  console.log("  Gorgas Library — " + gorgas.id);

  // Student Recreation Center
  const recCenter = await prisma.user.create({
    data: {
      email: "rec@ua.edu",
      passwordHash: pw,
      name: "Student Recreation Center",
      role: "business",
      profiles: {
        create: {
          type: "site",
          displayName: "Student Recreation Center",
          bio: "UA's main fitness facility. Features weight rooms, cardio equipment, indoor pool, basketball/volleyball courts, climbing wall, and group fitness classes. Free for students with valid ACTCard.",
          location: "Tuscaloosa, AL",
          status: "available",
          category: "recreation",
          address: "680 University Blvd, Tuscaloosa, AL 35401",
          hours: "Mon-Fri 6am-10pm, Sat-Sun 9am-7pm",
          phone: "(205) 348-1456",
          website: "https://urec.sa.ua.edu",
          tags: ["gym", "fitness", "recreation", "swimming", "basketball", "climbing", "exercise"],
          capabilities: {
            create: [
              { type: "booking" },
              { type: "availability" },
              { type: "messaging" },
            ],
          },
          services: {
            create: [
              { name: "Group Fitness Class", description: "Yoga, Spin, HIIT, Zumba — see schedule.", category: "Fitness", duration: 60, isBookable: true },
              { name: "Court Reservation", description: "Reserve a basketball or volleyball court.", category: "Recreation", duration: 60, isBookable: true },
              { name: "Climbing Wall Session", description: "Indoor rock climbing (30ft wall).", category: "Recreation", duration: 60, isBookable: true },
            ],
          },
          infoSections: {
            create: [
              {
                section: "hours",
                title: "Hours",
                data: {
                  hours: [
                    { day: "Monday-Friday", open: "6:00 AM", close: "10:00 PM" },
                    { day: "Saturday-Sunday", open: "9:00 AM", close: "7:00 PM" },
                  ],
                  pool_hours: "Mon-Fri 6:00 AM-9:00 PM, Sat-Sun 10:00 AM-6:00 PM",
                },
              },
              // Facilities root
              {
                section: "facilities",
                title: "Facilities & Programs",
                data: {
                  overview: "Weight room, cardio deck, pool, courts, climbing wall, and group fitness classes.",
                  areas: ["weights", "cardio", "pool", "courts", "climbing", "group_fitness"],
                },
              },
              {
                section: "facilities",
                subsection: "weights",
                title: "Weight Room",
                data: {
                  floor: "1st",
                  equipment: ["Free weights (5-120 lb dumbbells)", "Squat racks (8)", "Bench press stations (6)", "Cable machines", "Smith machines (2)", "Deadlift platforms (4)"],
                  peak_hours: "4:00-7:00 PM weekdays",
                  tip: "Early mornings (6-8 AM) have the shortest wait times.",
                },
              },
              {
                section: "facilities",
                subsection: "cardio",
                title: "Cardio Deck",
                data: {
                  floor: "2nd",
                  equipment: ["Treadmills (30)", "Ellipticals (20)", "Stationary bikes (15)", "Rowing machines (8)", "Stair climbers (6)"],
                  features: "Each machine has a personal TV screen and phone charging port.",
                },
              },
              {
                section: "facilities",
                subsection: "pool",
                title: "Aquatic Center",
                data: {
                  pools: [
                    { name: "Lap Pool", description: "25-yard, 6 lanes", temperature: "78-80°F" },
                    { name: "Leisure Pool", description: "Warm water, great for relaxation", temperature: "84-86°F" },
                  ],
                  hours: "Mon-Fri 6:00 AM-9:00 PM, Sat-Sun 10:00 AM-6:00 PM",
                  requirements: "Swimsuit required. Goggles available at the front desk.",
                },
              },
              {
                section: "facilities",
                subsection: "courts",
                title: "Basketball & Volleyball Courts",
                data: {
                  courts: [
                    { type: "Basketball", count: 4, floor: "1st" },
                    { type: "Volleyball", count: 2, floor: "1st" },
                  ],
                  reservation: "Reserve 1 hour at the front desk or online. Walk-in if available.",
                  open_gym: "Courts are open gym when not reserved.",
                },
              },
              {
                section: "facilities",
                subsection: "climbing",
                title: "Climbing Wall",
                data: {
                  height: "30 feet",
                  routes: 15,
                  difficulty: "5.6 to 5.12 (beginner to advanced)",
                  gear: "Harness, shoes, and chalk provided free.",
                  belay_certification: "Free 30-min class required for first-time climbers.",
                },
              },
              {
                section: "facilities",
                subsection: "group_fitness",
                title: "Group Fitness Classes",
                data: {
                  classes: [
                    { name: "Yoga", schedule: "MWF 8:00 AM, TTh 5:30 PM", level: "All" },
                    { name: "Spin", schedule: "MWF 6:30 AM, TTh 4:30 PM", level: "All" },
                    { name: "HIIT", schedule: "TTh 6:00 PM", level: "Intermediate" },
                    { name: "Zumba", schedule: "MW 5:00 PM", level: "All" },
                    { name: "Pilates", schedule: "F 10:00 AM", level: "All" },
                    { name: "Boxing", schedule: "TTh 7:00 PM", level: "Intermediate" },
                  ],
                  note: "All classes free with student membership. Sign up at the front desk or online.",
                },
              },
            ],
          },
        },
      },
      messageSettings: { create: {} },
    },
  });
  console.log("  Student Recreation Center — " + recCenter.id);

  // =====================================================
  // OPPORTUNITIES — Research, Internships, Scholarships
  // =====================================================

  console.log("\nCreating opportunities...");

  // ML Research Assistant Position
  const researchML = await prisma.user.create({
    data: {
      email: "ml-research@cs.ua.edu",
      passwordHash: pw,
      name: "ML Research Position",
      role: "person",
      profiles: {
        create: {
          type: "opportunity",
          displayName: "Undergraduate ML Research Assistant",
          bio: "Join Dr. Mitchell's Intelligent Systems Lab as an undergraduate research assistant. Work on bias detection in large language models. Python/PyTorch experience required.",
          location: "Tuscaloosa, AL",
          status: "available",
          category: "research",
          department: "Computer Science",
          opportunityType: "research",
          deadline: new Date("2026-04-15"),
          eligibility: "CS juniors/seniors with Python experience and minimum 3.2 GPA",
          applyUrl: "https://cs.ua.edu/research/apply",
          compensation: "$15/hr, 10-15 hrs/week",
          tags: ["research", "machine-learning", "ai", "computer-science", "paid", "undergraduate"],
          isClaimable: false,
          capabilities: {
            create: [
              { type: "messaging" },
            ],
          },
          infoSections: {
            create: [
              {
                section: "details",
                title: "Position Details",
                data: {
                  lab: "UA Intelligent Systems Lab",
                  advisor: "Dr. Sarah Mitchell",
                  duration: "Fall 2026 semester (renewable)",
                  hours: "10-15 hours/week, flexible schedule",
                  requirements: [
                    "CS junior or senior",
                    "Python proficiency",
                    "Familiarity with PyTorch or TensorFlow",
                    "Minimum 3.2 GPA",
                    "Interest in ML/NLP research",
                  ],
                  benefits: [
                    "$15/hr compensation",
                    "Potential for co-authored publication",
                    "Conference travel support",
                    "Graduate school recommendation letter",
                  ],
                },
              },
            ],
          },
        },
      },
      messageSettings: { create: {} },
    },
  });
  console.log("  ML Research Position — " + researchML.id);

  // Software Engineering Internship
  const internSWE = await prisma.user.create({
    data: {
      email: "swe-intern@careers.ua.edu",
      passwordHash: pw,
      name: "SWE Internship",
      role: "person",
      profiles: {
        create: {
          type: "opportunity",
          displayName: "Software Engineering Internship — BBVA (Birmingham)",
          bio: "Summer 2026 software engineering internship at BBVA's Birmingham office. Full-stack development with React and Java. Housing stipend included.",
          location: "Birmingham, AL",
          status: "available",
          category: "technology",
          department: "Computer Science",
          opportunityType: "internship",
          deadline: new Date("2026-03-01"),
          eligibility: "CS or SE majors, rising juniors and seniors",
          applyUrl: "https://careers.bbva.com/summer2026",
          compensation: "$30/hr + $2,000 housing stipend",
          tags: ["internship", "software-engineering", "react", "java", "full-stack", "paid", "summer"],
          isClaimable: false,
          capabilities: {
            create: [
              { type: "messaging" },
            ],
          },
          infoSections: {
            create: [
              {
                section: "details",
                title: "Internship Details",
                data: {
                  company: "BBVA",
                  location: "Birmingham, AL (40 min from Tuscaloosa)",
                  duration: "May 18 to August 8, 2026 (12 weeks)",
                  tech_stack: ["React", "Java", "Spring Boot", "PostgreSQL", "AWS"],
                  requirements: [
                    "CS, SE, or related major",
                    "Rising junior or senior",
                    "Experience with at least one frontend framework",
                    "Familiarity with REST APIs",
                  ],
                  benefits: [
                    "$30/hr",
                    "$2,000 housing stipend",
                    "Return offer potential",
                    "Mentorship program",
                  ],
                },
              },
            ],
          },
        },
      },
      messageSettings: { create: {} },
    },
  });
  console.log("  SWE Internship (BBVA) — " + internSWE.id);

  // Robotics Research Position
  const researchRobotics = await prisma.user.create({
    data: {
      email: "robotics-research@eng.ua.edu",
      passwordHash: pw,
      name: "Robotics Research",
      role: "person",
      profiles: {
        create: {
          type: "opportunity",
          displayName: "Robotics Lab Research Assistant",
          bio: "Work with Dr. Patel on soft robotics for rehabilitation. Build and test compliant robotic devices. Great for ME/EE students interested in robotics.",
          location: "Tuscaloosa, AL",
          status: "available",
          category: "research",
          department: "Mechanical Engineering",
          opportunityType: "research",
          deadline: new Date("2026-05-01"),
          eligibility: "ME or EE juniors/seniors, CAD experience preferred",
          compensation: "Course credit (ME 499) or $14/hr",
          tags: ["research", "robotics", "engineering", "mechanical", "paid", "course-credit"],
          isClaimable: false,
          capabilities: {
            create: [
              { type: "messaging" },
            ],
          },
        },
      },
      messageSettings: { create: {} },
    },
  });
  console.log("  Robotics Research Position — " + researchRobotics.id);

  // Crimson Scholarship
  const scholarship = await prisma.user.create({
    data: {
      email: "scholarship@ua.edu",
      passwordHash: pw,
      name: "Crimson Achievement Award",
      role: "person",
      profiles: {
        create: {
          type: "opportunity",
          displayName: "Crimson Achievement Scholarship",
          bio: "Merit-based scholarship for Alabama residents. Covers full tuition for 4 years. Awarded to incoming freshmen with exceptional academic records and community involvement.",
          location: "Tuscaloosa, AL",
          status: "available",
          category: "financial_aid",
          department: "Financial Aid",
          opportunityType: "scholarship",
          deadline: new Date("2026-12-01"),
          eligibility: "Alabama residents, incoming freshmen, minimum 30 ACT/1400 SAT, 3.8 GPA",
          applyUrl: "https://scholarships.ua.edu/crimson-achievement",
          compensation: "Full tuition ($12,800/year for 4 years)",
          tags: ["scholarship", "financial-aid", "tuition", "merit", "freshman"],
          isClaimable: false,
          capabilities: {
            create: [
              { type: "messaging" },
            ],
          },
          infoSections: {
            create: [
              {
                section: "details",
                title: "Scholarship Details",
                data: {
                  value: "Full tuition ($12,800/year)",
                  duration: "4 years (renewable with 3.3 GPA)",
                  requirements: [
                    "Alabama resident",
                    "Incoming freshman",
                    "Minimum 30 ACT or 1400 SAT",
                    "Minimum 3.8 unweighted GPA",
                    "Demonstrated community involvement",
                  ],
                  application_steps: [
                    "Apply for admission to UA",
                    "Submit scholarship application at scholarships.ua.edu",
                    "Write 500-word essay on community leadership",
                    "Submit two letters of recommendation",
                  ],
                },
              },
            ],
          },
        },
      },
      messageSettings: { create: {} },
    },
  });
  console.log("  Crimson Achievement Scholarship — " + scholarship.id);

  // =====================================================
  // LOCAL BUSINESSES (preserved from v3)
  // =====================================================

  console.log("\nCreating local businesses...");

  // Crimson Cuts Barbershop
  const crimsonCuts = await prisma.user.create({
    data: {
      email: "info@crimsoncutsbarber.com",
      passwordHash: pw,
      name: "Crimson Cuts Barbershop",
      role: "business",
      profiles: {
        create: {
          type: "business",
          displayName: "Crimson Cuts Barbershop",
          bio: "Tuscaloosa's favorite barbershop since 2018. Walk-ins welcome. Clean fades, beard trims, and hot towel shaves. Right by campus on University Blvd.",
          location: "Tuscaloosa, AL",
          status: "available",
          category: "barber",
          integrationType: "manual",
          paymentMode: "pay_on_pickup",
          phone: "(205) 555-0101",
          website: "https://crimsoncutsbarber.com",
          address: "1201 University Blvd, Tuscaloosa, AL 35401",
          hours: "Mon-Fri 9am-7pm, Sat 8am-5pm, Sun Closed",
          tags: ["barber", "haircuts", "fades", "near-campus"],
          services: {
            create: [
              { name: "Men's Haircut", description: "Classic or modern cuts with hot towel.", category: "Barber", price: "$20", duration: 30, isBookable: true },
              { name: "Beard Trim", description: "Shape up and line work.", category: "Barber", price: "$10", duration: 15, isBookable: true },
              { name: "Haircut + Beard Combo", description: "Full service cut and beard.", category: "Barber", price: "$28", duration: 45, isBookable: true },
              { name: "Hot Towel Shave", description: "Premium straight razor shave.", category: "Barber", price: "$25", duration: 30, isBookable: true },
            ],
          },
          capabilities: {
            create: [
              { type: "booking" },
              { type: "availability" },
              { type: "messaging" },
              { type: "quotes" },
            ],
          },
          infoSections: {
            create: [
              // Services root
              {
                section: "services",
                title: "Services & Pricing",
                data: {
                  overview: "Full-service barbershop. Walk-ins welcome, appointments preferred.",
                  categories: ["haircuts", "beard", "specialty"],
                },
              },
              {
                section: "services",
                subsection: "haircuts",
                title: "Haircuts",
                data: {
                  items: [
                    { id: "mens_haircut", name: "Men's Haircut", price: 20, duration: 30, description: "Classic or modern cuts with hot towel" },
                    { id: "fade", name: "Skin Fade", price: 25, duration: 35, description: "Low, mid, or high taper" },
                    { id: "kids_cut", name: "Kids Cut (under 12)", price: 15, duration: 20, description: "Simple, clean cuts" },
                    { id: "buzz", name: "Buzz Cut", price: 12, duration: 15, description: "Uniform length" },
                  ],
                },
              },
              {
                section: "services",
                subsection: "beard",
                title: "Beard Services",
                data: {
                  items: [
                    { id: "beard_trim", name: "Beard Trim", price: 10, duration: 15, description: "Shape up and line work" },
                    { id: "hot_towel_shave", name: "Hot Towel Shave", price: 25, duration: 30, description: "Premium straight razor shave" },
                    { id: "beard_design", name: "Beard Design", price: 15, duration: 20, description: "Custom beard shaping" },
                  ],
                },
              },
              {
                section: "services",
                subsection: "specialty",
                title: "Specialty & Combos",
                data: {
                  items: [
                    { id: "cut_beard_combo", name: "Haircut + Beard Combo", price: 28, duration: 45, description: "Full service cut and beard" },
                    { id: "prom_package", name: "Event Package", price: 40, duration: 60, description: "Haircut, shave, styling for special occasions" },
                    { id: "hair_color", name: "Men's Color", price: 35, duration: 45, description: "Full color or highlights" },
                  ],
                },
              },
              {
                section: "hours",
                title: "Business Hours",
                data: {
                  hours: [
                    { day: "Monday-Friday", open: "9:00 AM", close: "7:00 PM" },
                    { day: "Saturday", open: "8:00 AM", close: "5:00 PM" },
                    { day: "Sunday", open: "Closed" },
                  ],
                },
              },
              {
                section: "policies",
                title: "Policies",
                data: {
                  walk_ins: "Welcome, but wait times vary (avg 15-30 min)",
                  appointments: "Book online at crimsoncutsbarber.com or via BamaAgent",
                  cancellation: "Please cancel 2 hours in advance",
                  payment: ["Cash", "Card", "Venmo", "Cash App"],
                },
              },
            ],
          },
        },
      },
      messageSettings: { create: {} },
    },
  });
  console.log("  Crimson Cuts Barbershop — " + crimsonCuts.id);

  // Black Warrior Coffee Co.
  const bwCoffee = await prisma.user.create({
    data: {
      email: "hello@blackwarriorcoffee.com",
      passwordHash: pw,
      name: "Black Warrior Coffee Co.",
      role: "business",
      profiles: {
        create: {
          type: "business",
          displayName: "Black Warrior Coffee Co.",
          bio: "Craft coffee and study-friendly vibes near the Quad. Espresso, cold brew, pastries, and sandwiches. Free Wi-Fi. Late hours during finals.",
          location: "Tuscaloosa, AL",
          status: "available",
          category: "coffee_shop",
          integrationType: "square",
          paymentMode: "checkout_url",
          phone: "(205) 555-0202",
          website: "https://blackwarriorcoffee.com",
          address: "620 Paul W Bryant Dr, Tuscaloosa, AL 35401",
          hours: "Mon-Fri 6am-10pm, Sat 7am-10pm, Sun 8am-8pm",
          tags: ["coffee", "study-spot", "near-campus", "wifi"],
          services: {
            create: [
              { name: "Drip Coffee", description: "House blend, single origin options.", category: "Coffee", price: "$3" },
              { name: "Espresso Drinks", description: "Lattes, cappuccinos, americanos.", category: "Coffee", price: "$4-6" },
              { name: "Cold Brew", description: "24-hour cold brew, nitro available.", category: "Coffee", price: "$5" },
            ],
          },
          capabilities: {
            create: [
              { type: "ordering" },
              { type: "messaging" },
            ],
          },
          infoSections: {
            create: [
              // Menu root
              {
                section: "menu",
                title: "Menu",
                data: {
                  overview: "Craft coffee, tea, pastries, and light bites. Free Wi-Fi.",
                  categories: ["hot_drinks", "cold_drinks", "food"],
                },
              },
              {
                section: "menu",
                subsection: "hot_drinks",
                title: "Hot Drinks",
                data: {
                  items: [
                    { id: "drip", name: "Drip Coffee", price: 3.00, sizes: ["S", "M", "L"], description: "House blend, Sumatran single-origin available" },
                    { id: "latte", name: "Latte", price: 4.50, sizes: ["S", "M", "L"], description: "Espresso + steamed milk. Add flavor $0.50" },
                    { id: "cappuccino", name: "Cappuccino", price: 4.50, sizes: ["S", "M"], description: "Equal parts espresso, steamed milk, foam" },
                    { id: "americano", name: "Americano", price: 3.50, sizes: ["S", "M", "L"], description: "Espresso + hot water" },
                    { id: "mocha", name: "Mocha", price: 5.00, sizes: ["S", "M", "L"], description: "Espresso, chocolate, steamed milk, whip" },
                    { id: "hot_chocolate", name: "Hot Chocolate", price: 3.50, sizes: ["S", "M"], description: "Rich cocoa with whipped cream" },
                  ],
                },
              },
              {
                section: "menu",
                subsection: "cold_drinks",
                title: "Cold Drinks",
                data: {
                  items: [
                    { id: "cold_brew", name: "Cold Brew", price: 5.00, sizes: ["M", "L"], description: "24-hour slow steeped" },
                    { id: "nitro", name: "Nitro Cold Brew", price: 5.50, sizes: ["M", "L"], description: "Nitrogen-infused, creamy" },
                    { id: "iced_latte", name: "Iced Latte", price: 5.00, sizes: ["M", "L"], description: "Espresso + cold milk over ice" },
                    { id: "lemonade", name: "Fresh Lemonade", price: 3.50, sizes: ["M", "L"], description: "House-made, seasonal fruit options" },
                    { id: "smoothie", name: "Fruit Smoothie", price: 6.00, sizes: ["M", "L"], description: "Mango, berry, or banana" },
                  ],
                },
              },
              {
                section: "menu",
                subsection: "food",
                title: "Food & Pastries",
                data: {
                  items: [
                    { id: "croissant", name: "Butter Croissant", price: 3.50, description: "Flaky, golden, fresh daily" },
                    { id: "muffin", name: "Blueberry Muffin", price: 3.00, description: "Made in-house" },
                    { id: "bagel", name: "Everything Bagel", price: 2.50, description: "With cream cheese $1 extra" },
                    { id: "avocado_toast", name: "Avocado Toast", price: 7.50, description: "Sourdough, avocado, everything seasoning, microgreens" },
                    { id: "breakfast_sandwich", name: "Breakfast Sandwich", price: 6.50, description: "Egg, cheese, bacon on ciabatta" },
                  ],
                },
              },
              {
                section: "hours",
                title: "Hours",
                data: {
                  hours: [
                    { day: "Monday-Friday", open: "6:00 AM", close: "10:00 PM" },
                    { day: "Saturday", open: "7:00 AM", close: "10:00 PM" },
                    { day: "Sunday", open: "8:00 AM", close: "8:00 PM" },
                  ],
                  finals_hours: "Open until midnight during finals week!",
                },
              },
            ],
          },
        },
      },
      messageSettings: { create: {} },
    },
  });
  console.log("  Black Warrior Coffee Co. — " + bwCoffee.id);

  // Tuscaloosa Chicken House
  const chickenHouse = await prisma.user.create({
    data: {
      email: "info@tuskcchicken.com",
      passwordHash: pw,
      name: "Tuscaloosa Chicken House",
      role: "business",
      profiles: {
        create: {
          type: "business",
          displayName: "Tuscaloosa Chicken House",
          bio: "Southern fried chicken, tenders, and sides. Campus delivery available. Open late on game days. Student meal deals available.",
          location: "Tuscaloosa, AL",
          status: "available",
          category: "restaurant",
          integrationType: "manual",
          paymentMode: "pay_on_pickup",
          phone: "(205) 555-0303",
          address: "1805 University Blvd, Tuscaloosa, AL 35401",
          hours: "Mon-Sat 11am-10pm, Sun 12pm-8pm",
          tags: ["restaurant", "chicken", "southern", "delivery", "near-campus"],
          capabilities: {
            create: [
              { type: "ordering" },
              { type: "messaging" },
              { type: "quotes" },
            ],
          },
          infoSections: {
            create: [
              // Menu root
              {
                section: "menu",
                title: "Menu",
                data: {
                  overview: "Southern fried chicken and sides. Student meal deals available.",
                  categories: ["mains", "wings", "sides", "drinks", "deals"],
                },
              },
              {
                section: "menu",
                subsection: "mains",
                title: "Main Plates",
                data: {
                  items: [
                    { id: "chicken_plate", name: "Fried Chicken Plate (3pc)", price: 9.99, description: "With 2 sides and a roll" },
                    { id: "tender_basket", name: "Chicken Tender Basket", price: 8.49, description: "4 tenders with fries and sauce" },
                    { id: "chicken_sandwich", name: "Chicken Sandwich", price: 7.49, description: "Fried or grilled, with slaw and pickles" },
                    { id: "catfish_plate", name: "Fried Catfish Plate", price: 10.99, description: "With hush puppies and 2 sides" },
                  ],
                },
              },
              {
                section: "menu",
                subsection: "wings",
                title: "Wings",
                data: {
                  items: [
                    { id: "wings_6", name: "Wings (6pc)", price: 7.99, description: "Choice of sauce" },
                    { id: "wings_12", name: "Wings (12pc)", price: 13.99, description: "Choice of sauce" },
                    { id: "wings_24", name: "Wings (24pc)", price: 24.99, description: "Party size — choice of 2 sauces" },
                  ],
                  sauces: ["Buffalo", "BBQ", "Lemon Pepper", "Garlic Parmesan", "Mango Habanero", "Plain"],
                },
              },
              {
                section: "menu",
                subsection: "sides",
                title: "Sides",
                data: {
                  items: [
                    { id: "mac_cheese", name: "Mac & Cheese", price: 2.99 },
                    { id: "coleslaw", name: "Coleslaw", price: 1.99 },
                    { id: "fries", name: "French Fries", price: 2.49 },
                    { id: "cornbread", name: "Cornbread (2 pc)", price: 1.49 },
                    { id: "baked_beans", name: "Baked Beans", price: 2.49 },
                    { id: "green_beans", name: "Green Beans", price: 2.49 },
                  ],
                },
              },
              {
                section: "menu",
                subsection: "drinks",
                title: "Drinks",
                data: {
                  items: [
                    { id: "sweet_tea", name: "Sweet Tea", price: 1.99, sizes: ["M", "L"] },
                    { id: "unsweet_tea", name: "Unsweet Tea", price: 1.99, sizes: ["M", "L"] },
                    { id: "lemonade", name: "Lemonade", price: 2.49, sizes: ["M", "L"] },
                    { id: "fountain", name: "Fountain Drink", price: 1.99, sizes: ["M", "L"] },
                  ],
                },
              },
              {
                section: "menu",
                subsection: "deals",
                title: "Student Deals",
                data: {
                  items: [
                    { id: "student_deal", name: "Student Meal Deal", price: 6.99, description: "2 tenders, fries, drink — show student ID" },
                    { id: "game_day_bucket", name: "Game Day Bucket", price: 19.99, description: "12 tenders, 2 large sides, 4 sauces — game days only" },
                  ],
                  note: "Must show valid UA student ID for student deals.",
                },
              },
              {
                section: "hours",
                title: "Hours",
                data: {
                  hours: [
                    { day: "Monday-Saturday", open: "11:00 AM", close: "10:00 PM" },
                    { day: "Sunday", open: "12:00 PM", close: "8:00 PM" },
                  ],
                  game_day: "Open until midnight on home game days!",
                },
              },
              {
                section: "delivery",
                title: "Delivery Info",
                data: {
                  campus_delivery: true,
                  delivery_fee: "$3.00",
                  minimum_order: "$15.00",
                  delivery_area: "UA campus and surrounding area (2 mi radius)",
                  estimated_time: "30-45 minutes",
                },
              },
            ],
          },
        },
      },
      messageSettings: { create: {} },
    },
  });
  console.log("  Tuscaloosa Chicken House — " + chickenHouse.id);

  // =====================================================
  // STUDENT SERVICE PROVIDERS
  // =====================================================

  console.log("\nCreating student service providers...");

  // Ashley Morgan — Hair Stylist
  const ashley = await prisma.user.create({
    data: {
      email: "ashley@crimson.ua.edu",
      passwordHash: pw,
      name: "Ashley Morgan",
      role: "person",
      profiles: {
        create: {
          type: "person",
          displayName: "Ashley Morgan",
          bio: "Licensed cosmetologist and UA student. Specializing in braids, locs, and natural hair. Mobile — I come to your dorm or apartment!",
          location: "Tuscaloosa, AL",
          status: "available",
          category: "hair",
          campusRole: "student",
          department: "Human Environmental Sciences",
          tags: ["hair", "braids", "locs", "natural-hair", "mobile", "student"],
          skills: {
            create: [
              { name: "Braiding", category: "Hair" },
              { name: "Locs", category: "Hair" },
              { name: "Hair Coloring", category: "Hair" },
              { name: "Natural Hair Care", category: "Hair" },
            ],
          },
          services: {
            create: [
              { name: "Box Braids", description: "Medium to jumbo box braids.", category: "Hair", price: "$120-200", duration: 180, isBookable: true },
              { name: "Loc Maintenance", description: "Retwist and style for existing locs.", category: "Hair", price: "$60-100", duration: 90, isBookable: true },
              { name: "Haircut & Style", description: "Cut, wash, and style.", category: "Hair", price: "$25-45", duration: 60, isBookable: true },
            ],
          },
          capabilities: {
            create: [
              { type: "booking" },
              { type: "availability" },
              { type: "messaging" },
              { type: "quotes" },
            ],
          },
        },
      },
      messageSettings: { create: {} },
    },
  });
  console.log("  Ashley Morgan (Hair) — " + ashley.id);

  // Devon Brooks — Personal Trainer
  const devon = await prisma.user.create({
    data: {
      email: "devon@crimson.ua.edu",
      passwordHash: pw,
      name: "Devon Brooks",
      role: "person",
      profiles: {
        create: {
          type: "person",
          displayName: "Devon Brooks",
          bio: "Certified personal trainer and UA kinesiology student. Workouts at the Rec Center or outdoors. First session free! Helping you hit your fitness goals.",
          location: "Tuscaloosa, AL",
          status: "available",
          category: "fitness",
          campusRole: "student",
          department: "Kinesiology",
          tags: ["fitness", "personal-training", "gym", "nutrition", "student"],
          skills: {
            create: [
              { name: "Personal Training", category: "Fitness" },
              { name: "Nutrition Coaching", category: "Fitness" },
              { name: "Weight Training", category: "Fitness" },
              { name: "HIIT", category: "Fitness" },
            ],
          },
          services: {
            create: [
              { name: "Personal Training Session", description: "1-on-1 workout at the Rec Center.", category: "Fitness", price: "$40/session", duration: 60, isBookable: true },
              { name: "Nutrition Plan", description: "Customized meal plan based on your goals.", category: "Fitness", price: "$50", duration: 30, isBookable: true },
              { name: "Group Fitness", description: "Small group workout (2-4 people).", category: "Fitness", price: "$15/person", duration: 60, isBookable: true },
            ],
          },
          capabilities: {
            create: [
              { type: "booking" },
              { type: "availability" },
              { type: "messaging" },
              { type: "quotes" },
            ],
          },
        },
      },
      messageSettings: { create: {} },
    },
  });
  console.log("  Devon Brooks (Trainer) — " + devon.id);

  // =====================================================
  // SAMPLE DATA
  // =====================================================

  const advisorProfile = await prisma.profile.findFirst({ where: { userId: advisorMarcus.id } });
  const tutorProfile = await prisma.profile.findFirst({ where: { userId: tutorJordan.id } });

  if (advisorProfile && tutorProfile) {
    await prisma.message.create({
      data: {
        senderId: advisorMarcus.id,
        recipientId: tutorJordan.id,
        subject: "CS Tutoring Position Available",
        body: "Hey Jordan, the CS department is expanding their tutoring program and we're looking for experienced tutors. Would you be interested in a paid position? $15/hr, 10 hrs/week. Let me know!",
      },
    });
    console.log("\n  Sample message created");
  }

  // =====================================================
  // ENABLE WEBHOOKS ON ALL PROFILES
  // =====================================================

  const WEBHOOK_URL = "https://primary-production-bbd3.up.railway.app/webhook/88f8fef2-0ecf-417c-9979-ef80de0a59cc";
  const ALL_WEBHOOK_EVENTS = ["ordering", "booking", "messaging", "service_requests", "quotes", "availability"];

  const webhookResult = await prisma.profile.updateMany({
    data: {
      webhookUrl: WEBHOOK_URL,
      webhookEnabled: true,
      enabledWebhookEvents: ALL_WEBHOOK_EVENTS,
    },
  });
  console.log(`\n  Webhooks enabled on ${webhookResult.count} profiles → ${WEBHOOK_URL}`);

  // =====================================================
  // SUMMARY
  // =====================================================

  const profileCount = await prisma.profile.count();
  const capCount = await prisma.capability.count();
  const serviceCount = await prisma.service.count();
  const skillCount = await prisma.skill.count();
  const infoCount = await prisma.infoSection.count();

  console.log("\n=============================================");
  console.log("AgentNet Bama Campus MVP — Seeded!");
  console.log("");
  console.log("  Profiles:      " + profileCount);
  console.log("    Shelbey:     1 (platform owner)");
  console.log("    Professors:  3");
  console.log("    Advisors:    2");
  console.log("    Tutors:      3");
  console.log("    Sites:       4 (dining, library, rec)");
  console.log("    Opportunities: 4 (research, internship, scholarship)");
  console.log("    Businesses:  3");
  console.log("    Students:    2 (service providers)");
  console.log("");
  console.log("  Capabilities:  " + capCount);
  console.log("  Services:      " + serviceCount);
  console.log("  Skills:        " + skillCount);
  console.log("  Info Sections: " + infoCount);
  console.log("");
  console.log("  Webhooks:      ALL profiles → n8n webhook");
  console.log("  Shelbey login: shelbeyousey@gmail.com / Born2007!");
  console.log("  Other logins:  password123");
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
