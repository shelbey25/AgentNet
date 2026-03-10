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
      profile: {
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
      profile: {
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
      profile: {
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
      profile: {
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
      profile: {
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
      profile: {
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
      profile: {
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
      profile: {
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
      profile: {
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
              {
                section: "menu",
                title: "Today's Menu",
                data: {
                  items: [
                    { id: "grilled_chicken", name: "Grilled Chicken Breast", price: 0, station: "Grill", description: "Included with meal plan" },
                    { id: "cheese_pizza", name: "Cheese Pizza", price: 0, station: "Pizza", description: "Fresh baked" },
                    { id: "pepperoni_pizza", name: "Pepperoni Pizza", price: 0, station: "Pizza" },
                    { id: "caesar_salad", name: "Caesar Salad", price: 0, station: "Salad Bar" },
                    { id: "pasta_marinara", name: "Pasta Marinara", price: 0, station: "Comfort", description: "With garlic bread" },
                    { id: "stir_fry", name: "Vegetable Stir Fry", price: 0, station: "International" },
                    { id: "burger", name: "Cheeseburger", price: 0, station: "Grill", description: "1/4 lb patty with toppings" },
                    { id: "chicken_tenders", name: "Chicken Tenders", price: 0, station: "Grill" },
                    { id: "brownie", name: "Fudge Brownie", price: 0, station: "Dessert" },
                  ],
                  note: "Menu rotates daily. All items included with meal plan swipe ($9.50 guest price).",
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
                title: "Location",
                data: {
                  address: "500 Margaret Dr",
                  building: "Lakeside",
                  nearest_parking: "Lakeside Parking Deck",
                  accepts: ["Dining Dollars", "Bama Cash", "Credit/Debit"],
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
      profile: {
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
              {
                section: "menu",
                title: "Today's Menu",
                data: {
                  items: [
                    { id: "omelet", name: "Made-to-Order Omelet", price: 0, station: "Breakfast", description: "Choose your fillings" },
                    { id: "brick_pizza", name: "Brick Oven Margherita", price: 0, station: "Pizza" },
                    { id: "bbq_chicken", name: "BBQ Chicken", price: 0, station: "Southern", description: "With cornbread" },
                    { id: "garden_salad", name: "Garden Salad Bar", price: 0, station: "Salad" },
                    { id: "tacos", name: "Chicken Tacos", price: 0, station: "Tex-Mex" },
                    { id: "soup", name: "Soup of the Day", price: 0, station: "Comfort" },
                  ],
                  note: "Meal plan swipe or $9.50 guest price.",
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
      profile: {
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
              {
                section: "services",
                title: "Library Services",
                data: {
                  services: [
                    { name: "Study Rooms", description: "20 group study rooms, reserve online", capacity: "2-8 people" },
                    { name: "Computer Lab", description: "100+ workstations, 1st floor", software: "Microsoft Office, SPSS, MATLAB, Adobe CC" },
                    { name: "Printing", description: "B&W $0.05/page, Color $0.25/page. Accepts ACTCard." },
                    { name: "Research Help", description: "Librarians available for 1-on-1 consultations" },
                    { name: "Interlibrary Loan", description: "Request books/articles from other libraries" },
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
  console.log("  Gorgas Library — " + gorgas.id);

  // Student Recreation Center
  const recCenter = await prisma.user.create({
    data: {
      email: "rec@ua.edu",
      passwordHash: pw,
      name: "Student Recreation Center",
      role: "business",
      profile: {
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
              {
                section: "services",
                title: "Facilities & Programs",
                data: {
                  facilities: [
                    { name: "Weight Room", floor: "1st", description: "Free weights, machines, squat racks" },
                    { name: "Cardio Deck", floor: "2nd", description: "Treadmills, bikes, ellipticals" },
                    { name: "Pool", floor: "1st", description: "25-yard lap pool and leisure pool" },
                    { name: "Basketball Courts", floor: "1st", description: "4 full courts" },
                    { name: "Climbing Wall", floor: "1st", description: "30-foot indoor wall, gear provided" },
                  ],
                  group_fitness: ["Yoga", "Spin", "HIIT", "Zumba", "Pilates", "Boxing"],
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
      profile: {
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
      profile: {
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
      profile: {
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
      profile: {
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
      profile: {
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
              {
                section: "services",
                title: "Services & Pricing",
                data: {
                  services: [
                    { id: "mens_haircut", name: "Men's Haircut", duration: 30, price: 20 },
                    { id: "beard_trim", name: "Beard Trim", duration: 15, price: 10 },
                    { id: "cut_beard_combo", name: "Haircut + Beard Combo", duration: 45, price: 28 },
                    { id: "hot_towel_shave", name: "Hot Towel Shave", duration: 30, price: 25 },
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
      profile: {
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
              {
                section: "menu",
                title: "Menu",
                data: {
                  items: [
                    { id: "drip", name: "Drip Coffee", price: 3.00, category: "Hot Drinks" },
                    { id: "latte", name: "Latte", price: 4.50, category: "Hot Drinks" },
                    { id: "cappuccino", name: "Cappuccino", price: 4.50, category: "Hot Drinks" },
                    { id: "americano", name: "Americano", price: 3.50, category: "Hot Drinks" },
                    { id: "cold_brew", name: "Cold Brew", price: 5.00, category: "Cold Drinks" },
                    { id: "iced_latte", name: "Iced Latte", price: 5.00, category: "Cold Drinks" },
                    { id: "croissant", name: "Butter Croissant", price: 3.50, category: "Pastries" },
                    { id: "muffin", name: "Blueberry Muffin", price: 3.00, category: "Pastries" },
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
      profile: {
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
              {
                section: "menu",
                title: "Menu",
                data: {
                  items: [
                    { id: "chicken_plate", name: "Fried Chicken Plate (3pc)", price: 9.99, description: "With 2 sides and roll" },
                    { id: "tender_basket", name: "Chicken Tender Basket", price: 8.49, description: "4 tenders with fries and sauce" },
                    { id: "wings_6", name: "Wings (6pc)", price: 7.99, description: "Choice of sauce" },
                    { id: "wings_12", name: "Wings (12pc)", price: 13.99, description: "Choice of sauce" },
                    { id: "chicken_sandwich", name: "Chicken Sandwich", price: 7.49, description: "With slaw and pickles" },
                    { id: "student_deal", name: "Student Meal Deal", price: 6.99, description: "2 tenders, fries, drink — show student ID" },
                    { id: "mac_cheese", name: "Mac & Cheese (side)", price: 2.99 },
                    { id: "coleslaw", name: "Coleslaw (side)", price: 1.99 },
                    { id: "fries", name: "Fries (side)", price: 2.49 },
                    { id: "sweet_tea", name: "Sweet Tea", price: 1.99 },
                  ],
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
      profile: {
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
      profile: {
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

  const advisorProfile = await prisma.profile.findUnique({ where: { userId: advisorMarcus.id } });
  const tutorProfile = await prisma.profile.findUnique({ where: { userId: tutorJordan.id } });

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
  console.log("  All passwords: password123");
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
