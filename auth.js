import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models.js";

const router = Router();
const safeUser = user => ({ id: user._id, name: user.name, email: user.email });
const makeToken = user => jwt.sign({ userId: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: "7d" });

router.post("/register", async (req, res, next) => {
  try {
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    if (name.length < 2 || name.length > 80) return res.status(400).json({ message: "Enter a name between 2 and 80 characters." });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ message: "Enter a valid email address." });
    if (password.length < 6 || password.length > 128) return res.status(400).json({ message: "Password must be 6–128 characters." });
    if (await User.exists({ email })) return res.status(409).json({ message: "An account with this email already exists." });
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, passwordHash });
    res.status(201).json({ user: safeUser(user), token: makeToken(user) });
  } catch (error) { next(error); }
});

router.post("/login", async (req, res, next) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: "Email or password is incorrect." });
    }
    res.json({ user: safeUser(user), token: makeToken(user) });
  } catch (error) { next(error); }
});

export default router;
