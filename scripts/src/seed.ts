import { db, usersTable, propertiesTable, bookingsTable } from "@workspace/db";
import bcrypt from "bcryptjs";
import { sql } from "drizzle-orm";

async function seed() {
  console.log("🌱 Seeding database...");

  await db.delete(bookingsTable);
  await db.delete(propertiesTable);
  await db.delete(usersTable);

  const hashedPassword = await bcrypt.hash("123456", 10);

  const users = await db.insert(usersTable).values([
    { email: "admin1@azzam.com", password: hashedPassword, name: "Admin One", role: "admin" },
    { email: "admin2@azzam.com", password: hashedPassword, name: "Admin Two", role: "admin" },
    { email: "user@azzam.com", password: hashedPassword, name: "Test User", role: "user" },
  ]).returning();

  console.log("✅ Users created:", users.length);

  const properties = await db.insert(propertiesTable).values([
    {
      title: "Luxury Villa in Al-Narjis",
      titleAr: "فيلا فاخرة في حي النرجس",
      description: "A stunning luxury villa with modern design, spacious rooms, and beautiful garden in the prestigious Al-Narjis district.",
      descriptionAr: "فيلا فاخرة مذهلة بتصميم عصري وغرف واسعة وحديقة جميلة في حي النرجس الراقي.",
      price: 3500000,
      location: "Al-Narjis District",
      locationAr: "حي النرجس",
      city: "Riyadh",
      cityAr: "الرياض",
      type: "villa",
      status: "available",
      area: 600,
      images: [
        "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80",
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80",
      ],
    },
    {
      title: "Modern Apartment - Al-Malaz",
      titleAr: "شقة عصرية - حي الملز",
      description: "Elegant modern apartment on the 12th floor with panoramic city views, fully equipped kitchen, and premium finishes.",
      descriptionAr: "شقة عصرية أنيقة في الطابق الثاني عشر مع إطلالة بانورامية على المدينة، مطبخ مجهز بالكامل وتشطيبات فاخرة.",
      price: 850000,
      location: "Al-Malaz District",
      locationAr: "حي الملز",
      city: "Riyadh",
      cityAr: "الرياض",
      type: "apartment",
      status: "available",
      area: 180,
      images: [
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
      ],
    },
    {
      title: "Beach Chalet - Al-Aziziyah",
      titleAr: "شاليه بحري - العزيزية",
      description: "Stunning beachfront chalet with direct sea access, private pool, and breathtaking ocean views. Perfect for vacations.",
      descriptionAr: "شاليه ساحلي مذهل مع إمكانية الوصول المباشر للبحر وحمام سباحة خاص وإطلالات خلابة على المحيط. مثالي للإجازات.",
      price: 1200000,
      location: "Al-Aziziyah Coast",
      locationAr: "ساحل العزيزية",
      city: "Jeddah",
      cityAr: "جدة",
      type: "chalet",
      status: "available",
      area: 350,
      images: [
        "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&q=80",
        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
      ],
    },
    {
      title: "Commercial Land - Al-Sahafa",
      titleAr: "أرض تجارية - حي الصحافة",
      description: "Prime commercial land in a high-traffic area, perfect for investment and development. All utilities available.",
      descriptionAr: "أرض تجارية متميزة في منطقة ذات حركة مرورية عالية، مثالية للاستثمار والتطوير. جميع المرافق متوفرة.",
      price: 2000000,
      location: "Al-Sahafa District",
      locationAr: "حي الصحافة",
      city: "Riyadh",
      cityAr: "الرياض",
      type: "land",
      status: "reserved",
      area: 1200,
      images: [
        "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80",
      ],
    },
    {
      title: "Luxury Villa - Al-Hamra",
      titleAr: "فيلا راقية - حمراء",
      description: "Exquisite villa with traditional Arabian architecture, smart home system, private pool, and landscaped garden.",
      descriptionAr: "فيلا رائعة بالطراز العربي الأصيل، نظام المنزل الذكي، حمام السباحة الخاص والحديقة المنسقة.",
      price: 4800000,
      location: "Al-Hamra District",
      locationAr: "حي الحمراء",
      city: "Jeddah",
      cityAr: "جدة",
      type: "villa",
      status: "sold",
      area: 800,
      images: [
        "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80",
        "https://images.unsplash.com/photo-1628744448840-55bdb2497bd4?w=800&q=80",
      ],
    },
    {
      title: "Premium Apartment - Corniche",
      titleAr: "شقة مميزة - الكورنيش",
      description: "Luxurious apartment on the Corniche with spectacular sea views, 3 bedrooms, and a private balcony.",
      descriptionAr: "شقة فاخرة على الكورنيش بإطلالات بحرية رائعة، 3 غرف نوم وشرفة خاصة.",
      price: 1100000,
      location: "Corniche Road",
      locationAr: "طريق الكورنيش",
      city: "Jeddah",
      cityAr: "جدة",
      type: "apartment",
      status: "available",
      area: 220,
      images: [
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
        "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80",
      ],
    },
    {
      title: "Mountain Chalet - Taif",
      titleAr: "شاليه جبلي - الطائف",
      description: "Charming mountain chalet surrounded by rose gardens and fresh mountain air. Ideal for weekend getaways.",
      descriptionAr: "شاليه جبلي ساحر محاط بحدائق الورد والهواء الجبلي المنعش. مثالي لعطل نهاية الأسبوع.",
      price: 750000,
      location: "Al-Hada Mountain",
      locationAr: "جبل الهدا",
      city: "Taif",
      cityAr: "الطائف",
      type: "chalet",
      status: "available",
      area: 280,
      images: [
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
        "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80",
      ],
    },
    {
      title: "Residential Land - Al-Qirawan",
      titleAr: "أرض سكنية - حي القيروان",
      description: "Excellent residential land in a quiet, upscale neighborhood. Near schools, hospitals, and shopping centers.",
      descriptionAr: "أرض سكنية ممتازة في حي هادئ وراقٍ. قريبة من المدارس والمستشفيات ومراكز التسوق.",
      price: 950000,
      location: "Al-Qirawan District",
      locationAr: "حي القيروان",
      city: "Riyadh",
      cityAr: "الرياض",
      type: "land",
      status: "available",
      area: 750,
      images: [
        "https://images.unsplash.com/photo-1574359411659-15573a27fd0c?w=800&q=80",
      ],
    },
  ]).returning();

  console.log("✅ Properties created:", properties.length);

  const bookings = await db.insert(bookingsTable).values([
    {
      name: "أحمد محمد",
      phone: "+966501234567",
      message: "أود الاستفسار عن الفيلا وترتيب موعد للمعاينة",
      propertyId: properties[0].id,
    },
    {
      name: "Sara Al-Rashidi",
      phone: "+966559876543",
      message: "I am interested in this apartment. Please contact me for more details.",
      propertyId: properties[1].id,
    },
    {
      name: "فهد العتيبي",
      phone: "+966543216789",
      message: "هل يمكن تخفيض السعر؟ أرغب في الشراء بشكل عاجل",
      propertyId: properties[2].id,
    },
  ]).returning();

  console.log("✅ Bookings created:", bookings.length);
  console.log("🎉 Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
