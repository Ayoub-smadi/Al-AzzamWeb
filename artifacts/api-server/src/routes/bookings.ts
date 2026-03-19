import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { bookingsTable, propertiesTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { CreateBookingBody, GetBookingsQueryParams, DeleteBookingParams } from "@workspace/api-zod";
import { authenticate, requireAdmin } from "../middlewares/auth.js";

const router: IRouter = Router();

router.get("/stats", authenticate, requireAdmin, async (_req, res) => {
  try {
    const [totalProperties, availableProperties, reservedProperties, soldProperties, totalBookings, recentBookings] =
      await Promise.all([
        db.select({ count: sql<number>`count(*)::int` }).from(propertiesTable),
        db.select({ count: sql<number>`count(*)::int` }).from(propertiesTable).where(eq(propertiesTable.status, "available")),
        db.select({ count: sql<number>`count(*)::int` }).from(propertiesTable).where(eq(propertiesTable.status, "reserved")),
        db.select({ count: sql<number>`count(*)::int` }).from(propertiesTable).where(eq(propertiesTable.status, "sold")),
        db.select({ count: sql<number>`count(*)::int` }).from(bookingsTable),
        db.select({ count: sql<number>`count(*)::int` }).from(bookingsTable).where(
          sql`${bookingsTable.createdAt} >= NOW() - INTERVAL '7 days'`
        ),
      ]);

    res.json({
      totalProperties: totalProperties[0]?.count ?? 0,
      availableProperties: availableProperties[0]?.count ?? 0,
      reservedProperties: reservedProperties[0]?.count ?? 0,
      soldProperties: soldProperties[0]?.count ?? 0,
      totalBookings: totalBookings[0]?.count ?? 0,
      recentBookings: recentBookings[0]?.count ?? 0,
    });
  } catch (err) {
    res.status(500).json({ error: "Internal server error", message: "Failed to fetch stats" });
  }
});

router.get("/", authenticate, requireAdmin, async (req, res) => {
  try {
    const query = GetBookingsQueryParams.safeParse(req.query);
    if (!query.success) {
      res.status(400).json({ error: "Validation error", message: "Invalid query parameters" });
      return;
    }

    const { page = 1, limit = 20 } = query.data;
    const offset = (page - 1) * limit;

    const [bookings, countResult] = await Promise.all([
      db
        .select({
          id: bookingsTable.id,
          name: bookingsTable.name,
          phone: bookingsTable.phone,
          message: bookingsTable.message,
          propertyId: bookingsTable.propertyId,
          createdAt: bookingsTable.createdAt,
          property: propertiesTable,
        })
        .from(bookingsTable)
        .leftJoin(propertiesTable, eq(bookingsTable.propertyId, propertiesTable.id))
        .orderBy(sql`${bookingsTable.createdAt} DESC`)
        .limit(limit)
        .offset(offset),
      db.select({ count: sql<number>`count(*)::int` }).from(bookingsTable),
    ]);

    const total = countResult[0]?.count ?? 0;

    res.json({
      bookings,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ error: "Internal server error", message: "Failed to fetch bookings" });
  }
});

router.post("/", async (req, res) => {
  try {
    const parsed = CreateBookingBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Validation error", message: parsed.error.message });
      return;
    }

    const [property] = await db.select().from(propertiesTable).where(eq(propertiesTable.id, parsed.data.propertyId)).limit(1);
    if (!property) {
      res.status(404).json({ error: "Not found", message: "Property not found" });
      return;
    }

    const [booking] = await db.insert(bookingsTable).values(parsed.data).returning();
    res.status(201).json({ ...booking, property });
  } catch (err) {
    res.status(500).json({ error: "Internal server error", message: "Failed to create booking" });
  }
});

router.delete("/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    const params = DeleteBookingParams.safeParse({ id: Number(req.params.id) });
    if (!params.success) {
      res.status(400).json({ error: "Validation error", message: "Invalid booking ID" });
      return;
    }

    const [existing] = await db.select().from(bookingsTable).where(eq(bookingsTable.id, params.data.id)).limit(1);
    if (!existing) {
      res.status(404).json({ error: "Not found", message: "Booking not found" });
      return;
    }

    await db.delete(bookingsTable).where(eq(bookingsTable.id, params.data.id));
    res.json({ success: true, message: "Booking deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Internal server error", message: "Failed to delete booking" });
  }
});

export default router;
