import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

dotenv.config();

import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import taskRoutes from "./routes/tasks.js";
import setRoutes from "./routes/sets.js";
import membersRouter from "./routes/members.js";
import memberSetRoutes from "./routes/memberSets.js";

const app = express();
app.use(cors());
app.use(express.json());

// ---------------------------
// ENABLE IMAGE SERVING
// ---------------------------
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use("/uploads", express.static(uploadsDir));
// ---------------------------

app.get("/", (req, res) => res.json({ ok: true, service: "admin-owner-agent-backend" }));

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/tasks", taskRoutes);
app.use("/sets", setRoutes);
app.use("/members", membersRouter);
app.use("/member-sets", memberSetRoutes);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`API running on http://localhost:${port}`));
