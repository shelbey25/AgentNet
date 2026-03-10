import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding AgentNet platform...\n");

  // Clean in dependency order
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
  console.log("  Cleared existing data");

  const pw = await hash("password123", 12);

  // ═══════════════════════════════════════════════════════
  // BUSINESSES WITH FULL CAPABILITIES + INFO SECTIONS
  // ═══════════════════════════════════════════════════════

  // ─── Crimson Cuts Barbershop ──────────────────────────
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
          bio: "Tuscaloosa's favorite barbershop since 2018. Walk-ins welcome. Clean fades, beard trims, and hot towel shaves.",
          location: "Tuscaloosa, AL",
          status: "available",
          phone: "(205) 555-0101",
          website: "https://crimsoncutsbarber.com",
          address: "1201 University Blvd, Tuscaloosa, AL 35401",
          hours: "Mon-Fri 9am-7pm, Sat 8am-5pm, Sun Closed",
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
                    { id: "mens_haircut", name: "Men's Haircut", duration: 30, price: 20, description: "Classic or modern cuts with hot towel" },
                    { id: "beard_trim", name: "Beard Trim", duration: 15, price: 10, description: "Shape up and line work" },
                    { id: "cut_beard_combo", name: "Haircut + Beard Combo", duration: 45, price: 28, description: "Full service" },
                    { id: "hot_towel_shave", name: "Hot Towel Shave", duration: 30, price: 25, description: "Premium straight razor" },
                  ],
                },
              },
              {
                section: "hours",
                title: "Business Hours",
                data: {
                  hours: [
                    { day: "Monday", open: "9:00", close: "19:00" },
                    { day: "Tuesday", open: "9:00", close: "19:00" },
                    { day: "Wednesday", open: "9:00", close: "19:00" },
                    { day: "Thursday", open: "9:00", close: "19:00" },
                    { day: "Friday", open: "9:00", close: "19:00" },
                    { day: "Saturday", open: "8:00", close: "17:00" },
                    { day: "Sunday", open: null, close: null, closed: true },
                  ],
                },
              },
              {
                section: "location",
                title: "Location",
                data: {
                  address: "1201 University Blvd, Tuscaloosa, AL 35401",
                  lat: 33.2098,
                  lng: -87.5692,
                  parking: "Free parking lot behind building",
                  landmarks: "Near campus, across from Publix",
                },
              },
              {
                section: "about",
                title: "About Us",
                data: {
                  description: "Crimson Cuts has been serving the Tuscaloosa community since 2018. Founded by local barber James Wilson, we offer premium cuts at student-friendly prices.",
                  established: 2018,
                  specialties: ["Fades", "Beard sculpting", "Hot towel shaves"],
                  team_size: 4,
                },
              },
            ],
          },
        },
      },
      messageSettings: { create: {} },
    },
  });
  console.log("  ✓ Crimson Cuts Barbershop (booking, availability, quotes)");

  // ─── Tuscaloosa Chicken House ─────────────────────────
  const chickenHouse = await prisma.user.create({
    data: {
      email: "orders@tuscchickenhouse.com",
      passwordHash: pw,
      name: "Tuscaloosa Chicken House",
      role: "business",
      profile: {
        create: {
          type: "business",
          displayName: "Tuscaloosa Chicken House",
          bio: "Southern fried chicken, sides, and sweet tea. Family-owned since 1995. Takeout and call-ahead orders.",
          location: "Tuscaloosa, AL",
          status: "available",
          phone: "(205) 555-0202",
          address: "803 15th St, Tuscaloosa, AL 35401",
          hours: "Mon-Sat 11am-9pm, Sun 12pm-7pm",
          services: {
            create: [
              { name: "Dine-In", category: "Restaurant", price: "$$" },
              { name: "Takeout", category: "Restaurant", price: "$$" },
              { name: "Catering", description: "Event catering for 20+", category: "Restaurant", price: "Contact for quote" },
            ],
          },
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
                    { id: "chicken_breast", name: "Fried Chicken Breast", price: 6.99, category: "Entrees" },
                    { id: "chicken_tender_3", name: "Chicken Tenders (3pc)", price: 5.99, category: "Entrees" },
                    { id: "chicken_tender_5", name: "Chicken Tenders (5pc)", price: 8.99, category: "Entrees" },
                    { id: "chicken_wings_6", name: "Wings (6pc)", price: 7.49, category: "Entrees" },
                    { id: "chicken_wings_12", name: "Wings (12pc)", price: 13.99, category: "Entrees" },
                    { id: "family_meal", name: "Family Meal (12pc + 3 sides)", price: 29.99, category: "Combos" },
                    { id: "mac_cheese", name: "Mac & Cheese", price: 3.49, category: "Sides" },
                    { id: "collard_greens", name: "Collard Greens", price: 2.99, category: "Sides" },
                    { id: "coleslaw", name: "Coleslaw", price: 2.49, category: "Sides" },
                    { id: "cornbread", name: "Cornbread (2pc)", price: 1.99, category: "Sides" },
                    { id: "sweet_tea", name: "Sweet Tea", price: 1.99, category: "Drinks" },
                    { id: "lemonade", name: "Fresh Lemonade", price: 2.49, category: "Drinks" },
                  ],
                },
              },
              {
                section: "hours",
                title: "Business Hours",
                data: {
                  hours: [
                    { day: "Monday", open: "11:00", close: "21:00" },
                    { day: "Tuesday", open: "11:00", close: "21:00" },
                    { day: "Wednesday", open: "11:00", close: "21:00" },
                    { day: "Thursday", open: "11:00", close: "21:00" },
                    { day: "Friday", open: "11:00", close: "21:00" },
                    { day: "Saturday", open: "11:00", close: "21:00" },
                    { day: "Sunday", open: "12:00", close: "19:00" },
                  ],
                },
              },
              {
                section: "location",
                title: "Location",
                data: {
                  address: "803 15th St, Tuscaloosa, AL 35401",
                  parking: "Street parking and small lot",
                },
              },
            ],
          },
        },
      },
      messageSettings: { create: {} },
    },
  });
  console.log("  ✓ Tuscaloosa Chicken House (ordering, quotes)");

  // ─── Tuscaloosa Tutoring Center ──────────────────────
  const tuscTutoring = await prisma.user.create({
    data: {
      email: "contact@tusctutoring.com",
      passwordHash: pw,
      name: "Tuscaloosa Tutoring Center",
      role: "business",
      profile: {
        create: {
          type: "business",
          displayName: "Tuscaloosa Tutoring Center",
          bio: "Professional tutoring for UA students and Tuscaloosa K-12. All subjects. In-person or online. Now hiring tutors!",
          location: "Tuscaloosa, AL",
          status: "hiring",
          phone: "(205) 555-0303",
          website: "https://tusctutoring.com",
          address: "800 Lurleen Wallace Blvd, Tuscaloosa, AL 35401",
          hours: "Mon-Sat 9am-9pm, Sun 1pm-6pm",
          services: {
            create: [
              { name: "Math Tutoring", description: "Algebra through Calc III", category: "Tutoring", price: "$35/hr", duration: 60, isBookable: true },
              { name: "Science Tutoring", description: "Bio, Chem, Physics", category: "Tutoring", price: "$35/hr", duration: 60, isBookable: true },
              { name: "Writing Lab", description: "Essays and research papers", category: "Tutoring", price: "$30/hr", duration: 60, isBookable: true },
              { name: "ACT/SAT/GRE Prep", description: "Structured prep package", category: "Test Prep", price: "$200/4-session", duration: 90, isBookable: true },
            ],
          },
          capabilities: {
            create: [
              { type: "booking" },
              { type: "availability" },
              { type: "messaging" },
              { type: "service_requests" },
              { type: "quotes" },
            ],
          },
          infoSections: {
            create: [
              {
                section: "services",
                title: "Tutoring Services",
                data: {
                  services: [
                    { id: "math_tutoring", name: "Math Tutoring", subjects: ["Algebra", "Calculus I-III", "Statistics", "Linear Algebra"], price_per_hour: 35, duration: 60 },
                    { id: "science_tutoring", name: "Science Tutoring", subjects: ["Biology", "Chemistry", "Physics"], price_per_hour: 35, duration: 60 },
                    { id: "writing_lab", name: "Writing Lab", subjects: ["Essays", "Research Papers", "Grammar"], price_per_hour: 30, duration: 60 },
                    { id: "test_prep", name: "ACT/SAT/GRE Prep", format: "4-session package", price: 200, duration: 90 },
                  ],
                },
              },
              {
                section: "hours",
                title: "Business Hours",
                data: {
                  hours: [
                    { day: "Monday-Saturday", open: "9:00", close: "21:00" },
                    { day: "Sunday", open: "13:00", close: "18:00" },
                  ],
                },
              },
              {
                section: "faq",
                title: "Frequently Asked Questions",
                data: {
                  questions: [
                    { q: "Do you offer online sessions?", a: "Yes, all tutoring is available via Zoom." },
                    { q: "What's your cancellation policy?", a: "Cancel 24 hours in advance for a full refund." },
                    { q: "Do you offer group rates?", a: "Yes, groups of 3+ get 20% off per person." },
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
  console.log("  ✓ Tuscaloosa Tutoring Center (booking, availability, quotes, service_requests)");

  // ─── Black Warrior Coffee Co. ─────────────────────────
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
          bio: "Local coffee shop and coworking space. Great wifi, local pastries, and community vibes. Now hiring baristas!",
          location: "Tuscaloosa, AL",
          status: "hiring",
          phone: "(205) 555-0404",
          address: "2300 4th St, Tuscaloosa, AL 35401",
          hours: "Mon-Fri 6am-8pm, Sat-Sun 7am-6pm",
          services: {
            create: [
              { name: "Coffee & Espresso", category: "Food & Drink", price: "$3-6" },
              { name: "Coworking Space", description: "Day pass", category: "Workspace", price: "$10/day" },
              { name: "Event Space Rental", description: "2hr blocks", category: "Events", price: "$75/2hr", duration: 120, isBookable: true },
            ],
          },
          capabilities: {
            create: [
              { type: "ordering" },
              { type: "booking" },
              { type: "messaging" },
            ],
          },
          infoSections: {
            create: [
              {
                section: "menu",
                title: "Coffee Menu",
                data: {
                  items: [
                    { id: "drip_coffee", name: "Drip Coffee", price: 3.00, sizes: ["S", "M", "L"] },
                    { id: "latte", name: "Latte", price: 4.50, sizes: ["S", "M", "L"] },
                    { id: "cold_brew", name: "Cold Brew", price: 4.00, sizes: ["M", "L"] },
                    { id: "cappuccino", name: "Cappuccino", price: 4.50, sizes: ["S", "M"] },
                    { id: "mocha", name: "Mocha", price: 5.00, sizes: ["S", "M", "L"] },
                    { id: "croissant", name: "Butter Croissant", price: 3.50, category: "Pastry" },
                    { id: "muffin", name: "Blueberry Muffin", price: 3.00, category: "Pastry" },
                  ],
                },
              },
              {
                section: "hours",
                title: "Hours",
                data: {
                  hours: [
                    { day: "Monday-Friday", open: "6:00", close: "20:00" },
                    { day: "Saturday-Sunday", open: "7:00", close: "18:00" },
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
  console.log("  ✓ Black Warrior Coffee Co. (ordering, booking)");

  // ─── Tide Auto Repair ─────────────────────────────────
  const tideAuto = await prisma.user.create({
    data: {
      email: "service@tideautorepair.com",
      passwordHash: pw,
      name: "Tide Auto Repair",
      role: "business",
      profile: {
        create: {
          type: "business",
          displayName: "Tide Auto Repair",
          bio: "Honest, affordable auto repair. ASE certified. Student discount. Oil changes, brakes, engine work.",
          location: "Tuscaloosa, AL",
          status: "available",
          phone: "(205) 555-0505",
          address: "1500 McFarland Blvd E, Tuscaloosa, AL 35404",
          hours: "Mon-Fri 7:30am-5:30pm, Sat 8am-12pm",
          services: {
            create: [
              { name: "Oil Change", description: "Conventional or synthetic", category: "Auto", price: "$30-55", duration: 30, isBookable: true },
              { name: "Brake Service", description: "Pads, rotors, fluid", category: "Auto", price: "Starting at $120", duration: 90, isBookable: true },
              { name: "Engine Diagnostics", description: "Check engine light", category: "Auto", price: "$50", duration: 60, isBookable: true },
              { name: "Tire Service", description: "Rotation, balancing, flat repair", category: "Auto", price: "$15-40", duration: 45, isBookable: true },
            ],
          },
          capabilities: {
            create: [
              { type: "booking" },
              { type: "availability" },
              { type: "quotes" },
              { type: "messaging" },
            ],
          },
          infoSections: {
            create: [
              {
                section: "services",
                title: "Auto Services",
                data: {
                  services: [
                    { id: "oil_change", name: "Oil Change", price_range: "$30-55", duration: 30, includes: ["Filter", "Fluid check", "Multi-point inspection"] },
                    { id: "brake_service", name: "Brake Service", price_range: "$120+", duration: 90, includes: ["Pad replacement", "Rotor inspection", "Fluid check"] },
                    { id: "diagnostics", name: "Engine Diagnostics", price: 50, duration: 60 },
                    { id: "tire_service", name: "Tire Service", price_range: "$15-40", duration: 45 },
                  ],
                },
              },
              {
                section: "policies",
                title: "Policies",
                data: {
                  student_discount: "10% off with valid UA student ID",
                  warranty: "12-month / 12,000-mile warranty on parts and labor",
                  payment: ["Cash", "Credit/Debit", "Venmo", "CashApp"],
                },
              },
            ],
          },
        },
      },
      messageSettings: { create: {} },
    },
  });
  console.log("  ✓ Tide Auto Repair (booking, availability, quotes)");

  // ─── Campus Cleaners ──────────────────────────────────
  const campusCleaners = await prisma.user.create({
    data: {
      email: "book@campuscleanerstuscaloosa.com",
      passwordHash: pw,
      name: "Campus Cleaners",
      role: "business",
      profile: {
        create: {
          type: "business",
          displayName: "Campus Cleaners",
          bio: "Residential cleaning for apartments, dorms, and student housing. Move-in/move-out cleaning specialists.",
          location: "Tuscaloosa, AL",
          status: "available",
          phone: "(205) 555-0606",
          hours: "Mon-Sat 8am-6pm",
          services: {
            create: [
              { name: "Standard Cleaning", description: "Kitchen, baths, floors", category: "Cleaning", price: "$80-120", duration: 120, isBookable: true },
              { name: "Deep Cleaning", description: "Full detail including appliances", category: "Cleaning", price: "$150-250", duration: 180, isBookable: true },
              { name: "Move-out Cleaning", description: "Get your deposit back!", category: "Cleaning", price: "$175-300", duration: 240, isBookable: true },
            ],
          },
          capabilities: {
            create: [
              { type: "booking" },
              { type: "availability" },
              { type: "quotes" },
              { type: "service_requests" },
              { type: "messaging" },
            ],
          },
          infoSections: {
            create: [
              {
                section: "services",
                title: "Cleaning Services",
                data: {
                  services: [
                    { id: "standard", name: "Standard Cleaning", price_range: "$80-120", duration_hours: 2, includes: ["Kitchen", "Bathrooms", "Floors", "Dusting"] },
                    { id: "deep", name: "Deep Cleaning", price_range: "$150-250", duration_hours: 3, includes: ["Everything in Standard", "Appliances", "Baseboards", "Windows"] },
                    { id: "moveout", name: "Move-out Cleaning", price_range: "$175-300", duration_hours: 4, includes: ["Full deep clean", "Carpet treatment", "Wall marks removal"] },
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
  console.log("  ✓ Campus Cleaners (booking, availability, quotes, service_requests)");

  // ═══════════════════════════════════════════════════════
  // PEOPLE PROFILES
  // ═══════════════════════════════════════════════════════

  const marcus = await prisma.user.create({
    data: {
      email: "marcus.jones@ua.edu",
      passwordHash: pw,
      name: "Marcus Jones",
      role: "person",
      profile: {
        create: {
          type: "person",
          displayName: "Marcus Jones",
          bio: "CS senior at UA. Python tutoring, web development. Available part-time.",
          location: "Tuscaloosa, AL",
          status: "looking_for_work",
          skills: {
            create: [
              { name: "Python", category: "Programming" },
              { name: "JavaScript", category: "Programming" },
              { name: "React/Next.js", category: "Programming" },
              { name: "Calculus", category: "Tutoring" },
              { name: "Data Structures", category: "Tutoring" },
            ],
          },
          services: {
            create: [
              { name: "Math Tutoring", description: "Calc I-III, algebra, statistics", category: "Tutoring", price: "$25/hr", duration: 60, isBookable: true },
              { name: "Python Tutoring", description: "Beginner to intermediate", category: "Tutoring", price: "$30/hr", duration: 60, isBookable: true },
              { name: "Web Development", description: "React/Next.js projects", category: "Freelance", price: "Starting at $200" },
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
  console.log("  ✓ Marcus Jones (CS tutor, looking for work)");

  const jamal = await prisma.user.create({
    data: {
      email: "jamal.carter@gmail.com",
      passwordHash: pw,
      name: "Jamal Carter",
      role: "person",
      profile: {
        create: {
          type: "person",
          displayName: "Jamal Carter",
          bio: "Tuscaloosa native. Landscaping and handyman work. Reliable and affordable.",
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
              { name: "Lawn Mowing", description: "Weekly or biweekly", category: "Landscaping", price: "$35-50/visit" },
              { name: "Pressure Washing", description: "Driveways, decks, siding", category: "Home Services", price: "Starting at $75" },
              { name: "General Handyman", description: "Repairs, fence, gutters", category: "Handyman", price: "$25/hr" },
            ],
          },
          capabilities: {
            create: [
              { type: "quotes" },
              { type: "messaging" },
              { type: "service_requests" },
            ],
          },
        },
      },
      messageSettings: { create: {} },
    },
  });
  console.log("  ✓ Jamal Carter (landscaping, handyman)");

  const emily = await prisma.user.create({
    data: {
      email: "emily.chen@ua.edu",
      passwordHash: pw,
      name: "Emily Chen",
      role: "person",
      profile: {
        create: {
          type: "person",
          displayName: "Emily Chen",
          bio: "Graphic design student at UA. Logos, flyers, social media content.",
          location: "Tuscaloosa, AL",
          status: "looking_for_work",
          skills: {
            create: [
              { name: "Graphic Design", category: "Design" },
              { name: "Logo Design", category: "Design" },
              { name: "Social Media", category: "Marketing" },
              { name: "Figma", category: "Design" },
              { name: "Adobe Illustrator", category: "Design" },
            ],
          },
          services: {
            create: [
              { name: "Logo Design", description: "3 concepts, 2 revision rounds", category: "Design", price: "$75-150" },
              { name: "Social Media Package", description: "10 branded posts", category: "Marketing", price: "$100" },
              { name: "Flyer Design", description: "Events, menus, promo", category: "Design", price: "$30-50/flyer" },
            ],
          },
          capabilities: {
            create: [
              { type: "quotes" },
              { type: "messaging" },
              { type: "service_requests" },
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
      passwordHash: pw,
      name: "Devon Brooks",
      role: "person",
      profile: {
        create: {
          type: "person",
          displayName: "Devon Brooks",
          bio: "Personal trainer and kinesiology student. Custom workouts and nutrition.",
          location: "Tuscaloosa, AL",
          status: "available",
          skills: {
            create: [
              { name: "Personal Training", category: "Fitness" },
              { name: "Nutrition Coaching", category: "Health" },
              { name: "Weight Training", category: "Fitness" },
              { name: "HIIT", category: "Fitness" },
            ],
          },
          services: {
            create: [
              { name: "Personal Training", description: "1-on-1 sessions", category: "Fitness", price: "$40/session", duration: 60, isBookable: true },
              { name: "Nutrition Plan", description: "Custom meal plan", category: "Health", price: "$50 one-time" },
              { name: "Group Fitness", description: "HIIT/bootcamp 4-8 people", category: "Fitness", price: "$10/person", duration: 45, isBookable: true },
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
  console.log("  ✓ Devon Brooks (personal trainer)");

  const ashley = await prisma.user.create({
    data: {
      email: "ashley.morgan@outlook.com",
      passwordHash: pw,
      name: "Ashley Morgan",
      role: "person",
      profile: {
        create: {
          type: "person",
          displayName: "Ashley Morgan",
          bio: "Licensed cosmetologist. Braids, locs, cuts, and color. Home studio near campus.",
          location: "Tuscaloosa, AL",
          status: "available",
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
              { name: "Box Braids", description: "Medium or small, all lengths", category: "Hair", price: "$120-200", duration: 180, isBookable: true },
              { name: "Loc Maintenance", description: "Retwist, repair, styling", category: "Hair", price: "$60-100", duration: 90, isBookable: true },
              { name: "Haircut & Style", description: "Men's and women's", category: "Hair", price: "$25-45", duration: 45, isBookable: true },
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
  console.log("  ✓ Ashley Morgan (cosmetologist)");

  // ═══════════════════════════════════════════════════════
  // SAMPLE DATA
  // ═══════════════════════════════════════════════════════

  // Sample messages
  const tuscTutoringUser = await prisma.user.findUnique({ where: { email: "contact@tusctutoring.com" } });
  const marcusUser = await prisma.user.findUnique({ where: { email: "marcus.jones@ua.edu" } });
  if (tuscTutoringUser && marcusUser) {
    await prisma.message.create({
      data: {
        senderId: tuscTutoringUser.id,
        recipientId: marcusUser.id,
        subject: "Tutoring Position — Math & CS",
        body: "Hi Marcus! We saw your profile and we're looking for math and CS tutors. Starting pay $18/hr. Interested?",
      },
    });
  }

  // Summary
  const counts = {
    users: await prisma.user.count(),
    profiles: await prisma.profile.count(),
    skills: await prisma.skill.count(),
    services: await prisma.service.count(),
    capabilities: await prisma.capability.count(),
    infoSections: await prisma.infoSection.count(),
    messages: await prisma.message.count(),
  };

  console.log(`
✅ Platform seed complete!

  ${counts.users} users (${await prisma.user.count({ where: { role: "person" } })} people, ${await prisma.user.count({ where: { role: "business" } })} businesses)
  ${counts.profiles} profiles
  ${counts.skills} skills
  ${counts.services} services
  ${counts.capabilities} capabilities
  ${counts.infoSections} info sections
  ${counts.messages} messages

  All accounts use password: password123
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
