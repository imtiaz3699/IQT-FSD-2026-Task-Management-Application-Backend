import Task from "../models/task.model.js";
import User from "../models/user.model.js";

// Only these fields can be written from the request body (owner is never client-controlled)
const pickFields = (body) => {
  const { title, description, status, priority, due } = body;
  const fields = { title, description, status, priority, due };
  Object.keys(fields).forEach((key) => fields[key] === undefined && delete fields[key]);
  return fields;
};

const scopeFor = async (user) => {
  if (!user) return { owner: null };
  const reports = await User.find({ manager: user._id }).select("_id");
  return { owner: { $in: [user._id, ...reports.map((r) => r._id)] } };
};

const notFound = (res) =>
  res.status(404).json({ success: false, message: "Task not found" });

export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find(await scopeFor(req.user))
      .sort({ createdAt: -1 })
      .populate("owner", "name");

    res.status(200).json({
      success: true,
      message: "Tasks fetched successfully",
      data: tasks,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      ...(await scopeFor(req.user)),
    }).populate("owner", "name");

    if (!task) return notFound(res);

    res.status(200).json({ success: true, message: "Task fetched successfully", data: task });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const createTask = async (req, res) => {
  try {
    const task = await Task.create({
      ...pickFields(req.body),
      owner: req.user ? req.user._id : null,
    });

    res.status(201).json({ success: true, message: "Task created successfully", data: task });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, ...(await scopeFor(req.user)) },
      pickFields(req.body),
      { new: true, runValidators: true }
    ).populate("owner", "name");

    if (!task) return notFound(res);

    res.status(200).json({ success: true, message: "Task updated successfully", data: task });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      ...(await scopeFor(req.user)),
    });

    if (!task) return notFound(res);

    res.status(200).json({ success: true, message: "Task deleted successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};