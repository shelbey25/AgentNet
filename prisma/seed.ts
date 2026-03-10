import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding AgentNet database...\n");

  // Clean existing data
  await prisma.message.deleteMany();
  await prisma.apiKey.deleteMany();
  await prisma.messageSettings.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.service.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();
  console.log("  Cleared existing data");

  const passwordHash = await hash("password123", 12);

  // ─── PEOPLE ──────────────────────────────────────────

  const marcus = await prisma.user.create({
    data: {
      email: "marcus.jones@ua.edu",
      passwordHash,
      name: "Marcus Jones",
      role: "person",
      profile: {
        create: {
          type: "person",
          displayName: "Marcus Jones",
          bio: "CS senior at UA. Available for tutoring in math, Python, and data structures. Also do freelance web development. Looking for part-time work or internship opportunities.",
          location: "Tuscaloosa, AL",
          status: "looking_for_work",
          skills: {
            create: [
              { name: "Python", category: "Programming" },
              { name: "JavaScript", category: "Programming" },
              { name: "Calculus", category: "Tutoring" },
              { name: "Data Structures", category: "Tutoring" },
              { name: "Web Development", category: "Programming" },
            ],
          },
          services: {
            create: [
              { name: "Math Tutoring", description: "Calculus I, II, and III. Also algebra and statistics.", category: "Tutoring", price: "$25/hr" },
              { name: "Python Tutoring", description: "Beginner to intermediate Python programming.", category: "Tutoring", price: "$30/hr" },
              { name: "Web Development", description: "Custom websites and web apps using React/Next.js.", category: "Freelance", price: "Starting at $200" },
            ],
          },
        },
      },
      messageSettings: { create: {} },
    },
  });
  console.log("  ✓ Marcus Jones (CS tutor, looking for work)");

  const sarah = await prisma.user.create({
    data: {
      email: "sarah.williams@crimson.ua.edu",
      passwordHash,
      name: "Sarah Williams",
      role: "person",
      profile: {
        create: {
          type: "person",
          displayName: "Sarah Williams",
          bio: "Graduate student in Education. Experienced tutor for K-12 students. Specializing in reading, writing, and test prep. Available weekends and evenings.",
          location: "Tuscaloosa, AL",
          status: "available",
          skills: {
            create: [
              { name: "Reading Comprehension", category: "Tutoring" },
              { name: "Essay Writing", category: "Tutoring" },
              { name: "ACT Prep", category: "Test Prep" },
              { name: "SAT Prep", category: "Test Prep" },
              { name: "K-12 Education", category: "Teaching" },
            ],
          },
          services: {
            create: [
              { name: "ACT/SAT Prep", description: "Structured test prep sessions. Average 4-point ACT improvement.", category: "Test Prep", price: "$40/hr" },
              { name: "Essay Coaching", description: "Help with college essays, research papers, and creative writing.", category: "Tutoring", price: "$30/hr" },
            ],
          },
        },
      },
      messageSettings: { create: {} },
    },
  });
  console.log("  ✓ Sarah Williams (education tutor)");

  const jamal = await prisma.user.create({
    data: {
      email: "jamal.carter@gmail.com",
      passwordHash,
      name: "Jamal Carter",
      role: "person",
      profile: {
        create: {
          type: "person",
          displayName: "Jamal Carter",
          bio: "Tuscaloosa native. Experienced landscaper and handyman. No job too small. Reliable, affordable, and available weekdays.",
          location: "Tuscaloosa, AL",
          status: "available",
          skills: {
            create: [
              { name: "Lawn Care", category: "Landscaping" },
              { name: "Pressure Washing", category: "Home Services" },
              { name: "Fence Repair", category: "Handyman" },
              { name: "Gutter Cleaning", category: "Home Services" },
              { name: "Tree Trimming", category: "Landscaping" },
            ],
          },
          services: {
            create: [
              { name: "Lawn Mowing & Edging", description: "Weekly or biweekly lawn maintenance. Most residential lawns.", category: "Landscaping", price: "$35-50/visit" },
              { name: "Pressure Washing", description: "Driveways, sidewalks, decks, and siding.", category: "Home Services", price: "Starting at $75" },
              { name: "General Handyman", description: "Minor repairs, fence work, gutter cleaning, and more.", category: "Handyman", price: "$25/hr" },
            ],
          },
        },
      },
      messageSettings: { create: {} },
    },
  });
  console.log("  ✓ Jamal Carter (landscaping & handyman)");

  const emily = await prisma.user.create({
    data: {
      email: "emily.chen@ua.edu",
      passwordHash,
      name: "Emily Chen",
      role: "person",
      profile: {
        create: {
          type: "person",
          displayName: "Emily Chen",
          bio: "Junior studying graphic design at UA. Available for freelance design work — logos, flyers, social media content. Building my portfolio!",
          location: "Tuscaloosa, AL",
          status: "looking_for_work",
          skills: {
            create: [
              { name: "Graphic Design", category: "Design" },
              { name: "Logo Design", category: "Design" },
              { name: "Social Media Content", category: "Marketing" },
              { name: "Figma", category: "Design" },
              { name: "Adobe Illustrator", category: "Design" },
            ],
          },
          services: {
            create: [
              { name: "Logo Design", description: "Custom logo design with 3 concepts and 2 revision rounds.", category: "Design", price: "$75-150" },
              { name: "Social Media Package", description: "10 branded posts for Instagram/TikTok.", category: "Marketing", price: "$100" },
              { name: "Flyer Design", description: "Event flyers, menus, or promotional material.", category: "Design", price: "$30-50/flyer" },
            ],
          },
        },
      },
      messageSettings: { create: {} },
    },
  });
  console.log("  ✓ Emily Chen (graphic designer)");

  const devon = await prisma.user.create({
    data: {
      email: "devon.brooks@gmail.com",
      passwordHash,
      name: "Devon Brooks",
      role: "person",
      profile: {
        create: {
          type: "person",
          displayName: "Devon Brooks",
          bio: "Personal trainer and UA kinesiology student. I help people reach their fitness goals with customized workout plans and nutrition coaching.",
          location: "Tuscaloosa, AL",
          status: "available",
          skills: {
            create: [
              { name: "Personal Training", category: "Fitness" },
              { name: "Nutrition Coaching", category: "Health" },
              { name: "Weight Training", category: "Fitness" },
              { name: "HIIT", category: "Fitness" },
              { name: "Sports Performance", category: "Fitness" },
            ],
          },
          services: {
            create: [
              { name: "Personal Training (1-on-1)", description: "Custom workout sessions at the Rec Center or outdoors.", category: "Fitness", price: "$40/session" },
              { name: "Nutrition Plan", description: "Customized meal plan with macro targets.", category: "Health", price: "$50 one-time" },
              { name: "Group Fitness Class", description: "HIIT or bootcamp, 4-8 people.", category: "Fitness", price: "$10/person" },
            ],
          },
        },
      },
      messageSettings: { create: {} },
    },
  });
  console.log("  ✓ Devon Brooks (personal trainer)");

  const ashley = await prisma.user.create({
    data: {
      email: "ashley.morgan@outlook.com",
      passwordHash,
      name: "Ashley Morgan",
      role: "person",
      profile: {
        create: {
          type: "person",
          displayName: "Ashley Morgan",
          bio: "Licensed cosmetologist. I do braids, locs, cuts, and color. Home studio near campus. Book through DM or in-app message.",
          location: "Tuscaloosa, AL",
          status: "available",
          skills: {
            create: [
              { name: "Braiding", category: "Hair" },
              { name: "Locs", category: "Hair" },
              { name: "Hair Coloring", category: "Hair" },
              { name: "Haircuts", category: "Hair" },
              { name: "Natural Hair Care", category: "Hair" },
            ],
          },
          services: {
            create: [
              { name: "Box Braids", description: "Medium or small box braids, all lengths.", category: "Hair", price: "$120-200" },
              { name: "Loc Maintenance", description: "Retwist, repair, and styling.", category: "Hair", price: "$60-100" },
              { name: "Haircut & Style", description: "Men's and women's cuts.", category: "Hair", price: "$25-45" },
            ],
          },
        },
      },
      messageSettings: { create: {} },
    },
  });
  console.log("  ✓ Ashley Morgan (cosmetologist)");

  const tyler = await prisma.user.create({
    data: {
      email: "tyler.reed@ua.edu",
      passwordHash,
      name: "Tyler Reed",
      role: "person",
      profile: {
        create: {
          type: "person",
          displayName: "Tyler Reed",
          bio: "Accounting major looking for bookkeeping or data entry work. Detail-oriented and available 20 hours/week. Proficient in Excel and QuickBooks.",
          location: "Tuscaloosa, AL",
          status: "looking_for_work",
          skills: {
            create: [
              { name: "Bookkeeping", category: "Finance" },
              { name: "Excel", category: "Software" },
              { name: "QuickBooks", category: "Software" },
              { name: "Data Entry", category: "Admin" },
              { name: "Tax Preparation", category: "Finance" },
            ],
          },
          services: {
            create: [
              { name: "Bookkeeping", description: "Monthly bookkeeping for small businesses.", category: "Finance", price: "$150/month" },
              { name: "Tax Help", description: "Help with simple tax returns and filing.", category: "Finance", price: "$50/return" },
            ],
          },
        },
      },
      messageSettings: { create: {} },
    },
  });
  console.log("  ✓ Tyler Reed (bookkeeping, looking for work)");

  // ─── BUSINESSES ──────────────────────────────────────

  const crimsonCuts = await prisma.user.create({
    data: {
      email: "info@crimsoncutsbarber.com",
      passwordHash,
      name: "Crimson Cuts Barbershop",
      role: "business",
      profile: {
        create: {
          type: "business",
          displayName: "Crimson Cuts Barbershop",
          bio: "Tuscaloosa's favorite barbershop since 2018. Walk-ins welcome. Located on University Blvd near campus. Clean fades, beard trims, and hot towel shaves.",
          location: "Tuscaloosa, AL",
          status: "available",
          phone: "(205) 555-0101",
          website: "https://crimsoncutsbarber.com",
          address: "1201 University Blvd, Tuscaloosa, AL 35401",
          hours: "Mon-Fri 9am-7pm, Sat 8am-5pm, Sun Closed",
          services: {
            create: [
              { name: "Men's Haircut", description: "Classic or modern cuts. Includes hot towel and neck trim.", category: "Barber", price: "$20" },
              { name: "Beard Trim", description: "Shape up and line work.", category: "Barber", price: "$10" },
              { name: "Haircut + Beard Combo", description: "Full service cut and beard trim.", category: "Barber", price: "$28" },
              { name: "Hot Towel Shave", description: "Premium straight razor shave.", category: "Barber", price: "$25" },
            ],
          },
        },
      },
      messageSettings: { create: {} },
    },
  });
  console.log("  ✓ Crimson Cuts Barbershop");

  const druidCityPrint = await prisma.user.create({
    data: {
      email: "orders@druidcityprint.com",
      passwordHash,
      name: "Druid City Print Shop",
      role: "business",
      profile: {
        create: {
          type: "business",
          displayName: "Druid City Print Shop",
          bio: "Custom t-shirts, stickers, banners, and promotional items. We work with student organizations, local businesses, and events. Fast turnaround.",
          location: "Tuscaloosa, AL",
          status: "available",
          phone: "(205) 555-0202",
          website: "https://druidcityprint.com",
          address: "420 22nd Ave, Tuscaloosa, AL 35401",
          hours: "Mon-Fri 10am-6pm, Sat 10am-2pm",
          services: {
            create: [
              { name: "Custom T-Shirts", description: "Screen print or DTG. Minimum 12 for screen print.", category: "Printing", price: "Starting at $8/shirt" },
              { name: "Stickers & Decals", description: "Die-cut or kiss-cut vinyl stickers.", category: "Printing", price: "Starting at $0.50/ea" },
              { name: "Banners & Signs", description: "Vinyl banners, yard signs, and event signage.", category: "Printing", price: "Starting at $30" },
              { name: "Business Cards", description: "500 premium business cards.", category: "Printing", price: "$35" },
            ],
          },
        },
      },
      messageSettings: { create: {} },
    },
  });
  console.log("  ✓ Druid City Print Shop");

  const tuscTutoring = await prisma.user.create({
    data: {
      email: "contact@tusctutoring.com",
      passwordHash,
      name: "Tuscaloosa Tutoring Center",
      role: "business",
      profile: {
        create: {
          type: "business",
          displayName: "Tuscaloosa Tutoring Center",
          bio: "Professional tutoring for UA students and Tuscaloosa K-12. All subjects. Certified tutors. In-person or online sessions available. Now hiring tutors!",
          location: "Tuscaloosa, AL",
          status: "hiring",
          phone: "(205) 555-0303",
          website: "https://tusctutoring.com",
          address: "800 Lurleen Wallace Blvd, Tuscaloosa, AL 35401",
          hours: "Mon-Sat 9am-9pm, Sun 1pm-6pm",
          services: {
            create: [
              { name: "Math Tutoring", description: "Algebra through Calculus III. One-on-one sessions.", category: "Tutoring", price: "$35/hr" },
              { name: "Science Tutoring", description: "Biology, Chemistry, and Physics.", category: "Tutoring", price: "$35/hr" },
              { name: "Writing Lab", description: "Essay help, grammar, and research paper support.", category: "Tutoring", price: "$30/hr" },
              { name: "Test Prep (ACT/SAT/GRE)", description: "Structured prep packages with practice tests.", category: "Test Prep", price: "$200/4-session package" },
            ],
          },
        },
      },
      messageSettings: { create: {} },
    },
  });
  console.log("  ✓ Tuscaloosa Tutoring Center (hiring)");

  const blackWarriorCoffee = await prisma.user.create({
    data: {
      email: "hello@blackwarriorcoffee.com",
      passwordHash,
      name: "Black Warrior Coffee Co.",
      role: "business",
      profile: {
        create: {
          type: "business",
          displayName: "Black Warrior Coffee Co.",
          bio: "Local coffee shop and coworking space. Great wifi, local pastries, and community vibes. Perfect for studying, meetings, or just hanging out. Now hiring baristas!",
          location: "Tuscaloosa, AL",
          status: "hiring",
          phone: "(205) 555-0404",
          address: "2300 4th St, Tuscaloosa, AL 35401",
          hours: "Mon-Fri 6am-8pm, Sat-Sun 7am-6pm",
          services: {
            create: [
              { name: "Coffee & Espresso", description: "Locally roasted beans. Lattes, cold brew, pour-over.", category: "Food & Drink", price: "$3-6" },
              { name: "Coworking Space", description: "Day passes for our upstairs coworking area. Wifi, outlets, quiet zone.", category: "Workspace", price: "$10/day" },
              { name: "Event Space Rental", description: "Host meetings, workshops, or small events.", category: "Events", price: "$75/2hr block" },
            ],
          },
        },
      },
      messageSettings: { create: {} },
    },
  });
  console.log("  ✓ Black Warrior Coffee Co. (hiring)");

  const tideAutoRepair = await prisma.user.create({
    data: {
      email: "service@tideautorepair.com",
      passwordHash,
      name: "Tide Auto Repair",
      role: "business",
      profile: {
        create: {
          type: "business",
          displayName: "Tide Auto Repair",
          bio: "Honest, affordable auto repair for Tuscaloosa. ASE certified mechanics. Oil changes, brakes, engine work, and more. Student discount available.",
          location: "Tuscaloosa, AL",
          status: "available",
          phone: "(205) 555-0505",
          address: "1500 McFarland Blvd E, Tuscaloosa, AL 35404",
          hours: "Mon-Fri 7:30am-5:30pm, Sat 8am-12pm",
          services: {
            create: [
              { name: "Oil Change", description: "Conventional or synthetic. Includes filter and fluid check.", category: "Auto", price: "$30-55" },
              { name: "Brake Service", description: "Pad replacement, rotor resurfacing, brake fluid flush.", category: "Auto", price: "Starting at $120" },
              { name: "Engine Diagnostics", description: "Full computer diagnostic. Check engine light troubleshooting.", category: "Auto", price: "$50" },
              { name: "Tire Service", description: "Rotation, balancing, flat repair.", category: "Auto", price: "$15-40" },
            ],
          },
        },
      },
      messageSettings: { create: {} },
    },
  });
  console.log("  ✓ Tide Auto Repair");

  const campusCleaners = await prisma.user.create({
    data: {
      email: "book@campuscleanerstuscaloosa.com",
      passwordHash,
      name: "Campus Cleaners",
      role: "business",
      profile: {
        create: {
          type: "business",
          displayName: "Campus Cleaners",
          bio: "Residential cleaning service specializing in apartments, dorms, and student housing. Move-in/move-out cleaning our specialty. Book online or message us.",
          location: "Tuscaloosa, AL",
          status: "available",
          phone: "(205) 555-0606",
          hours: "Mon-Sat 8am-6pm",
          services: {
            create: [
              { name: "Standard Cleaning", description: "Kitchen, bathrooms, floors, dusting. 1-2 bedroom apartment.", category: "Cleaning", price: "$80-120" },
              { name: "Deep Cleaning", description: "Everything in standard plus appliances, baseboards, windows.", category: "Cleaning", price: "$150-250" },
              { name: "Move-out Cleaning", description: "Get your deposit back! Thorough cleaning for apartment turnover.", category: "Cleaning", price: "$175-300" },
            ],
          },
        },
      },
      messageSettings: { create: {} },
    },
  });
  console.log("  ✓ Campus Cleaners");

  // ─── SAMPLE MESSAGES ─────────────────────────────────

  // Get user IDs for messaging
  const marcusData = await prisma.user.findUnique({ where: { email: "marcus.jones@ua.edu" } });
  const tuscTutoringData = await prisma.user.findUnique({ where: { email: "contact@tusctutoring.com" } });
  const emilyData = await prisma.user.findUnique({ where: { email: "emily.chen@ua.edu" } });
  const druidCityData = await prisma.user.findUnique({ where: { email: "orders@druidcityprint.com" } });

  if (marcusData && tuscTutoringData) {
    await prisma.message.create({
      data: {
        senderId: tuscTutoringData.id,
        recipientId: marcusData.id,
        subject: "Tutoring Position — Math & CS",
        body: "Hi Marcus! We saw your profile and we're looking for math and CS tutors for the spring semester. Starting pay is $18/hr. If you're interested, message us back or stop by our office on Lurleen Wallace Blvd. We'd love to have you on the team!",
        isRead: false,
      },
    });
    console.log("  ✓ Sample message: Tusc Tutoring → Marcus");
  }

  if (emilyData && druidCityData) {
    await prisma.message.create({
      data: {
        senderId: emilyData.id,
        recipientId: druidCityData.id,
        subject: "Freelance Design Interest",
        body: "Hey! I'm a graphic design student at UA looking for freelance work. I saw you do custom printing — do you ever need designers to help clients with their artwork? I'd love to collaborate. Check out my profile for samples of my work!",
        isRead: false,
      },
    });
    console.log("  ✓ Sample message: Emily → Druid City Print");
  }

  // ─── SUMMARY ─────────────────────────────────────────

  const userCount = await prisma.user.count();
  const profileCount = await prisma.profile.count();
  const skillCount = await prisma.skill.count();
  const serviceCount = await prisma.service.count();
  const messageCount = await prisma.message.count();

  console.log(`
✅ Seed complete!

  ${userCount} users (${await prisma.user.count({ where: { role: "person" } })} people, ${await prisma.user.count({ where: { role: "business" } })} businesses)
  ${profileCount} profiles
  ${skillCount} skills
  ${serviceCount} services
  ${messageCount} messages

  All accounts use password: password123
  Login with any email above to test.
`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
