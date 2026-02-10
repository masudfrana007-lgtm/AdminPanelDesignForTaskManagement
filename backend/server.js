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
import memberAuthRoutes from "./routes/memberAuth.js";
import memberAppRoutes from "./routes/memberApp.js";
import depositsRoutes from "./routes/deposits.js";
import withdrawalsRoutes from "./routes/withdrawals.js";
import supportRoutes from "./routes/support.js";
import memberSupportRoutes from "./routes/memberSupport.js";
import csLoginRoutes from "./routes/csLogin.js";
import memberAvatarRouter from "./routes/memberAvatar.js";

const app = express();
app.use(cors({
  origin: [
    "http://159.198.40.145:5175",
    "http://localhost:5173",
    "http://127.0.0.1:5173"
  ],
  credentials: true
}));
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
app.use("/member-auth", memberAuthRoutes);
app.use("/member", memberAppRoutes);
app.use("/deposits", depositsRoutes);
app.use("/withdrawals", withdrawalsRoutes);
app.use("/support", supportRoutes);
app.use("/member/support", memberSupportRoutes);
app.use("/cs", csLoginRoutes);
app.use("/member", memberAvatarRouter);

const port = process.env.PORT || 5000;
app.listen(port, "0.0.0.0", () => {
  console.log(`API running on port ${port}`);
});
