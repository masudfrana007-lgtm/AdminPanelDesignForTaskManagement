// routes/csLogin.js
import express from "express";

const router = express.Router();

/**
 * POST /cs/login
 * body: { email, password }
 */
router.post("/login", (req, res) => {
  const email = String(req.body?.email || "").trim().toLowerCase();
  const password = String(req.body?.password || "").trim();

  if (email === "cs@gmail.com" && password === "cs123456") {
    return res.json({ ok: true, message: "success" });
  }

  return res.status(401).json({ ok: false, message: "Invalid credentials" });
});

export default router;
