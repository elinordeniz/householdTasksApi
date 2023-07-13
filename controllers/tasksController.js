const User = require("../models/User");
const Task = require("../models/Task");
const asyncHandler = require("express-async-handler");

const getAllTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find().lean();

  if (!tasks?.length) {
    return res.status(400).json({ message: "No tasks found" });
  }

  const tasksWithUser = await Promise.all(
    tasks.map(async (task) => {
      const user = await User.findById(task.user).lean().exec();
      return { ...task, username: user?.username };
    })
  );

  res.json(tasksWithUser);
});

const createNewTask = asyncHandler(async (req, res) => {
  const { user, title, text } = req.body;

  if (!user || !title || !text) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const duplicate = await Task.findOne({ title })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();
  if (duplicate) {
    return res.status(409).json({ message: "Duplicate Title" });
  }
  const taskObject = { user: user.toString(), title, text };
  const task = await Task.create(taskObject);
  if (task) {
    return res.status(201).json({ message: "New task created" });
  } else {
    return res.status(400).json({ message: "Invalid note data received" });
  }
});

const updateTask = asyncHandler(async (req, res) => {
  const { id, user, title, text, completed } = req.body;

  // Confirm data
  if (!id || !user || !title || !text || typeof completed !== "boolean") {
    return res.status(400).json({ message: "All fields are required" });
  }

  const task = await Task.findById(id).exec();

  if (!task) {
    return res.status(400).json({ message: "Note not found" });
  }

  const duplicate = await Task.findOne({ title }).lean().exec();

  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate Title" });
  }

  task.user = user;
  task.title = title;
  task.text = text;
  task.completed = completed;

  const updateTask = await task.save();

  if (updateTask) {
    return res.status(201).json({ message: `'${updateTask.title}' updated` });
  }
});

const deleteTask = asyncHandler(async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Task ID required" });
  }

  const task = await Task.findById(id).exec();

  if (!task) {
    return res.status(400).json({ message: "Task not found" });
  }

  const result = await task.deleteOne();
  const reply = `Note '${result.title}' with ID ${result._id} deleted`;
  return res.json(reply);
});

module.exports = { createNewTask, updateTask, deleteTask, getAllTasks };
