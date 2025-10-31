import express from "express";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();
const filePath = "./data/workouts.json";

// Helper: read and write JSON safely
const readWorkouts = () => {
  try {
    if (!fs.existsSync(filePath)) return [];
    const data = fs.readFileSync(filePath);
    return JSON.parse(data);
  } catch {
    return [];
  }
};

const writeWorkouts = (data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// POST - Add new workout
router.post("/", (req, res) => {
  const { date, exercise, duration, caloriesBurned, notes } = req.body;
  if (!date || !exercise || !duration) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const workouts = readWorkouts();
  const duplicate = workouts.find(
    (w) => w.userId === req.userId && w.date === date && w.exercise === exercise
  );
  if (duplicate) {
    return res.status(400).json({ error: "Duplicate workout entry" });
  }

  const newWorkout = {
    id: uuidv4(),
    userId: req.userId,
    date,
    exercise,
    duration,
    caloriesBurned: caloriesBurned || 0,
    notes: notes || "",
  };

  workouts.push(newWorkout);
  writeWorkouts(workouts);
  res.status(201).json(newWorkout);
});

// GET - All workouts with filters
router.get("/", (req, res) => {
  let workouts = readWorkouts();
  const { exercise, date, sort, all } = req.query;

  if (!req.isAdmin || all !== "true") {
    workouts = workouts.filter((w) => w.userId === req.userId);
  }

  if (exercise) workouts = workouts.filter((w) => w.exercise === exercise);
  if (date) workouts = workouts.filter((w) => w.date === date);

  if (sort) {
    const [key, order] = sort.split(":");
    workouts.sort((a, b) =>
      order === "desc" ? b[key] - a[key] : a[key] - b[key]
    );
  }

  res.json(workouts);
});

// PUT - Update workout
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { duration, caloriesBurned, notes, exercise } = req.body;
  const workouts = readWorkouts();
  const index = workouts.findIndex((w) => w.id === id);

  if (index === -1) return res.status(404).json({ error: "Workout not found" });
  if (workouts[index].userId !== req.userId)
    return res.status(403).json({ error: "Unauthorized" });

  if (duration !== undefined) workouts[index].duration = duration;
  if (caloriesBurned !== undefined)
    workouts[index].caloriesBurned = caloriesBurned;
  if (notes !== undefined) workouts[index].notes = notes;
  if (exercise !== undefined) workouts[index].exercise = exercise;

  writeWorkouts(workouts);
  res.json(workouts[index]);
});

// DELETE - Delete workout
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const workouts = readWorkouts();
  const index = workouts.findIndex((w) => w.id === id);

  if (index === -1) return res.status(404).json({ error: "Workout not found" });

  const workout = workouts[index];
  if (workout.userId !== req.userId && !req.isAdmin)
    return res.status(403).json({ error: "Unauthorized" });

  workouts.splice(index, 1);
  writeWorkouts(workouts);
  res.json({ message: "Workout deleted", id });
});

export default router;
