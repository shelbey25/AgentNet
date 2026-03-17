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
  // ACADEMIC ADVISING — UA-Specific
  // =====================================================

  console.log("\nCreating academic advising entities...");

  // ─── 1. UA College of Engineering Advising Center (site) ───

  const engAdvising = await prisma.user.create({
    data: {
      email: "eng-advising@ua.edu",
      passwordHash: pw,
      name: "UA Engineering Advising",
      role: "business",
      profiles: {
        create: {
          type: "site",
          displayName: "UA College of Engineering Advising Center",
          bio: "Central academic advising hub for all College of Engineering majors — CS, ME, EE, CE, ChE, and AEM. Offers degree audits, course planning, major/minor declaration, registration holds resolution, and graduation clearance. Walk-ins welcome during open advising hours or book an appointment online.",
          location: "Tuscaloosa, AL",
          status: "available",
          category: "advising",
          address: "Houser Hall 127, Tuscaloosa, AL 35487",
          hours: "Mon-Fri 8:00 AM-5:00 PM",
          phone: "(205) 348-1644",
          website: "https://eng.ua.edu/advising",
          tags: ["advising", "engineering", "degree-planning", "registration", "course-planning", "graduation", "academic"],
          services: {
            create: [
              { name: "Advising Appointment", description: "Full advising session — course planning, degree audit, or registration issues.", category: "Advising", duration: 30, isBookable: true },
              { name: "Quick Question Drop-In", description: "Walk-in for brief questions (no appointment needed).", category: "Advising", duration: 10, isBookable: false },
              { name: "Degree Audit Review", description: "Review your DegreeWorks audit and map remaining requirements.", category: "Advising", duration: 30, isBookable: true },
              { name: "Major/Minor Declaration", description: "Help declaring, adding, or changing your major or minor.", category: "Advising", duration: 20, isBookable: true },
              { name: "Pre-Registration Review", description: "Verify course selections before registration opens.", category: "Advising", duration: 20, isBookable: true },
              { name: "Graduation Clearance Check", description: "Verify all requirements are met for graduation.", category: "Advising", duration: 30, isBookable: true },
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
              // ── Overview
              {
                section: "services",
                title: "Advising Services Overview",
                data: {
                  overview: "The Engineering Advising Center supports all undergraduate engineering students with degree planning, course scheduling, registration assistance, and graduation clearance.",
                  departments_served: ["Computer Science", "Mechanical Engineering", "Electrical & Computer Engineering", "Civil Engineering", "Chemical Engineering", "Aerospace Engineering & Mechanics"],
                  tools: [
                    { name: "DegreeWorks", description: "Online degree audit tool — check your progress in myBama" },
                    { name: "Course Catalog", description: "Full UA course listings at catalog.ua.edu" },
                    { name: "Schedule Builder", description: "Build and preview schedules before registration" },
                  ],
                },
              },
              // ── Registration process
              {
                section: "registration",
                title: "Registration Guide",
                data: {
                  process: [
                    { step: 1, action: "Check your registration time ticket in myBama", detail: "Under Student tab → Registration → Time Ticket" },
                    { step: 2, action: "Run your DegreeWorks audit", detail: "Identify remaining required courses" },
                    { step: 3, action: "Meet with your advisor (required for freshmen/sophomores)", detail: "Advisor removes your hold after reviewing your plan" },
                    { step: 4, action: "Build your schedule in Schedule Builder", detail: "Check for time conflicts and seat availability" },
                    { step: 5, action: "Register via myBama when your time ticket opens", detail: "Add CRNs or use schedule builder to push directly" },
                    { step: 6, action: "Verify enrollment on your class schedule", detail: "Confirm all sections are correct, check waitlists" },
                  ],
                  important_deadlines: {
                    fall_2026: {
                      priority_registration: "Mar 23 - Apr 3, 2026",
                      open_registration: "Apr 6 - Aug 21, 2026",
                      add_drop: "Aug 19-25, 2026",
                      last_day_to_withdraw: "Oct 16, 2026",
                    },
                    spring_2027: {
                      priority_registration: "Oct 19 - Oct 30, 2026",
                      open_registration: "Nov 2, 2026 - Jan 8, 2027",
                      add_drop: "Jan 6-12, 2027",
                    },
                  },
                  common_holds: [
                    { hold: "Advising Hold", resolution: "Meet with your assigned advisor to get it cleared" },
                    { hold: "Financial Hold", resolution: "Contact Student Account Services — 205-348-5350" },
                    { hold: "Immunization Hold", resolution: "Submit records to Student Health Center" },
                    { hold: "Orientation Hold", resolution: "Complete Bama Bound orientation" },
                  ],
                },
              },
              // ── CS degree requirements
              {
                section: "degrees",
                title: "Degree Programs",
                data: {
                  note: "Detailed degree plans by major. Browse subsections for specific departments.",
                  programs: ["Computer Science", "Mechanical Engineering", "Electrical & Computer Engineering", "Civil Engineering", "Chemical Engineering"],
                },
              },
              {
                section: "degrees",
                subsection: "computer_science",
                title: "BS Computer Science — Degree Requirements",
                data: {
                  degree: "Bachelor of Science in Computer Science",
                  college: "College of Engineering",
                  total_credits: 124,
                  core_requirements: {
                    math: [
                      { code: "MATH 125", name: "Calculus I", credits: 4, prereqs: [] },
                      { code: "MATH 126", name: "Calculus II", credits: 4, prereqs: ["MATH 125"] },
                      { code: "MATH 227", name: "Calculus III", credits: 4, prereqs: ["MATH 126"] },
                      { code: "MATH 301", name: "Discrete Mathematics", credits: 3, prereqs: ["MATH 125"] },
                      { code: "MATH 355", name: "Linear Algebra", credits: 3, prereqs: ["MATH 126"] },
                      { code: "ST 260", name: "Statistics", credits: 3, prereqs: ["MATH 126"] },
                    ],
                    science: [
                      { code: "PH 101", name: "General Physics I", credits: 4, prereqs: ["MATH 125"] },
                      { code: "PH 102", name: "General Physics II", credits: 4, prereqs: ["PH 101", "MATH 126"] },
                    ],
                    cs_core: [
                      { code: "CS 100", name: "Computer Science Concepts", credits: 1, prereqs: [] },
                      { code: "CS 101", name: "Intro to CS (Python)", credits: 3, prereqs: [] },
                      { code: "CS 200", name: "Object-Oriented Programming (Java)", credits: 3, prereqs: ["CS 101"] },
                      { code: "CS 201", name: "Data Structures & Algorithms", credits: 3, prereqs: ["CS 200", "MATH 125"] },
                      { code: "CS 250", name: "Computer Organization", credits: 3, prereqs: ["CS 200"] },
                      { code: "CS 260", name: "Foundations of Software Engineering", credits: 3, prereqs: ["CS 201"] },
                      { code: "CS 300", name: "Operating Systems", credits: 3, prereqs: ["CS 250", "CS 201"] },
                      { code: "CS 302", name: "Database Systems", credits: 3, prereqs: ["CS 201"] },
                      { code: "CS 360", name: "Computer Networks", credits: 3, prereqs: ["CS 250"] },
                      { code: "CS 403", name: "Intro to AI", credits: 3, prereqs: ["CS 201", "MATH 301", "ST 260"] },
                      { code: "CS 470", name: "Compiler Design", credits: 3, prereqs: ["CS 250", "CS 201"] },
                    ],
                    cs_electives: {
                      required_count: 4,
                      note: "Choose 4 courses (12 credits) from CS 400-level electives",
                      options: [
                        { code: "CS 410", name: "Software Engineering", prereqs: ["CS 260"] },
                        { code: "CS 415", name: "Computer Graphics", prereqs: ["CS 201", "MATH 227"] },
                        { code: "CS 420", name: "Computer Security", prereqs: ["CS 300", "CS 360"] },
                        { code: "CS 426", name: "Parallel Computing", prereqs: ["CS 300"] },
                        { code: "CS 430", name: "Theory of Languages", prereqs: ["CS 201", "MATH 301"] },
                        { code: "CS 457", name: "Machine Learning", prereqs: ["CS 403", "MATH 355", "ST 260"] },
                        { code: "CS 460", name: "Computer Vision", prereqs: ["CS 403", "MATH 355"] },
                        { code: "CS 467", name: "Deep Learning", prereqs: ["CS 457"] },
                        { code: "CS 470", name: "Compiler Design", prereqs: ["CS 250", "CS 201"] },
                        { code: "CS 495", name: "Capstone Project", prereqs: ["CS 260", "senior standing"] },
                      ],
                    },
                  },
                  recommended_sequence: [
                    {
                      semester: "Freshman Fall",
                      courses: ["CS 100", "CS 101", "MATH 125", "EN 101", "General Elective"],
                      credits: 15,
                    },
                    {
                      semester: "Freshman Spring",
                      courses: ["CS 200", "MATH 126", "PH 101", "EN 102", "General Elective"],
                      credits: 16,
                    },
                    {
                      semester: "Sophomore Fall",
                      courses: ["CS 201", "CS 250", "MATH 227", "MATH 301", "Humanities Elective"],
                      credits: 16,
                    },
                    {
                      semester: "Sophomore Spring",
                      courses: ["CS 260", "CS 302", "MATH 355", "PH 102", "ST 260"],
                      credits: 16,
                    },
                    {
                      semester: "Junior Fall",
                      courses: ["CS 300", "CS 360", "CS 403", "CS Elective 1", "Social Science Elective"],
                      credits: 15,
                    },
                    {
                      semester: "Junior Spring",
                      courses: ["CS 470", "CS Elective 2", "CS Elective 3", "Fine Arts Elective", "Free Elective"],
                      credits: 15,
                    },
                    {
                      semester: "Senior Fall",
                      courses: ["CS Elective 4", "CS 495 (Capstone)", "Free Elective", "Free Elective", "Free Elective"],
                      credits: 15,
                    },
                    {
                      semester: "Senior Spring",
                      courses: ["Free Elective", "Free Elective", "Free Elective", "Free Elective", "Free Elective"],
                      credits: 15,
                    },
                  ],
                  graduation_requirements: {
                    min_gpa: 2.0,
                    min_major_gpa: 2.0,
                    max_d_credits_in_major: 6,
                    residency: "30 of last 36 credits must be at UA",
                    writing: "W-course requirement (2 W-designated courses)",
                  },
                },
              },
              {
                section: "degrees",
                subsection: "mechanical_engineering",
                title: "BS Mechanical Engineering — Degree Requirements",
                data: {
                  degree: "Bachelor of Science in Mechanical Engineering",
                  college: "College of Engineering",
                  total_credits: 128,
                  core_requirements: {
                    math: [
                      { code: "MATH 125", name: "Calculus I", credits: 4 },
                      { code: "MATH 126", name: "Calculus II", credits: 4 },
                      { code: "MATH 227", name: "Calculus III", credits: 4 },
                      { code: "MATH 238", name: "Differential Equations", credits: 3 },
                    ],
                    science: [
                      { code: "PH 101", name: "General Physics I", credits: 4 },
                      { code: "PH 102", name: "General Physics II", credits: 4 },
                      { code: "CH 101", name: "General Chemistry I", credits: 4 },
                    ],
                    engineering_core: [
                      { code: "ME 200", name: "Statics", credits: 3, prereqs: ["PH 101", "MATH 126"] },
                      { code: "ME 201", name: "Dynamics", credits: 3, prereqs: ["ME 200"] },
                      { code: "ME 210", name: "Thermodynamics I", credits: 3, prereqs: ["PH 101", "MATH 126"] },
                      { code: "ME 250", name: "Mechanics of Materials", credits: 3, prereqs: ["ME 200"] },
                      { code: "ME 310", name: "Fluid Mechanics", credits: 3, prereqs: ["ME 201", "ME 210"] },
                      { code: "ME 320", name: "Heat Transfer", credits: 3, prereqs: ["ME 310"] },
                      { code: "ME 360", name: "Machine Design", credits: 3, prereqs: ["ME 250"] },
                      { code: "ME 450", name: "Controls & Instrumentation", credits: 3, prereqs: ["ME 201", "MATH 238"] },
                      { code: "ME 495", name: "Senior Design Capstone", credits: 3, prereqs: ["senior standing"] },
                    ],
                  },
                  recommended_sequence: [
                    { semester: "Freshman Fall", courses: ["MATH 125", "CH 101", "EN 101", "ENGR 111", "GEN ED"], credits: 16 },
                    { semester: "Freshman Spring", courses: ["MATH 126", "PH 101", "EN 102", "CS 101", "GEN ED"], credits: 16 },
                    { semester: "Sophomore Fall", courses: ["MATH 227", "PH 102", "ME 200", "ENGR 200", "GEN ED"], credits: 16 },
                    { semester: "Sophomore Spring", courses: ["MATH 238", "ME 201", "ME 210", "ME 250", "GEN ED"], credits: 16 },
                    { semester: "Junior Fall", courses: ["ME 310", "ME 360", "ME Elective", "Lab", "GEN ED"], credits: 16 },
                    { semester: "Junior Spring", courses: ["ME 320", "ME 450", "ME Elective", "Lab", "GEN ED"], credits: 16 },
                    { semester: "Senior Fall", courses: ["ME 495 (Capstone I)", "ME Elective", "ME Elective", "Free Elective"], credits: 16 },
                    { semester: "Senior Spring", courses: ["ME 495 (Capstone II)", "ME Elective", "Free Elective", "Free Elective"], credits: 16 },
                  ],
                },
              },
              // ── Prerequisite dependency graph (CS)
              {
                section: "prerequisites",
                title: "Prerequisite Chains",
                data: {
                  note: "Course prerequisite dependency graphs. Browse subsections for specific departments.",
                  departments: ["computer_science", "mechanical_engineering"],
                },
              },
              {
                section: "prerequisites",
                subsection: "computer_science",
                title: "CS Prerequisite Dependency Graph",
                data: {
                  description: "Shows what you must complete before taking each CS course. Use this to plan your path.",
                  chains: [
                    { target: "CS 200", requires: ["CS 101"], note: "OOP builds on Python fundamentals" },
                    { target: "CS 201", requires: ["CS 200", "MATH 125"], note: "Data structures — the gateway course" },
                    { target: "CS 250", requires: ["CS 200"], note: "Computer org — can take alongside CS 201" },
                    { target: "CS 260", requires: ["CS 201"], note: "Software engineering fundamentals" },
                    { target: "CS 300", requires: ["CS 250", "CS 201"], note: "OS — heavy prerequisite load" },
                    { target: "CS 302", requires: ["CS 201"], note: "Databases — popular elective path" },
                    { target: "CS 360", requires: ["CS 250"], note: "Networks — pairs well with CS 300" },
                    { target: "CS 403", requires: ["CS 201", "MATH 301", "ST 260"], note: "AI — needs math foundations" },
                    { target: "CS 420", requires: ["CS 300", "CS 360"], note: "Security — needs OS and networks" },
                    { target: "CS 457", requires: ["CS 403", "MATH 355", "ST 260"], note: "ML — heavy math prereqs" },
                    { target: "CS 467", requires: ["CS 457"], note: "Deep learning — must complete ML first" },
                    { target: "CS 495", requires: ["CS 260", "senior standing"], note: "Capstone — apply early as seats are limited" },
                  ],
                  critical_paths: [
                    {
                      name: "AI/ML Track",
                      sequence: ["CS 101", "CS 200", "CS 201", "MATH 301 + ST 260 (parallel)", "CS 403", "MATH 355", "CS 457", "CS 467"],
                      earliest_ml: "Junior Spring (if MATH 301 taken Sophomore Fall)",
                    },
                    {
                      name: "Systems Track",
                      sequence: ["CS 101", "CS 200", "CS 250", "CS 201", "CS 300 + CS 360 (parallel)", "CS 420"],
                      earliest_security: "Junior Spring",
                    },
                    {
                      name: "Software Engineering Track",
                      sequence: ["CS 101", "CS 200", "CS 201", "CS 260", "CS 302", "CS 410", "CS 495"],
                      earliest_capstone: "Senior Fall",
                    },
                  ],
                },
              },
              // ── Policies
              {
                section: "policies",
                title: "Academic Policies",
                data: {
                  policies: [
                    { name: "Advising Hold", description: "Freshmen and sophomores MUST meet with an advisor before registering each semester. The hold is placed automatically and only your assigned advisor can clear it." },
                    { name: "Repeat Policy", description: "You may repeat a course once. The higher grade replaces the lower in GPA calculation. Third attempts require dean approval." },
                    { name: "Withdrawal", description: "You can withdraw (W grade) up to the published deadline (~week 10). After that, instructor approval is needed. W does not affect GPA." },
                    { name: "Academic Probation", description: "GPA below 2.0 triggers probation. Two consecutive terms on probation may result in suspension." },
                    { name: "Credit Overload", description: "More than 18 credits requires advisor approval. Engineering students need a 3.0+ cumulative GPA and advisor sign-off." },
                    { name: "AP/Transfer Credits", description: "AP scores of 4+ are generally accepted. Transfer credits evaluated by the registrar. Some courses require departmental approval." },
                    { name: "Minor Declaration", description: "Must be declared by the end of junior year. Requires 18 credits in the minor field, at least 6 at the 300+ level." },
                  ],
                },
              },
              // ── Hours
              {
                section: "hours",
                title: "Advising Center Hours",
                data: {
                  hours: [
                    { day: "Monday", open: "8:00 AM", close: "5:00 PM", notes: "Walk-ins 8-10 AM" },
                    { day: "Tuesday", open: "8:00 AM", close: "5:00 PM", notes: "Walk-ins 8-10 AM" },
                    { day: "Wednesday", open: "8:00 AM", close: "5:00 PM", notes: "Walk-ins 8-10 AM" },
                    { day: "Thursday", open: "8:00 AM", close: "5:00 PM", notes: "Walk-ins 8-10 AM" },
                    { day: "Friday", open: "8:00 AM", close: "4:00 PM", notes: "Appointments only" },
                  ],
                  peak_times: "Weeks before registration opens (March and October) — book appointments early!",
                  virtual_option: "Zoom advising available by appointment — request via message.",
                },
              },
            ],
          },
        },
      },
      messageSettings: { create: {} },
    },
  });
  console.log("  UA Engineering Advising Center — " + engAdvising.id);

  // ─── 2. Dr. Karen Wells — Senior CS Academic Advisor (person) ───

  const advisorKaren = await prisma.user.create({
    data: {
      email: "kwells@ua.edu",
      passwordHash: pw,
      name: "Dr. Karen Wells",
      role: "person",
      profiles: {
        create: {
          type: "person",
          displayName: "Dr. Karen Wells",
          bio: "Senior Academic Advisor for Computer Science in the College of Engineering. 12 years of advising experience at UA. Specializes in degree planning, course sequencing, pre-grad prep, and helping undecided students explore CS pathways. Advisor for 200+ CS majors.",
          location: "Tuscaloosa, AL",
          status: "available",
          category: "advising",
          campusRole: "advisor",
          department: "Computer Science",
          title: "Senior Academic Advisor",
          officeLocation: "Houser Hall 129",
          officeHours: "Mon-Thu 9:00 AM-4:00 PM, Fri 9:00 AM-2:00 PM",
          tags: ["advising", "computer-science", "degree-planning", "registration", "course-planning", "prerequisites", "graduation", "cs-advisor"],
          skills: {
            create: [
              { name: "Degree Audit Analysis", category: "Advising" },
              { name: "Course Sequencing", category: "Advising" },
              { name: "Prerequisites Planning", category: "Advising" },
              { name: "Graduate School Prep", category: "Career" },
              { name: "Schedule Optimization", category: "Advising" },
            ],
          },
          services: {
            create: [
              { name: "Full Advising Session", description: "Comprehensive degree review, course planning for next 2+ semesters, and academic goal setting.", category: "Advising", duration: 30, isBookable: true },
              { name: "Pre-Registration Check", description: "Quick review of your planned schedule before registration opens. Catch conflicts and missing prereqs.", category: "Advising", duration: 15, isBookable: true },
              { name: "Degree Audit Walkthrough", description: "Detailed review of your DegreeWorks audit — what you've completed, what's left, and the fastest path to graduation.", category: "Advising", duration: 30, isBookable: true },
              { name: "Schedule Conflict Resolution", description: "Help resolving time conflicts, closed sections, or waitlist strategies.", category: "Advising", duration: 15, isBookable: true },
              { name: "Major Exploration", description: "Considering CS or switching into CS? Let's review requirements, timeline, and credit applicability.", category: "Advising", duration: 30, isBookable: true },
              { name: "Graduate School Advising", description: "Planning for MS/PhD in CS — course selection, research experience, GPA targets, and application timeline.", category: "Career", duration: 30, isBookable: true },
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
                section: "office_hours",
                title: "Office Hours",
                data: {
                  schedule: [
                    { day: "Monday", start: "9:00", end: "16:00", location: "Houser Hall 129" },
                    { day: "Tuesday", start: "9:00", end: "16:00", location: "Houser Hall 129" },
                    { day: "Wednesday", start: "9:00", end: "16:00", location: "Houser Hall 129" },
                    { day: "Thursday", start: "9:00", end: "16:00", location: "Houser Hall 129" },
                    { day: "Friday", start: "9:00", end: "14:00", location: "Houser Hall 129" },
                  ],
                  booking_notes: "Walk-ins accepted but appointments strongly recommended during peak registration weeks.",
                  virtual: "Zoom appointments available upon request.",
                },
              },
              {
                section: "faq",
                title: "Common Advising Questions",
                data: {
                  questions: [
                    {
                      q: "When should I come see an advisor?",
                      a: "Before registration each semester. Also come if you're considering changing your major, struggling in courses, or planning for grad school. Freshmen/sophomores: your advising hold MUST be cleared before you can register.",
                    },
                    {
                      q: "How do I check my degree progress?",
                      a: "Log into myBama → Student tab → DegreeWorks. Run an audit for your current major. If you're considering a different major, use the 'What If' feature.",
                    },
                    {
                      q: "I failed a prerequisite. What now?",
                      a: "You need to retake it before progressing. This may delay downstream courses. Come see me ASAP so we can restructure your plan and minimize the impact.",
                    },
                    {
                      q: "Can I take CS 300 and CS 360 in the same semester?",
                      a: "Yes, they have no dependency on each other (CS 300 needs CS 250+201, CS 360 needs CS 250). This is actually the recommended Junior Fall pairing.",
                    },
                    {
                      q: "How do I get into a full class?",
                      a: "Add yourself to the waitlist. Check for newly opened sections. Come to the first day — instructors sometimes give permission numbers. I can also help you find alternative sections or equivalent courses.",
                    },
                    {
                      q: "What CS electives should I take for an AI career?",
                      a: "CS 403 (AI), CS 457 (ML), CS 467 (Deep Learning), CS 460 (Computer Vision). You'll need MATH 355 and ST 260 as prerequisites for the ML track.",
                    },
                    {
                      q: "Can I double major or add a minor?",
                      a: "Absolutely. Popular CS combos: CS+Math, CS+Data Science, CS with a Business minor. Come in and we'll map out how your remaining credits overlap.",
                    },
                  ],
                },
              },
              {
                section: "services",
                title: "Advising Specialties",
                data: {
                  services: [
                    { name: "Freshman Year Planning", description: "Get on the right track from day one — proper math placement and CS 100/101 sequencing" },
                    { name: "Transfer Student Integration", description: "Evaluate transfer credits, map to UA requirements, build a completion plan" },
                    { name: "Pre-Med + CS Dual Track", description: "Guide students pursuing both pre-med and CS — it's doable with careful planning" },
                    { name: "Internship Credit (CS 491)", description: "Help setting up and registering for internship-for-credit" },
                    { name: "Overload Approval", description: "Need 18+ credits? I'll review your GPA and workload and submit the approval" },
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
  console.log("  Dr. Karen Wells (CS Advisor) — " + advisorKaren.id);

  // ─── 3. UA Course Catalog (site) ───

  const courseCatalog = await prisma.user.create({
    data: {
      email: "catalog@registrar.ua.edu",
      passwordHash: pw,
      name: "UA Course Catalog",
      role: "business",
      profiles: {
        create: {
          type: "site",
          displayName: "UA Course Catalog & Schedule",
          bio: "Official University of Alabama course catalog and schedule. Search courses by department, browse current semester offerings, check prerequisites, and view seat availability. Updated daily during registration periods.",
          location: "Tuscaloosa, AL",
          status: "available",
          category: "academic",
          website: "https://catalog.ua.edu",
          tags: ["courses", "catalog", "schedule", "registration", "prerequisites", "academic", "classes", "CRN", "syllabus"],
          capabilities: {
            create: [
              { type: "messaging" },
            ],
          },
          infoSections: {
            create: [
              // ─ Root: departments index
              {
                section: "courses",
                title: "Course Catalog",
                data: {
                  note: "Browse courses by department. Each subsection contains current course offerings.",
                  departments: ["computer_science", "mathematics", "mechanical_engineering", "finance", "english"],
                  semester: "Fall 2026",
                },
              },
              // ─ CS Courses
              {
                section: "courses",
                subsection: "computer_science",
                title: "Computer Science Courses — Fall 2026",
                data: {
                  department: "Computer Science",
                  prefix: "CS",
                  courses: [
                    { code: "CS 100", name: "Freshman Seminar in CS", credits: 1, prereqs: [], seats: 60, enrolled: 42, schedule: "F 1:00-1:50 PM", location: "Shelby 1103", instructor: "Staff", description: "Introduction to the CS department, major requirements, and career paths." },
                    { code: "CS 101", name: "Intro to Computer Science", credits: 3, prereqs: [], seats: 120, enrolled: 108, schedule: "MWF 9:00-9:50 AM", location: "Shelby 1103", instructor: "Dr. Adams", description: "Problem solving with Python. Variables, loops, functions, lists, basic OOP." },
                    { code: "CS 101", name: "Intro to Computer Science", credits: 3, prereqs: [], seats: 120, enrolled: 95, schedule: "MWF 11:00-11:50 AM", location: "Shelby 1103", instructor: "Dr. Park", description: "Problem solving with Python. Variables, loops, functions, lists, basic OOP.", section: "002" },
                    { code: "CS 200", name: "Object-Oriented Programming", credits: 3, prereqs: ["CS 101"], seats: 90, enrolled: 82, schedule: "TR 9:30-10:45 AM", location: "Shelby 2107", instructor: "Dr. Chen", description: "OOP concepts in Java: classes, inheritance, polymorphism, interfaces." },
                    { code: "CS 201", name: "Data Structures & Algorithms", credits: 3, prereqs: ["CS 200", "MATH 125"], seats: 90, enrolled: 87, schedule: "TR 2:00-3:15 PM", location: "Shelby 1103", instructor: "Dr. Mitchell", description: "Arrays, linked lists, trees, graphs, sorting, searching, complexity analysis." },
                    { code: "CS 250", name: "Computer Organization", credits: 3, prereqs: ["CS 200"], seats: 60, enrolled: 54, schedule: "MWF 10:00-10:50 AM", location: "Shelby 2218", instructor: "Dr. Foster", description: "Digital logic, assembly language, CPU architecture, memory hierarchy." },
                    { code: "CS 260", name: "Software Engineering", credits: 3, prereqs: ["CS 201"], seats: 60, enrolled: 48, schedule: "TR 11:00 AM-12:15 PM", location: "Shelby 2107", instructor: "Dr. Lee", description: "Software development lifecycle, Agile, testing, version control, team projects." },
                    { code: "CS 300", name: "Operating Systems", credits: 3, prereqs: ["CS 250", "CS 201"], seats: 45, enrolled: 39, schedule: "MWF 1:00-1:50 PM", location: "Shelby 2218", instructor: "Dr. Foster", description: "Processes, threads, scheduling, memory management, file systems." },
                    { code: "CS 302", name: "Database Systems", credits: 3, prereqs: ["CS 201"], seats: 45, enrolled: 41, schedule: "TR 3:30-4:45 PM", location: "Shelby 2107", instructor: "Dr. Kim", description: "Relational model, SQL, normalization, transactions, indexing." },
                    { code: "CS 360", name: "Computer Networks", credits: 3, prereqs: ["CS 250"], seats: 45, enrolled: 37, schedule: "MWF 2:00-2:50 PM", location: "Shelby 2218", instructor: "Dr. Patel", description: "TCP/IP, routing, HTTP, sockets, network security fundamentals." },
                    { code: "CS 403", name: "Intro to Artificial Intelligence", credits: 3, prereqs: ["CS 201", "MATH 301", "ST 260"], seats: 40, enrolled: 38, schedule: "MWF 10:00-10:50 AM", location: "Shelby 1103", instructor: "Dr. Mitchell", description: "Search, logic, probability, machine learning basics, neural networks intro." },
                    { code: "CS 410", name: "Advanced Software Engineering", credits: 3, prereqs: ["CS 260"], seats: 35, enrolled: 28, schedule: "TR 2:00-3:15 PM", location: "Shelby 2218", instructor: "Dr. Lee", description: "Design patterns, architecture, CI/CD, cloud deployment, advanced testing." },
                    { code: "CS 420", name: "Computer Security", credits: 3, prereqs: ["CS 300", "CS 360"], seats: 35, enrolled: 32, schedule: "TR 11:00 AM-12:15 PM", location: "Shelby 2218", instructor: "Dr. Reyes", description: "Cryptography, authentication, network security, vulnerability analysis." },
                    { code: "CS 457", name: "Machine Learning", credits: 3, prereqs: ["CS 403", "MATH 355", "ST 260"], seats: 35, enrolled: 34, schedule: "TR 3:30-4:45 PM", location: "Shelby 2218", instructor: "Dr. Mitchell", description: "Supervised/unsupervised learning, regression, classification, neural networks, evaluation." },
                    { code: "CS 467", name: "Deep Learning", credits: 3, prereqs: ["CS 457"], seats: 30, enrolled: 25, schedule: "MW 3:00-4:15 PM", location: "Shelby 2218", instructor: "Dr. Mitchell", description: "CNNs, RNNs, transformers, GANs, reinforcement learning. PyTorch-based." },
                    { code: "CS 495", name: "Capstone Project", credits: 3, prereqs: ["CS 260", "senior standing"], seats: 30, enrolled: 26, schedule: "F 2:00-4:30 PM", location: "Shelby 2107", instructor: "Dr. Lee", description: "Industry-sponsored team project. Full SDLC from requirements to deployment." },
                  ],
                },
              },
              // ─ Math courses
              {
                section: "courses",
                subsection: "mathematics",
                title: "Mathematics Courses — Fall 2026",
                data: {
                  department: "Mathematics",
                  prefix: "MATH / ST",
                  courses: [
                    { code: "MATH 125", name: "Calculus I", credits: 4, prereqs: [], seats: 200, enrolled: 178, schedule: "MTWR 8:00-8:50 AM", location: "Gordon Palmer 151", instructor: "Dr. Huang" },
                    { code: "MATH 125", name: "Calculus I", credits: 4, prereqs: [], seats: 200, enrolled: 165, schedule: "MTWR 10:00-10:50 AM", location: "Gordon Palmer 151", instructor: "Dr. Voss", section: "002" },
                    { code: "MATH 126", name: "Calculus II", credits: 4, prereqs: ["MATH 125"], seats: 150, enrolled: 132, schedule: "MTWR 9:00-9:50 AM", location: "Gordon Palmer 151", instructor: "Dr. Huang" },
                    { code: "MATH 227", name: "Calculus III", credits: 4, prereqs: ["MATH 126"], seats: 90, enrolled: 74, schedule: "MTWR 11:00-11:50 AM", location: "Gordon Palmer 234", instructor: "Dr. Pham" },
                    { code: "MATH 237", name: "Linear Algebra (Applied)", credits: 3, prereqs: ["MATH 126"], seats: 60, enrolled: 45, schedule: "MWF 1:00-1:50 PM", location: "Gordon Palmer 234", instructor: "Dr. Pham" },
                    { code: "MATH 301", name: "Discrete Mathematics", credits: 3, prereqs: ["MATH 125"], seats: 60, enrolled: 53, schedule: "MWF 11:00-11:50 AM", location: "Gordon Palmer 307", instructor: "Dr. Li" },
                    { code: "MATH 355", name: "Linear Algebra", credits: 3, prereqs: ["MATH 126"], seats: 45, enrolled: 38, schedule: "TR 9:30-10:45 AM", location: "Gordon Palmer 307", instructor: "Dr. Li" },
                    { code: "ST 260", name: "Statistical Methods", credits: 3, prereqs: ["MATH 126"], seats: 120, enrolled: 105, schedule: "TR 11:00 AM-12:15 PM", location: "Ten Hoor 125", instructor: "Dr. Johnson" },
                  ],
                },
              },
              // ─ Finance courses
              {
                section: "courses",
                subsection: "finance",
                title: "Finance Courses — Fall 2026",
                data: {
                  department: "Finance",
                  prefix: "FI",
                  courses: [
                    { code: "FI 302", name: "Corporate Finance", credits: 3, prereqs: ["EC 110", "AC 210"], seats: 80, enrolled: 72, schedule: "MWF 11:00-11:50 AM", location: "Bidgood 130", instructor: "Dr. Rivera" },
                    { code: "FI 410", name: "Investment Analysis", credits: 3, prereqs: ["FI 302"], seats: 45, enrolled: 40, schedule: "TR 3:30-4:45 PM", location: "Bidgood 250", instructor: "Dr. Rivera" },
                    { code: "FI 435", name: "Financial Modeling", credits: 3, prereqs: ["FI 302", "ST 260"], seats: 35, enrolled: 30, schedule: "TR 12:30-1:45 PM", location: "Bidgood 250", instructor: "Dr. Sharma" },
                  ],
                },
              },
              // ─ Schedule tips
              {
                section: "schedule_tips",
                title: "Course Scheduling Tips",
                data: {
                  tips: [
                    { tip: "Register early", detail: "CS 400-level courses fill up fast. Set an alarm for your time ticket." },
                    { tip: "Check RateMyProfessor", detail: "Multiple sections of CS 101 and MATH 125 exist — instructor matters." },
                    { tip: "Use Schedule Builder", detail: "In myBama → Student → Schedule Builder. Add CRNs and visualize conflicts." },
                    { tip: "Watch for labs", detail: "Some ME and CS courses have separate lab sections that must be registered independently." },
                    { tip: "Balance your load", detail: "Don't take CS 300, CS 360, and CS 403 all in the same semester unless you're prepared for 40+ hours/week of coursework." },
                    { tip: "Check prerequisites NOW", detail: "If you're missing a prereq, you'll get an error at registration. Run DegreeWorks first." },
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
  console.log("  UA Course Catalog — " + courseCatalog.id);

  // ─── 4. UA Graduate School (site) ───

  const gradSchool = await prisma.user.create({
    data: {
      email: "gradschool@ua.edu",
      passwordHash: pw,
      name: "UA Graduate School",
      role: "business",
      profiles: {
        create: {
          type: "site",
          displayName: "UA Graduate School",
          bio: "The University of Alabama Graduate School oversees all master's and doctoral programs. We help with application guidance, admission requirements, funding opportunities, and preparing for graduate study. Supporting the transition from undergrad to graduate-level academics.",
          location: "Tuscaloosa, AL",
          status: "available",
          category: "academic",
          address: "Rose Administration Building, Room 200, Tuscaloosa, AL 35487",
          hours: "Mon-Fri 8:00 AM-5:00 PM",
          phone: "(205) 348-5921",
          website: "https://graduate.ua.edu",
          tags: ["graduate", "masters", "phd", "grad-school", "application", "gre", "thesis", "research", "academic"],
          services: {
            create: [
              { name: "Application Review", description: "Review of your graduate application materials before submission.", category: "Application", duration: 30, isBookable: true },
              { name: "Program Exploration", description: "Learn about available graduate programs and their requirements.", category: "Advising", duration: 30, isBookable: true },
              { name: "Funding Consultation", description: "Explore assistantships, fellowships, and financial aid for graduate students.", category: "Financial", duration: 20, isBookable: true },
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
              // ─ Programs overview
              {
                section: "programs",
                title: "Graduate Programs",
                data: {
                  note: "Browse subsections for specific program details.",
                  colleges: [
                    { name: "College of Engineering", programs: ["MS Computer Science", "MS Mechanical Engineering", "MS Electrical Engineering", "PhD Computer Science", "PhD Mechanical Engineering"] },
                    { name: "Culverhouse College of Business", programs: ["MBA", "MS Finance", "MS Marketing", "PhD Management"] },
                    { name: "College of Arts & Sciences", programs: ["MA English", "MS Mathematics", "MS Chemistry", "PhD Biology", "PhD Physics"] },
                  ],
                },
              },
              {
                section: "programs",
                subsection: "cs_masters",
                title: "MS in Computer Science",
                data: {
                  program: "Master of Science in Computer Science",
                  department: "Computer Science",
                  college: "College of Engineering",
                  credits_required: 30,
                  options: ["Thesis (24 courses + 6 thesis)", "Non-thesis (30 courses + comprehensive exam)"],
                  admission_requirements: {
                    gpa: "3.0 minimum (3.3+ competitive)",
                    gre: "Optional (strong GPA/experience can waive)",
                    prerequisites: ["Data Structures", "Algorithms", "Operating Systems", "Discrete Math", "Linear Algebra"],
                    materials: ["Transcripts", "3 recommendation letters", "Statement of purpose", "Resume/CV"],
                    deadline: { fall: "February 1", spring: "September 15" },
                  },
                  funding: {
                    graduate_teaching_assistantship: { stipend: "$18,000-22,000/year", tuition_waiver: true, hours: "20 hrs/week teaching" },
                    graduate_research_assistantship: { stipend: "$20,000-25,000/year", tuition_waiver: true, hours: "20 hrs/week research" },
                    fellowships: "McNair, Graduate Council Fellowship, GAANN — merit-based, cover full tuition + stipend",
                  },
                  sample_courses: [
                    "CS 500 — Advanced Algorithms",
                    "CS 525 — Advanced AI",
                    "CS 557 — Advanced Machine Learning",
                    "CS 560 — Advanced Computer Vision",
                    "CS 575 — Distributed Systems",
                    "CS 591 — Graduate Seminar",
                    "CS 599 — Thesis Research",
                  ],
                  typical_timeline: {
                    thesis: "2 years (find advisor by end of Year 1, defend thesis by end of Year 2)",
                    non_thesis: "1.5-2 years (comprehensive exam at end)",
                  },
                },
              },
              {
                section: "programs",
                subsection: "cs_phd",
                title: "PhD in Computer Science",
                data: {
                  program: "Doctor of Philosophy in Computer Science",
                  department: "Computer Science",
                  college: "College of Engineering",
                  credits_required: 72,
                  admission_requirements: {
                    gpa: "3.3 minimum (3.5+ competitive)",
                    gre: "Recommended for PhD applicants",
                    prerequisites: ["MS in CS or equivalent coursework"],
                    materials: ["Transcripts", "3 recommendation letters", "Statement of purpose", "Research statement", "Resume/CV", "Writing sample (optional)"],
                    deadline: { fall: "January 15", spring: "Not typically admitted" },
                  },
                  milestones: [
                    { milestone: "Coursework", timeline: "Years 1-2", detail: "Complete required courses and electives" },
                    { milestone: "Qualifying Exam", timeline: "End of Year 2", detail: "Written and oral components" },
                    { milestone: "Dissertation Proposal", timeline: "Year 3", detail: "Define research problem and methodology" },
                    { milestone: "Dissertation Research", timeline: "Years 3-5", detail: "Conduct original research" },
                    { milestone: "Defense", timeline: "Year 4-5", detail: "Present and defend dissertation" },
                  ],
                  funding: "All accepted PhD students receive full funding (GRA/GTA + tuition waiver) for up to 5 years.",
                  research_areas: ["AI & Machine Learning", "Computer Vision", "NLP", "Cybersecurity", "Systems & Networks", "Human-Computer Interaction", "Software Engineering"],
                },
              },
              // ─ Application guidance
              {
                section: "application_guide",
                title: "Application Guide",
                data: {
                  steps: [
                    { step: 1, action: "Research programs", detail: "Browse graduate.ua.edu for programs. Reach out to faculty whose research interests align with yours." },
                    { step: 2, action: "Check prerequisites", detail: "Ensure you meet or will meet all prerequisite requirements before enrollment." },
                    { step: 3, action: "Prepare materials", detail: "Transcripts, recommendation letters (ask 2+ months early), statement of purpose, GRE (if needed)." },
                    { step: 4, action: "Apply online", detail: "Submit via the UA Graduate School application portal. $65 application fee." },
                    { step: 5, action: "Track your application", detail: "Log in to check status. Contact the department if you haven't heard back within 6-8 weeks." },
                    { step: 6, action: "Accept and enroll", detail: "Accept your offer, submit enrollment deposit, and register for orientation." },
                  ],
                  gpa_benchmarks: {
                    competitive: "3.5+ (significantly increases funding chances)",
                    acceptable: "3.0-3.49 (meet minimum, strengthen other areas)",
                    below_minimum: "Below 3.0 — consider post-bacc coursework or a conditional admission path",
                  },
                  timeline: {
                    "12_months_before": "Begin researching programs and connecting with faculty",
                    "9_months_before": "Take GRE if required, ask for recommendation letters",
                    "6_months_before": "Draft statement of purpose, request transcripts",
                    "3_months_before": "Submit applications (most fall deadlines are Jan-Feb)",
                    "1_month_before": "Follow up on applications, compare offers",
                    "enrollment": "Accept offer, attend orientation, register for first semester",
                  },
                },
              },
              // ─ Funding
              {
                section: "funding",
                title: "Graduate Funding & Assistantships",
                data: {
                  types: [
                    { type: "Graduate Teaching Assistantship (GTA)", description: "Teach or assist with undergraduate courses. Includes tuition waiver + stipend.", typical_stipend: "$16,000-22,000/year" },
                    { type: "Graduate Research Assistantship (GRA)", description: "Work on faculty research projects. Includes tuition waiver + stipend.", typical_stipend: "$18,000-25,000/year" },
                    { type: "Fellowship", description: "Merit-based awards. No teaching/research obligation. Full tuition + stipend.", examples: ["Graduate Council Fellowship", "McNair Fellowship", "GAANN Fellowship"] },
                    { type: "Out-of-State Tuition Waiver", description: "Many GA/GTA positions include out-of-state tuition waiver, making costs equivalent to in-state." },
                  ],
                  how_to_apply: "Most assistantships are awarded by individual departments. Contact the department graduate coordinator directly. Fellowships are typically nominated by faculty.",
                },
              },
            ],
          },
        },
      },
      messageSettings: { create: {} },
    },
  });
  console.log("  UA Graduate School — " + gradSchool.id);

  // ─── 5. UA Career Center (site) — Career Path Mapping ───

  const careerCenter = await prisma.user.create({
    data: {
      email: "career-center@ua.edu",
      passwordHash: pw,
      name: "UA Career Center",
      role: "business",
      profiles: {
        create: {
          type: "site",
          displayName: "UA Career Center",
          bio: "The University of Alabama Career Center helps students connect academic decisions to career outcomes. Explore career paths by major, identify skill gaps, find internships, and prepare for the job market. Resume reviews, mock interviews, career fairs, and employer connections — all free for UA students.",
          location: "Tuscaloosa, AL",
          status: "available",
          category: "career",
          address: "Student Services Center, Suite 200, Tuscaloosa, AL 35487",
          hours: "Mon-Thu 8:00 AM-5:00 PM, Fri 8:00 AM-4:00 PM",
          phone: "(205) 348-5848",
          website: "https://career.sa.ua.edu",
          tags: ["career", "jobs", "internship", "resume", "interview", "career-fair", "skill-gap", "career-path", "salary", "employer"],
          services: {
            create: [
              { name: "Career Exploration Session", description: "Explore career paths related to your major, interests, and skills.", category: "Career", duration: 30, isBookable: true },
              { name: "Resume Review", description: "Professional feedback on your resume — formatting, content, keywords.", category: "Career", duration: 30, isBookable: true },
              { name: "Mock Interview", description: "Practice with behavioral and technical interview questions. Get recorded feedback.", category: "Career", duration: 45, isBookable: true },
              { name: "Internship Search Help", description: "Strategies for finding and landing internships in your field.", category: "Career", duration: 30, isBookable: true },
              { name: "LinkedIn Profile Review", description: "Optimize your LinkedIn presence for recruiters.", category: "Career", duration: 20, isBookable: true },
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
              // ─ Career paths by major
              {
                section: "career_paths",
                title: "Career Paths by Major",
                data: {
                  note: "Browse subsections for specific major pathways.",
                  majors: ["computer_science", "mechanical_engineering", "finance"],
                },
              },
              {
                section: "career_paths",
                subsection: "computer_science",
                title: "Career Paths — Computer Science",
                data: {
                  major: "Computer Science",
                  paths: [
                    {
                      career: "Software Engineer",
                      description: "Design, build, and maintain software systems",
                      typical_salary: "$85,000-$150,000 (entry-mid)",
                      key_courses: ["CS 201", "CS 260", "CS 410", "CS 495"],
                      skills_needed: ["Data structures", "System design", "Version control", "Testing", "1+ programming language"],
                      employers_hiring_ua: ["Amazon", "Google", "Microsoft", "Lockheed Martin", "BBVA", "Regions Financial"],
                    },
                    {
                      career: "Data Scientist / ML Engineer",
                      description: "Build models from data to drive business decisions",
                      typical_salary: "$95,000-$160,000",
                      key_courses: ["CS 403", "CS 457", "CS 467", "ST 260", "MATH 355"],
                      skills_needed: ["Python", "Statistics", "Machine learning", "SQL", "Data visualization"],
                      employers_hiring_ua: ["Google", "Meta", "Amazon", "Protective Life", "USAA"],
                    },
                    {
                      career: "Cybersecurity Analyst",
                      description: "Protect systems and data from security threats",
                      typical_salary: "$75,000-$130,000",
                      key_courses: ["CS 300", "CS 360", "CS 420"],
                      skills_needed: ["Network security", "Cryptography", "Penetration testing", "Risk assessment"],
                      employers_hiring_ua: ["Northrop Grumman", "FBI", "NSA", "Booz Allen Hamilton", "SAIC"],
                    },
                    {
                      career: "Product Manager",
                      description: "Strategic role bridging technical and business teams",
                      typical_salary: "$90,000-$155,000",
                      key_courses: ["CS 260", "CS 410", "MKT 300", "MGT 300"],
                      skills_needed: ["Technical literacy", "Communication", "Analytics", "User research"],
                      note: "Consider a business minor — very valued for PM roles",
                    },
                    {
                      career: "Graduate School / Research",
                      description: "MS or PhD for research careers, professorships, or R&D lab positions",
                      key_courses: ["CS 403", "CS 457", "CS 467", "CS 495 (research-focused capstone)"],
                      skills_needed: ["Research methodology", "Academic writing", "Deep expertise in a subfield"],
                      note: "Start undergraduate research by sophomore/junior year. Talk to Dr. Mitchell or Dr. Wells.",
                    },
                  ],
                  skill_gap_tips: [
                    { gap: "No internship experience", fix: "Apply to UA-sponsored internship programs. Career Center has an internship database. Start applying Fall of junior year." },
                    { gap: "Weak in algorithms", fix: "Practice on LeetCode/HackerRank. Take CS 201 seriously — it's the #1 interview predictor." },
                    { gap: "No portfolio/projects", fix: "Build 2-3 personal projects. Contribute to open source. CS 495 capstone counts." },
                    { gap: "Missing soft skills", fix: "Join ACM/IEEE student chapter. Present at undergraduate research conferences. Take a public speaking elective." },
                  ],
                },
              },
              {
                section: "career_paths",
                subsection: "mechanical_engineering",
                title: "Career Paths — Mechanical Engineering",
                data: {
                  major: "Mechanical Engineering",
                  paths: [
                    {
                      career: "Mechanical Design Engineer",
                      description: "Design mechanical systems and components using CAD and simulation",
                      typical_salary: "$70,000-$110,000",
                      key_courses: ["ME 360", "ME 250", "ME 495"],
                      skills_needed: ["SolidWorks/CATIA", "FEA", "GD&T", "Material science"],
                      employers_hiring_ua: ["Mercedes-Benz (Tuscaloosa)", "Nucor Steel", "Honda", "Boeing"],
                    },
                    {
                      career: "HVAC / Energy Engineer",
                      description: "Design heating, cooling, and energy systems for buildings and industry",
                      typical_salary: "$65,000-$105,000",
                      key_courses: ["ME 210", "ME 320", "ME 310"],
                      skills_needed: ["Thermodynamics", "Heat transfer", "Energy modeling"],
                    },
                    {
                      career: "Robotics Engineer",
                      description: "Develop robotic systems for manufacturing, healthcare, or defense",
                      typical_salary: "$80,000-$140,000",
                      key_courses: ["ME 450", "ME 201", "CS 101", "CS 403"],
                      skills_needed: ["Controls", "Programming", "Sensors", "Computer vision"],
                      note: "Consider CS minor for robotics career. Talk to Dr. Patel in the Robotics Lab.",
                    },
                  ],
                },
              },
              // ─ Upcoming events
              {
                section: "events",
                title: "Career Center Events",
                data: {
                  upcoming: [
                    { event: "Engineering & Tech Career Fair", date: "Sep 18, 2026", time: "10 AM - 3 PM", location: "Coleman Coliseum", details: "100+ employers. Bring 20+ resumes. Business professional attire." },
                    { event: "Resume Blitz", date: "Sep 10, 2026", time: "11 AM - 2 PM", location: "Ferguson Center Ballroom", details: "Drop in for a 10-min resume review before the career fair." },
                    { event: "Mock Interview Night", date: "Oct 8, 2026", time: "5-8 PM", location: "Student Services Center 200", details: "Practice technical and behavioral interviews with industry volunteers." },
                    { event: "Spring Internship Fair", date: "Jan 28, 2027", time: "10 AM - 3 PM", location: "Coleman Coliseum", details: "Focus on summer 2027 internships. STEM and business tracks." },
                  ],
                },
              },
              // ─ Hours
              {
                section: "hours",
                title: "Career Center Hours",
                data: {
                  hours: [
                    { day: "Monday-Thursday", open: "8:00 AM", close: "5:00 PM" },
                    { day: "Friday", open: "8:00 AM", close: "4:00 PM" },
                  ],
                  drop_in: "Quick questions: Mon-Thu 1-4 PM (no appointment needed)",
                  virtual: "Virtual appointments available via Handshake",
                },
              },
            ],
          },
        },
      },
      messageSettings: { create: {} },
    },
  });
  console.log("  UA Career Center — " + careerCenter.id);

  // ─── 6. UA Registration & Records (site) ───

  const registrar = await prisma.user.create({
    data: {
      email: "registrar@ua.edu",
      passwordHash: pw,
      name: "UA Registrar",
      role: "business",
      profiles: {
        create: {
          type: "site",
          displayName: "UA Office of the University Registrar",
          bio: "Handles enrollment, transcripts, degree verification, and academic records. Resources for registration, add/drop, withdrawal, grade appeals, and commencement. Your official academic record is managed here.",
          location: "Tuscaloosa, AL",
          status: "available",
          category: "academic",
          address: "Student Services Center, Suite 101, Tuscaloosa, AL 35487",
          hours: "Mon-Fri 8:00 AM-5:00 PM",
          phone: "(205) 348-2020",
          website: "https://registrar.ua.edu",
          tags: ["registrar", "registration", "transcripts", "enrollment", "grades", "add-drop", "withdrawal", "commencement", "records"],
          services: {
            create: [
              { name: "Transcript Request", description: "Order official transcripts (electronic or paper).", category: "Records", duration: 10, isBookable: false },
              { name: "Enrollment Verification", description: "Request enrollment or degree verification letter.", category: "Records", duration: 10, isBookable: false },
              { name: "Grade Appeal Guidance", description: "Information on the grade appeal process and deadlines.", category: "Academic", duration: 20, isBookable: true },
            ],
          },
          capabilities: {
            create: [
              { type: "messaging" },
              { type: "service_requests" },
            ],
          },
          infoSections: {
            create: [
              {
                section: "services",
                title: "Registrar Services",
                data: {
                  services: [
                    { name: "Registration", description: "Course registration via myBama. Check your time ticket under Student → Registration." },
                    { name: "Add/Drop", description: "Add or drop courses during the first week of classes through myBama. No grade penalty." },
                    { name: "Withdrawal", description: "Withdraw from a course after add/drop period. Receives a 'W' grade (no GPA impact). Deadline varies by semester." },
                    { name: "Transcripts", description: "Order via the National Student Clearinghouse. $10/electronic, $15/paper. Processing: 3-5 business days." },
                    { name: "Enrollment Verification", description: "Request through the Clearinghouse or visit our office. Free for current students." },
                    { name: "Grade Appeals", description: "Must be initiated within 30 days of grade posting. Start with the instructor, then department chair, then dean." },
                    { name: "Commencement", description: "Apply for graduation via myBama by the posted deadline. Regalia ordered through the campus bookstore." },
                  ],
                },
              },
              {
                section: "academic_calendar",
                title: "Academic Calendar 2026-2027",
                data: {
                  fall_2026: [
                    { event: "Classes Begin", date: "Aug 19, 2026" },
                    { event: "Labor Day (no classes)", date: "Sep 7, 2026" },
                    { event: "Last Day to Add", date: "Aug 25, 2026" },
                    { event: "Last Day to Drop (no record)", date: "Aug 25, 2026" },
                    { event: "Last Day to Withdraw (W grade)", date: "Oct 16, 2026" },
                    { event: "Fall Break", date: "Oct 12-13, 2026" },
                    { event: "Thanksgiving Break", date: "Nov 23-27, 2026" },
                    { event: "Last Day of Classes", date: "Dec 4, 2026" },
                    { event: "Final Exams", date: "Dec 7-12, 2026" },
                    { event: "Commencement", date: "Dec 12, 2026" },
                  ],
                  spring_2027: [
                    { event: "Classes Begin", date: "Jan 6, 2027" },
                    { event: "MLK Day (no classes)", date: "Jan 19, 2027" },
                    { event: "Last Day to Add", date: "Jan 12, 2027" },
                    { event: "Spring Break", date: "Mar 16-20, 2027" },
                    { event: "Last Day to Withdraw (W grade)", date: "Mar 6, 2027" },
                    { event: "Last Day of Classes", date: "Apr 24, 2027" },
                    { event: "Final Exams", date: "Apr 28 - May 2, 2027" },
                    { event: "Commencement", date: "May 2, 2027" },
                  ],
                },
              },
              {
                section: "policies",
                title: "Registration Policies",
                data: {
                  policies: [
                    { name: "Credit Hour Limits", description: "Default max 18 credits/semester. Overload (19+) requires advisor approval and 3.0+ GPA." },
                    { name: "Prerequisite Enforcement", description: "Prerequisites are enforced at registration. You cannot register for a course without completing its prereqs." },
                    { name: "Repeat Policy", description: "A course may be repeated once. The higher grade replaces the lower. Third attempts require dean approval and incur additional fees." },
                    { name: "Time Ticket", description: "Your registration window is assigned based on credit hours earned. Seniors register first, then juniors, etc." },
                    { name: "Waitlist", description: "If a section is full, join the waitlist (max 10). You'll be auto-enrolled if a seat opens. Waitlists close 1 day before classes start." },
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
  console.log("  UA Registrar — " + registrar.id);

  // ─── 7. Michael Torres — Engineering Academic Advisor (person) ───

  const advisorMike = await prisma.user.create({
    data: {
      email: "mtorres@ua.edu",
      passwordHash: pw,
      name: "Michael Torres",
      role: "person",
      profiles: {
        create: {
          type: "person",
          displayName: "Michael Torres",
          bio: "Academic advisor for Mechanical Engineering and Aerospace Engineering in the College of Engineering. Focuses on course sequencing, co-op/internship integration, and preparing students for industry or graduate school. 8 years advising at UA.",
          location: "Tuscaloosa, AL",
          status: "available",
          category: "advising",
          campusRole: "advisor",
          department: "Mechanical Engineering",
          title: "Academic Advisor",
          officeLocation: "Hardaway Hall 112",
          officeHours: "Mon/Wed/Fri 9:00 AM-4:00 PM, Tue/Thu 9:00 AM-12:00 PM",
          tags: ["advising", "mechanical-engineering", "aerospace", "degree-planning", "co-op", "internship", "engineering"],
          skills: {
            create: [
              { name: "ME Degree Planning", category: "Advising" },
              { name: "Co-op Program Coordination", category: "Career" },
              { name: "FE Exam Prep Guidance", category: "Career" },
              { name: "Aerospace Pathway Planning", category: "Advising" },
            ],
          },
          services: {
            create: [
              { name: "Advising Appointment", description: "Full advising — degree audit, course selection, graduation planning.", category: "Advising", duration: 30, isBookable: true },
              { name: "Co-op/Internship Planning", description: "Integrate co-op rotations into your degree plan without delaying graduation.", category: "Career", duration: 30, isBookable: true },
              { name: "Pre-Registration Review", description: "Verify your course selections meet prerequisites and degree requirements.", category: "Advising", duration: 15, isBookable: true },
              { name: "FE Exam Guidance", description: "Preparing for the Fundamentals of Engineering exam — what to study and when to take it.", category: "Career", duration: 20, isBookable: true },
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
                section: "office_hours",
                title: "Office Hours",
                data: {
                  schedule: [
                    { day: "Monday", start: "9:00", end: "16:00", location: "Hardaway Hall 112" },
                    { day: "Wednesday", start: "9:00", end: "16:00", location: "Hardaway Hall 112" },
                    { day: "Friday", start: "9:00", end: "16:00", location: "Hardaway Hall 112" },
                    { day: "Tuesday", start: "9:00", end: "12:00", location: "Hardaway Hall 112" },
                    { day: "Thursday", start: "9:00", end: "12:00", location: "Hardaway Hall 112" },
                  ],
                },
              },
              {
                section: "faq",
                title: "Common ME Advising Questions",
                data: {
                  questions: [
                    { q: "Can I do a co-op and still graduate in 4 years?", a: "It's tight but possible with summer courses. Most co-op students take 4.5-5 years. The career advantage is worth it — co-op students have 95%+ job placement at graduation." },
                    { q: "What's the difference between ME and AEM?", a: "ME is broader (thermo, fluids, design, controls). AEM focuses on aerospace applications — aerodynamics, propulsion, flight mechanics. AEM has more restricted electives but the core is 80% shared." },
                    { q: "Should I take the FE exam?", a: "Yes, take it senior year while material is fresh. It's required for the PE license, which many employers value. I can point you to prep resources." },
                    { q: "Can I add a CS minor?", a: "Popular combo. You'd need CS 101, 200, 201, and three 300+ level CS courses (18 credits total). Fits well if you start CS 101 freshman year." },
                  ],
                },
              },
              {
                section: "services",
                title: "Advising Specialties",
                data: {
                  services: [
                    { name: "Co-op Integration", description: "3-rotation co-op plans with Mercedes-Benz, Honda, Nucor, and other local partners" },
                    { name: "Dual ME/AEM Path", description: "Map out dual-focus coursework for students interested in both ME and Aerospace" },
                    { name: "Study Abroad Credits", description: "Help mapping international engineering courses to UA ME requirements" },
                    { name: "Senior Design Team Formation", description: "Guidance on capstone project selection and team matching" },
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
  console.log("  Michael Torres (ME Advisor) — " + advisorMike.id);

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
  // CUSTOM WEBHOOK SCHEMAS PER ENTITY
  // =====================================================
  // Entities can define per-event custom field requirements.
  // The AI reads these from the profile's required_fields and collects them before executing actions.

  // Gorgas Library — booking requires student_id, optionally student_major + group_size
  const gorgasProfile = await prisma.profile.findFirst({ where: { userId: gorgas.id } });
  if (gorgasProfile) {
    await prisma.profile.update({
      where: { id: gorgasProfile.id },
      data: {
        webhookSchema: {
          booking: {
            description: "Required fields for study room and consultation bookings",
            fields: [
              { name: "student_id", type: "string", required: true, description: "UA student CWID (9 digits)" },
              { name: "student_major", type: "string", required: false, description: "Student's declared major" },
              { name: "group_size", type: "number", required: false, description: "Number of people (for study rooms)" },
            ],
          },
        },
      },
    });
    console.log("  Schema: Gorgas Library — booking requires student_id");
  }

  // Crimson Cuts — booking requires phone_number, optionally preferred_barber
  const crimsonCutsProfile = await prisma.profile.findFirst({ where: { userId: crimsonCuts.id } });
  if (crimsonCutsProfile) {
    await prisma.profile.update({
      where: { id: crimsonCutsProfile.id },
      data: {
        webhookSchema: {
          booking: {
            description: "Required fields for barbershop appointments",
            fields: [
              { name: "phone_number", type: "string", required: true, description: "Contact phone number for appointment reminders" },
              { name: "preferred_barber", type: "string", required: false, description: "Name of preferred barber (if any)" },
            ],
          },
          quotes: {
            description: "Required fields for service quotes",
            fields: [
              { name: "phone_number", type: "string", required: true, description: "Contact phone for quote follow-up" },
              { name: "hair_type", type: "string", required: false, description: "Hair type/texture for accurate pricing" },
            ],
          },
        },
      },
    });
    console.log("  Schema: Crimson Cuts — booking requires phone_number");
  }

  // Lakeside Dining — ordering optionally wants meal_plan_id and dietary_restrictions
  const lakesideProfile = await prisma.profile.findFirst({ where: { userId: lakeside.id } });
  if (lakesideProfile) {
    await prisma.profile.update({
      where: { id: lakesideProfile.id },
      data: {
        webhookSchema: {
          ordering: {
            description: "Optional fields for dining orders",
            fields: [
              { name: "meal_plan_id", type: "string", required: false, description: "Meal plan or Dining Dollars account ID" },
              { name: "dietary_restrictions", type: "string", required: false, description: "Allergies or dietary restrictions to flag" },
            ],
          },
        },
      },
    });
    console.log("  Schema: Lakeside Dining — ordering accepts meal_plan_id");
  }

  // Dr. Sarah Mitchell — booking (office hours) requires student_id and course_code
  const mitchellProfile = await prisma.profile.findFirst({ where: { userId: profMitchell.id } });
  if (mitchellProfile) {
    await prisma.profile.update({
      where: { id: mitchellProfile.id },
      data: {
        webhookSchema: {
          booking: {
            description: "Required fields for office hour appointments",
            fields: [
              { name: "student_id", type: "string", required: true, description: "UA student CWID" },
              { name: "course_code", type: "string", required: true, description: "Course code (e.g., CS 403, CS 201)" },
              { name: "topic", type: "string", required: false, description: "Brief description of what you need help with" },
            ],
          },
        },
      },
    });
    console.log("  Schema: Dr. Mitchell — booking requires student_id + course_code");
  }

  // Rec Center — booking requires student_id, optionally fitness_goal
  const recProfile = await prisma.profile.findFirst({ where: { userId: recCenter.id } });
  if (recProfile) {
    await prisma.profile.update({
      where: { id: recProfile.id },
      data: {
        webhookSchema: {
          booking: {
            description: "Required fields for facility and trainer bookings",
            fields: [
              { name: "student_id", type: "string", required: true, description: "UA student CWID for facility access" },
              { name: "fitness_goal", type: "string", required: false, description: "Current fitness goal (for personal training)" },
            ],
          },
        },
      },
    });
    console.log("  Schema: Rec Center — booking requires student_id");
  }

  // Bama Waves Coffee — ordering requires phone_number for pickup notification
  const bwProfile = await prisma.profile.findFirst({ where: { userId: bwCoffee.id } });
  if (bwProfile) {
    await prisma.profile.update({
      where: { id: bwProfile.id },
      data: {
        webhookSchema: {
          ordering: {
            description: "Required fields for coffee orders",
            fields: [
              { name: "phone_number", type: "string", required: true, description: "Phone number for order-ready notification" },
              { name: "reward_member_id", type: "string", required: false, description: "Loyalty rewards member ID (if enrolled)" },
            ],
          },
        },
      },
    });
    console.log("  Schema: Bama Waves Coffee — ordering requires phone_number");
  }

  // Chicken House — ordering requires phone for pickup, dietary info optional
  const chickenProfile = await prisma.profile.findFirst({ where: { userId: chickenHouse.id } });
  if (chickenProfile) {
    await prisma.profile.update({
      where: { id: chickenProfile.id },
      data: {
        webhookSchema: {
          ordering: {
            description: "Required fields for food orders",
            fields: [
              { name: "phone_number", type: "string", required: true, description: "Phone number for pickup notification" },
              { name: "spice_level", type: "string", required: false, description: "Preferred spice level: mild, medium, hot, extra hot" },
            ],
          },
          quotes: {
            description: "Required fields for catering quotes",
            fields: [
              { name: "phone_number", type: "string", required: true, description: "Contact phone for catering follow-up" },
              { name: "event_date", type: "string", required: true, description: "Date of the event (YYYY-MM-DD)" },
              { name: "guest_count", type: "number", required: true, description: "Number of guests" },
            ],
          },
        },
      },
    });
    console.log("  Schema: Chicken House — ordering & quotes require phone_number");
  }

  console.log("  Custom webhook schemas applied to 7 entities");


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
  console.log("    Advisors:    5 (Lisa, Marcus, Karen, Michael, + Eng Center)");
  console.log("    Tutors:      3");
  console.log("    Sites:       8 (dining, library, rec, catalog, grad school, career center, registrar)");
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
