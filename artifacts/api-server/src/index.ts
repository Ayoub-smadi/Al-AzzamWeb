import app from "./app";
import { logger } from "./lib/logger";
import { db, usersTable, propertiesTable } from "@workspace/db";
import { count } from "drizzle-orm";
import bcrypt from "bcryptjs";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

async function seedIfEmpty() {
  try {
    const [{ value: userCount }] = await db.select({ value: count() }).from(usersTable);
    if (Number(userCount) > 0) return;

    logger.info("Database empty — seeding initial data...");

    const hash = (pw: string) => bcrypt.hashSync(pw, 10);

    await db.insert(usersTable).values([
      { name: "مدير النظام", email: "admin1@azzam.com", password: hash("123456"), role: "admin" },
      { name: "المدير الثاني", email: "admin2@azzam.com", password: hash("123456"), role: "admin" },
      { name: "مستخدم عادي", email: "user@azzam.com", password: hash("123456"), role: "user" },
    ]);

    const [{ value: propCount }] = await db.select({ value: count() }).from(propertiesTable);
    if (Number(propCount) === 0) {
      await db.insert(propertiesTable).values([
        {
          title: "Luxury Villa in Al-Narjis",
          titleAr: "فيلا فاخرة في حي النرجس",
          description: "Luxurious villa featuring modern elegant design in the prestigious Al-Narjis district",
          descriptionAr: "فيلا فاخرة تتميز بتصميم عصري راقٍ في حي النرجس",
          price: 3500000,
          type: "villa",
          status: "available",
          city: "Riyadh",
          cityAr: "الرياض",
          location: "Al-Narjis District",
          locationAr: "حي النرجس",
          area: 450,
          images: [],
        },
        {
          title: "Hotel Apartment in Kingdom Tower",
          titleAr: "شقة فندقية في برج المملكة",
          description: "Luxury hotel apartment with panoramic view of Riyadh city",
          descriptionAr: "شقة فندقية فاخرة بإطلالة بانورامية على مدينة الرياض",
          price: 1800000,
          type: "apartment",
          status: "available",
          city: "Riyadh",
          cityAr: "الرياض",
          location: "Kingdom Tower",
          locationAr: "برج المملكة",
          area: 220,
          images: [],
        },
        {
          title: "Beachfront Chalet in Jeddah",
          titleAr: "شاليه على البحر في جدة",
          description: "Luxury coastal chalet directly on the Red Sea beach",
          descriptionAr: "شاليه ساحلي فاخر على شاطئ البحر الأحمر مباشرة",
          price: 2200000,
          type: "chalet",
          status: "available",
          city: "Jeddah",
          cityAr: "جدة",
          location: "Jeddah Corniche",
          locationAr: "كورنيش جدة",
          area: 350,
          images: [],
        },
        {
          title: "Commercial Land in Al-Olaya",
          titleAr: "أرض تجارية في العليا",
          description: "Strategic commercial land in the most prestigious commercial areas of Riyadh",
          descriptionAr: "أرض تجارية استراتيجية في أرقى مناطق الرياض التجارية",
          price: 8000000,
          type: "land",
          status: "available",
          city: "Riyadh",
          cityAr: "الرياض",
          location: "Al-Olaya District",
          locationAr: "حي العليا",
          area: 1200,
          images: [],
        },
        {
          title: "Family Villa in Al-Yasmin",
          titleAr: "فيلا عائلية في حي الياسمين",
          description: "Spacious family villa with green garden and private swimming pool",
          descriptionAr: "فيلا عائلية واسعة بحديقة خضراء وحمام سباحة خاص",
          price: 2800000,
          type: "villa",
          status: "available",
          city: "Riyadh",
          cityAr: "الرياض",
          location: "Al-Yasmin District",
          locationAr: "حي الياسمين",
          area: 380,
          images: [],
        },
        {
          title: "Apartment near Grand Mosque",
          titleAr: "شقة قريبة من المسجد الحرام",
          description: "Modern apartment close to the Grand Mosque with stunning views",
          descriptionAr: "شقة حديثة قريبة من المسجد الحرام بإطلالة رائعة",
          price: 1200000,
          type: "apartment",
          status: "available",
          city: "Makkah",
          cityAr: "مكة المكرمة",
          location: "Abraj Al-Salam",
          locationAr: "أبراج السلام",
          area: 150,
          images: [],
        },
      ]);
    }

    logger.info("Seeding completed successfully.");
  } catch (err) {
    logger.error({ err }, "Seeding failed (non-fatal)");
  }
}

app.listen(port, () => {
  logger.info({ port }, "Server listening");
  seedIfEmpty();
});
