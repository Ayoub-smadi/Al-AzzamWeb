import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { propertiesTable } from "@workspace/db";
import { eq, ilike, or, and, gte, lte, sql } from "drizzle-orm";
import { CreatePropertyBody, UpdatePropertyBody, GetPropertiesQueryParams, GetPropertyParams, UpdatePropertyParams, DeletePropertyParams } from "@workspace/api-zod";
import { authenticate, requireAdmin, type AuthRequest } from "../middlewares/auth.js";

const router: IRouter = Router();

router.get("/", async (req, res) => {
  try {
    const query = GetPropertiesQueryParams.safeParse(req.query);
    if (!query.success) {
      res.status(400).json({ error: "Validation error", message: "Invalid query parameters" });
      return;
    }

    const { search, type, status, minPrice, maxPrice, page = 1, limit = 12 } = query.data;
    const offset = (page - 1) * limit;

    const conditions: any[] = [];

    if (search) {
      conditions.push(
        or(
          ilike(propertiesTable.title, `%${search}%`),
          ilike(propertiesTable.titleAr, `%${search}%`),
          ilike(propertiesTable.location, `%${search}%`),
          ilike(propertiesTable.locationAr, `%${search}%`),
          ilike(propertiesTable.city, `%${search}%`),
          ilike(propertiesTable.cityAr, `%${search}%`)
        )
      );
    }

    if (type) conditions.push(eq(propertiesTable.type, type));
    if (status) conditions.push(eq(propertiesTable.status, status));
    if (minPrice !== undefined) conditions.push(gte(propertiesTable.price, minPrice));
    if (maxPrice !== undefined) conditions.push(lte(propertiesTable.price, maxPrice));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [properties, countResult] = await Promise.all([
      db.select().from(propertiesTable)
        .where(whereClause)
        .orderBy(sql`${propertiesTable.createdAt} DESC`)
        .limit(limit)
        .offset(offset),
      db.select({ count: sql<number>`count(*)::int` }).from(propertiesTable).where(whereClause),
    ]);

    const total = countResult[0]?.count ?? 0;

    res.json({
      properties,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ error: "Internal server error", message: "Failed to fetch properties" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const params = GetPropertyParams.safeParse({ id: Number(req.params.id) });
    if (!params.success) {
      res.status(400).json({ error: "Validation error", message: "Invalid property ID" });
      return;
    }

    const [property] = await db.select().from(propertiesTable).where(eq(propertiesTable.id, params.data.id)).limit(1);
    if (!property) {
      res.status(404).json({ error: "Not found", message: "Property not found" });
      return;
    }

    res.json(property);
  } catch (err) {
    res.status(500).json({ error: "Internal server error", message: "Failed to fetch property" });
  }
});

router.post("/", authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const parsed = CreatePropertyBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Validation error", message: parsed.error.message });
      return;
    }

    const [property] = await db.insert(propertiesTable).values(parsed.data).returning();
    res.status(201).json(property);
  } catch (err) {
    res.status(500).json({ error: "Internal server error", message: "Failed to create property" });
  }
});

router.put("/:id", authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const params = UpdatePropertyParams.safeParse({ id: Number(req.params.id) });
    if (!params.success) {
      res.status(400).json({ error: "Validation error", message: "Invalid property ID" });
      return;
    }

    const parsed = UpdatePropertyBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Validation error", message: parsed.error.message });
      return;
    }

    const [existing] = await db.select().from(propertiesTable).where(eq(propertiesTable.id, params.data.id)).limit(1);
    if (!existing) {
      res.status(404).json({ error: "Not found", message: "Property not found" });
      return;
    }

    const [updated] = await db
      .update(propertiesTable)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(propertiesTable.id, params.data.id))
      .returning();

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Internal server error", message: "Failed to update property" });
  }
});

router.delete("/:id", authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const params = DeletePropertyParams.safeParse({ id: Number(req.params.id) });
    if (!params.success) {
      res.status(400).json({ error: "Validation error", message: "Invalid property ID" });
      return;
    }

    const [existing] = await db.select().from(propertiesTable).where(eq(propertiesTable.id, params.data.id)).limit(1);
    if (!existing) {
      res.status(404).json({ error: "Not found", message: "Property not found" });
      return;
    }

    await db.delete(propertiesTable).where(eq(propertiesTable.id, params.data.id));
    res.json({ success: true, message: "Property deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Internal server error", message: "Failed to delete property" });
  }
});

export default router;
