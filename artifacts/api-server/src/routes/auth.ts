import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "@workspace/db";
import { usersTable, bookingsTable, propertiesTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { LoginBody } from "@workspace/api-zod";
import { authenticate, type AuthRequest } from "../middlewares/auth.js";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${Date.now()}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

const router: IRouter = Router();
const JWT_SECRET = process.env.JWT_SECRET || "azzam_jwt_secret_2024";

router.post("/login", async (req, res) => {
  try {
    const parsed = LoginBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Validation error", message: "Invalid email or password format" });
      return;
    }

    const { email, password } = parsed.data;
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);

    if (!user) {
      res.status(401).json({ error: "Unauthorized", message: "Invalid credentials" });
      return;
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      res.status(401).json({ error: "Unauthorized", message: "Invalid credentials" });
      return;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ error: "Internal server error", message: "Login failed" });
  }
});

router.get("/me", authenticate, async (req: AuthRequest, res) => {
  try {
    const [user] = await db.select({
      id: usersTable.id,
      email: usersTable.email,
      name: usersTable.name,
      role: usersTable.role,
      avatar: usersTable.avatar,
    }).from(usersTable).where(eq(usersTable.id, req.user!.id)).limit(1);
    res.json(user);
  } catch {
    res.json(req.user);
  }
});

router.get("/my-bookings", authenticate, async (req: AuthRequest, res) => {
  try {
    const bookings = await db
      .select({
        id: bookingsTable.id,
        name: bookingsTable.name,
        phone: bookingsTable.phone,
        message: bookingsTable.message,
        propertyId: bookingsTable.propertyId,
        userId: bookingsTable.userId,
        createdAt: bookingsTable.createdAt,
        property: propertiesTable,
      })
      .from(bookingsTable)
      .leftJoin(propertiesTable, eq(bookingsTable.propertyId, propertiesTable.id))
      .where(eq(bookingsTable.userId, req.user!.id))
      .orderBy(sql`${bookingsTable.createdAt} DESC`);

    res.json({ bookings });
  } catch (err) {
    res.status(500).json({ error: "Internal server error", message: "Failed to fetch bookings" });
  }
});

router.post("/avatar", authenticate, upload.single("avatar"), async (req: AuthRequest, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "No file", message: "Please upload an image file" });
      return;
    }
    const avatarUrl = `/api/uploads/${req.file.filename}`;
    await db.update(usersTable).set({ avatar: avatarUrl }).where(eq(usersTable.id, req.user!.id));
    res.json({ avatar: avatarUrl });
  } catch (err) {
    res.status(500).json({ error: "Internal server error", message: "Failed to upload avatar" });
  }
});

router.put("/profile", authenticate, async (req: AuthRequest, res) => {
  try {
    const { avatar, name } = req.body as { avatar?: string; name?: string };
    const updates: Record<string, string> = {};
    if (avatar) updates.avatar = avatar;
    if (name) updates.name = name;
    if (Object.keys(updates).length === 0) {
      res.status(400).json({ error: "No updates", message: "Provide avatar or name to update" });
      return;
    }
    const [updated] = await db.update(usersTable).set(updates).where(eq(usersTable.id, req.user!.id)).returning({
      id: usersTable.id, email: usersTable.email, name: usersTable.name, role: usersTable.role, avatar: usersTable.avatar,
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Internal server error", message: "Failed to update profile" });
  }
});

export default router;
