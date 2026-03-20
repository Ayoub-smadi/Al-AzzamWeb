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

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const REPLIT_DEV_DOMAIN = process.env.REPLIT_DEV_DOMAIN || "";
const APP_URL = process.env.APP_URL || (REPLIT_DEV_DOMAIN ? `https://${REPLIT_DEV_DOMAIN}` : "");

router.get("/google", (req, res) => {
  if (!GOOGLE_CLIENT_ID) {
    res.status(501).send("Google OAuth is not configured. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.");
    return;
  }
  const redirectUri = `${APP_URL}/api/auth/google/callback`;
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
  });
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
});

router.get("/google/callback", async (req, res) => {
  const frontendUrl = APP_URL || "";
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    res.redirect(`${frontendUrl}/login?error=google_not_configured`);
    return;
  }
  const code = req.query.code as string;
  if (!code) {
    res.redirect(`${frontendUrl}/login?error=google_cancelled`);
    return;
  }
  try {
    const redirectUri = `${APP_URL}/api/auth/google/callback`;
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });
    const tokenData = await tokenRes.json() as { access_token?: string; error?: string };
    if (!tokenData.access_token) {
      res.redirect(`${frontendUrl}/login?error=google_token_failed`);
      return;
    }
    const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const googleUser = await userInfoRes.json() as { email?: string; name?: string; picture?: string; sub?: string };
    if (!googleUser.email) {
      res.redirect(`${frontendUrl}/login?error=google_no_email`);
      return;
    }
    let [user] = await db.select().from(usersTable).where(eq(usersTable.email, googleUser.email)).limit(1);
    if (!user) {
      const randomPass = await bcrypt.hash(Math.random().toString(36), 10);
      [user] = await db.insert(usersTable).values({
        name: googleUser.name || googleUser.email.split("@")[0],
        email: googleUser.email,
        password: randomPass,
        role: "user",
        avatar: googleUser.picture || null,
      }).returning();
    }
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.redirect(`${frontendUrl}/?token=${encodeURIComponent(token)}`);
  } catch {
    res.redirect(`${frontendUrl}/login?error=google_failed`);
  }
});

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body as { name?: string; email?: string; password?: string };

    if (!name || !email || !password) {
      res.status(400).json({ error: "Validation error", message: "Name, email and password are required" });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ error: "Validation error", message: "Password must be at least 6 characters" });
      return;
    }

    const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (existing) {
      res.status(409).json({ error: "Conflict", message: "An account with this email already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const [user] = await db.insert(usersTable).values({
      name,
      email,
      password: hashedPassword,
      role: "user",
    }).returning({ id: usersTable.id, email: usersTable.email, name: usersTable.name, role: usersTable.role });

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({ token, user });
  } catch (err) {
    res.status(500).json({ error: "Internal server error", message: "Registration failed" });
  }
});

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
