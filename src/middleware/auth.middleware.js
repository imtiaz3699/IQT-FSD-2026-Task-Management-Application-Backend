import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const unauthorized = (res, message = "Please log in to continue") =>
  res.status(401).json({ success: false, message });

export const optionalAuth = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return next();
  if (!header.startsWith("Bearer ")) return unauthorized(res);

  try {
    const { id } = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    const user = await User.findById(id);
    if (!user) throw new Error("User no longer exists");
    req.user = user;
    next();
  } catch {
    unauthorized(res, "Session expired. Please log in again.");
  }
};

export const requireAuth = (req, res, next) =>
  optionalAuth(req, res, () => (req.user ? next() : unauthorized(res)));