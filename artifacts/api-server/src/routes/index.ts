import { Router } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import propertiesRouter from "./properties.js";
import bookingsRouter from "./bookings.js";

const router = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/properties", propertiesRouter);
router.use("/bookings", bookingsRouter);

export default router;
