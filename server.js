import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { authenticate } from "./middleware/auth.js";
import workoutRoutes from "./routes/workouts.js";
import fs from "fs";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

if (!fs.existsSync("./data")) fs.mkdirSync("./data");
if (!fs.existsSync("./data/workouts.json"))
  fs.writeFileSync("./data/workouts.json", "[]");

app.use("/api/workouts", authenticate, workoutRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
