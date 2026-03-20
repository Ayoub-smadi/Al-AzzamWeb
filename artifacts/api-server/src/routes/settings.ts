import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { siteSettingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { authenticate, requireAdmin, type AuthRequest } from "../middlewares/auth.js";

const router: IRouter = Router();

const DEFAULTS: Record<string, string> = {
  hero_title_ar: "اكتشف عقارك المثالي اليوم",
  hero_title_en: "Find Your Dream Property Today",
  hero_subtitle_ar: "العزام للعقارات توفر لك خيارات واسعة من الفيلات والشقق والأراضي في أفضل المواقع. رحلتك نحو المنزل المثالي تبدأ هنا.",
  hero_subtitle_en: "Al-Azzam Real Estate offers a wide range of villas, apartments, and lands in prime locations. Your journey to the perfect home begins here.",
  footer_about_ar: "نقدم لكم أفضل العروض العقارية مع ضمان الجودة والمصداقية. شريكك الموثوق في عالم العقارات.",
  footer_about_en: "Providing the best real estate offers with a guarantee of quality and credibility. Your trusted partner in real estate.",
  contact_address_ar: "الرياض، المملكة العربية السعودية",
  contact_address_en: "Riyadh, Saudi Arabia",
  contact_email: "contact@al-azzam.com",
  contact_phone: "+966 50 123 4567",
  social_links: "[]",
};

router.get("/", async (_req, res) => {
  try {
    const rows = await db.select().from(siteSettingsTable);
    const settings: Record<string, string> = { ...DEFAULTS };
    for (const row of rows) {
      settings[row.key] = row.value;
    }
    res.json(settings);
  } catch {
    res.json(DEFAULTS);
  }
});

router.put("/", authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const updates = req.body as Record<string, string>;
    for (const [key, value] of Object.entries(updates)) {
      await db
        .insert(siteSettingsTable)
        .values({ key, value })
        .onConflictDoUpdate({ target: siteSettingsTable.key, set: { value, updatedAt: new Date() } });
    }
    const rows = await db.select().from(siteSettingsTable);
    const settings: Record<string, string> = { ...DEFAULTS };
    for (const row of rows) settings[row.key] = row.value;
    res.json(settings);
  } catch {
    res.status(500).json({ error: "Failed to update settings" });
  }
});

export default router;
