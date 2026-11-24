import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

const toPublic = (u) => ({
  id: u._id,
  name: u.name,
  email: u.email,
  role: u.role,
  manager: u.manager,
});

const sendAuth = (res, status, user, message) =>
  res.status(status).json({
    success: true,
    message,
    data: { token: signToken(user._id), user: toPublic(user) },
  });

export const signup = async (req, res) => {
  try {
    const { name, email, password, role, managerId } = req.body;
    const isMember = role === "MEMBER";
    let manager = null;

    if (isMember) {
      if (!managerId) {
        return res.status(400).json({ success: false, message: "Please choose your manager" });
      }
      manager = await User.findOne({ _id: managerId, role: "MANAGER" });
      if (!manager) {
        return res.status(400).json({ success: false, message: "Please choose a valid manager" });
      }
    }

    const user = await User.create({
      name,
      email,
      password,
      role: isMember ? "MEMBER" : "MANAGER",
      manager: manager ? manager._id : null,
    });

    sendAuth(res, 201, user, "Account created successfully");
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "Email is already registered" });
    }
    res.status(400).json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user =
      email && password
        ? await User.findOne({ email: String(email).toLowerCase().trim() }).select("+password")
        : null;

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    sendAuth(res, 200, user, "Logged in successfully");
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMe = (req, res) =>
  res.status(200).json({ success: true, data: { user: toPublic(req.user) } });

export const getManagers = async (req, res) => {
  try {
    const managers = await User.find({ role: "MANAGER" }).select("name").sort({ name: 1 });
    res.status(200).json({
      success: true,
      data: managers.map((m) => ({ id: m._id, name: m.name })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};