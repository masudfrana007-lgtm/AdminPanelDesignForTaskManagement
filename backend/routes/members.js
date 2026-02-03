import express from "express";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import { pool } from "../db.js";
import { auth } from "../middleware/auth.js";
import { allowRoles } from "../middleware/roles.js";

const router = express.Router();

/**
 * CREATE MEMBER (PUBLIC SIGNUP ONLY)
 * - referral_code required -> sponsor_id = users.id (owner/agent)
 * - approval_status = pending
 */
router.post("/", async (req, res) => {
  try {
    const nickname = String(req.body.nickname || "").trim();
    const phone = String(req.body.phone || "").trim();
    const country = String(req.body.country || "").trim();
    const password = String(req.body.password || "").trim();
    const gender = String(req.body.gender || "").trim();
    const referral_code = String(req.body.referral_code || "").trim();

    if (!nickname || !phone || !country || !password || !gender || !referral_code) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // ✅ referral_code MUST match users.short_id (owner/agent)
    const ref = await pool.query(
      `SELECT id
       FROM users
       WHERE short_id = $1
         AND role IN ('owner','agent')
       LIMIT 1`,
      [referral_code]
    );

    if (!ref.rowCount) {
      return res.status(400).json({ message: "Invalid referral code" });
    }

    const sponsor_id = ref.rows[0].id;

    const passHash = await bcrypt.hash(password, 10);
    const approval_status = "pending";

    while (true) {
      try {
        const short_id = nanoid(8);

        const r = await pool.query(
          `INSERT INTO members
           (short_id, nickname, phone, country, password,
            sponsor_id, ranking, withdraw_privilege, approval_status, created_by, gender)
           VALUES
           ($1,$2,$3,$4,$5,$6,'Trial',true,$7,$8,$9)
           RETURNING id, short_id, nickname, phone, country, sponsor_id,
                    ranking, withdraw_privilege, approval_status, created_by, created_at, gender`,
          [
            short_id,
            nickname,
            phone,
            country,
            passHash,
            sponsor_id,
            approval_status,
            sponsor_id,   
            gender,
          ]
        );

        return res.status(201).json(r.rows[0]);
      } catch (e) {
        const msg = String(e);

        if (msg.includes("members_short_id_key")) continue;

        if (msg.includes("members_nickname_key")) {
          return res.status(400).json({ message: "Username already exists" });
        }

        if (msg.includes("members_phone_key")) {
          return res.status(400).json({ message: "Phone number already exists" });
        }

        console.error(e);
        return res.status(500).json({ message: "Server error" });
      }
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
});


/**
 * LIST MEMBERS (owner/agent)
 * Adds wallet balance + locked_balance
 */
router.get("/", auth, allowRoles("owner", "agent"), async (req, res) => {
  try {
    if (req.user.role === "agent") {
      const r = await pool.query(
        `SELECT 
           m.id,
           m.short_id,
           m.nickname,
           m.phone,
           m.country,
           u.short_id AS sponsor_short_id,
           m.ranking,
           m.withdraw_privilege,
           m.approval_status,
           m.created_at,
           COALESCE(w.balance, 0)::numeric(12,2) AS balance,
           COALESCE(w.locked_balance, 0)::numeric(12,2) AS locked_balance
         FROM members m
         JOIN users u ON u.id = m.sponsor_id
         LEFT JOIN wallets w ON w.member_id = m.id
         WHERE m.sponsor_id = $1
         ORDER BY m.id DESC`,
        [req.user.id]
      );
      return res.json(r.rows);
    }

    const r = await pool.query(
      `SELECT 
         m.id,
         m.short_id,
         m.nickname,
         m.phone,
         m.country,
         u.short_id AS sponsor_short_id,
         m.ranking,
         m.withdraw_privilege,
         m.approval_status,
         m.created_at,
         COALESCE(w.balance, 0)::numeric(12,2) AS balance,
         COALESCE(w.locked_balance, 0)::numeric(12,2) AS locked_balance
       FROM members m
       JOIN users u ON u.id = m.sponsor_id
       LEFT JOIN wallets w ON w.member_id = m.id
       ORDER BY m.id DESC`
    );

    return res.json(r.rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * UPDATE MEMBER (owner only)
 * - allows editing nickname, phone, country, ranking, withdraw_privilege, gender, approval_status
 */
router.patch("/:id", auth, allowRoles("owner"), async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ message: "Invalid member id" });

    const nickname = req.body.nickname != null ? String(req.body.nickname).trim() : null;
    const phone = req.body.phone != null ? String(req.body.phone).trim() : null;
    const country = req.body.country != null ? String(req.body.country).trim() : null;
    const ranking = req.body.ranking != null ? String(req.body.ranking).trim() : null;
    const gender = req.body.gender != null ? String(req.body.gender).trim() : null;

    const withdraw_privilege =
      req.body.withdraw_privilege === undefined ? undefined : !!req.body.withdraw_privilege;

    const approval_status =
      req.body.approval_status != null ? String(req.body.approval_status).trim() : null;

    // ✅ only allow safe values (prevent random status/ranking)
    const allowedStatuses = ["pending", "approved", "rejected"];
    const allowedRankings = ["Trial", "V1", "V2", "V3", "V4", "V5", "V6"];

    if (approval_status && !allowedStatuses.includes(approval_status)) {
      return res.status(400).json({ message: "Invalid approval_status" });
    }
    if (ranking && !allowedRankings.includes(ranking)) {
      return res.status(400).json({ message: "Invalid ranking" });
    }

    // Build dynamic update query (only update fields provided)
    const sets = [];
    const vals = [];
    let i = 1;

    const add = (col, val) => {
      sets.push(`${col} = $${i++}`);
      vals.push(val);
    };

    if (nickname !== null) add("nickname", nickname);
    if (phone !== null) add("phone", phone);
    if (country !== null) add("country", country);
    if (ranking !== null) add("ranking", ranking);
    if (gender !== null) add("gender", gender);
    if (approval_status !== null) add("approval_status", approval_status);
    if (withdraw_privilege !== undefined) add("withdraw_privilege", withdraw_privilege);

    if (!sets.length) return res.status(400).json({ message: "No fields to update" });

    vals.push(id);

    const r = await pool.query(
      `UPDATE members
       SET ${sets.join(", ")}
       WHERE id = $${i}
       RETURNING id, short_id, nickname, phone, country, sponsor_id,
                 ranking, withdraw_privilege, approval_status, created_by, created_at, gender`,
      vals
    );

    if (!r.rowCount) return res.status(404).json({ message: "Member not found" });

    return res.json(r.rows[0]);
  } catch (e) {
    const msg = String(e);
    if (msg.includes("members_nickname_key")) {
      return res.status(400).json({ message: "Username already exists" });
    }
    if (msg.includes("members_phone_key")) {
      return res.status(400).json({ message: "Phone number already exists" });
    }
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET /members/:id/wallet
 * wallet + ALL deposits + ALL withdrawals
 */
router.get("/:id/wallet", auth, allowRoles("owner", "agent"), async (req, res) => {
  try {
    const memberId = Number(req.params.id);
    if (!memberId) return res.status(400).json({ message: "Invalid member id" });

    // Load member + sponsor info (for header UI)
    const m = await pool.query(
      `
      SELECT
        m.id,
        m.short_id,
        m.nickname,
        m.phone,
        m.approval_status,
        m.sponsor_id,
        s.short_id AS sponsor_short_id
      FROM members m
      LEFT JOIN members s ON s.id = m.sponsor_id
      WHERE m.id = $1
      `,
      [memberId]
    );

    const member = m.rows[0];
    if (!member) return res.status(404).json({ message: "Member not found" });

    // permission check: agent can only view their own members
    if (req.user.role === "agent") {
      if (member.sponsor_id !== req.user.id) {
        return res.status(403).json({ message: "Not allowed for this member" });
      }
    }

    // ensure wallet exists
    await pool.query(
      `INSERT INTO wallets(member_id) VALUES($1)
       ON CONFLICT (member_id) DO NOTHING`,
      [memberId]
    );

    const walletRes = await pool.query(
      `
      SELECT
        member_id,
        balance::numeric(12,2),
        locked_balance::numeric(12,2),
        updated_at
      FROM wallets
      WHERE member_id = $1
      `,
      [memberId]
    );

    // ✅ ALL deposits (no LIMIT)
    const depositsRes = await pool.query(
      `
      SELECT
        id,
        amount::numeric(12,2) AS amount,
        method,
        asset,
        network,
        tx_ref,
        proof_url,
        status,
        admin_note,
        created_at,
        reviewed_at
      FROM deposits
      WHERE member_id = $1
      ORDER BY id DESC
      `,
      [memberId]
    );

    // ✅ ALL withdrawals (no LIMIT)
    const withdrawalsRes = await pool.query(
      `
      SELECT
        id,
        amount::numeric(12,2) AS amount,
        method,
        account_details,
        status,
        admin_note,
        created_at,
        reviewed_at
      FROM withdrawals
      WHERE member_id = $1
      ORDER BY id DESC
      `,
      [memberId]
    );

    res.json({
      member, // ✅ now your MemberWallet.jsx can show nickname/short_id/phone/sponsor/status
      wallet:
        walletRes.rows[0] || { member_id: memberId, balance: "0.00", locked_balance: "0.00" },
      deposits: depositsRes.rows,
      withdrawals: withdrawalsRes.rows,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});


/**
 * APPROVE / REJECT (owner only)
 */
router.patch("/:id/approve", auth, allowRoles("owner"), async (req, res) => {
  await pool.query(`UPDATE members SET approval_status='approved' WHERE id=$1`, [
    req.params.id,
  ]);
  res.json({ ok: true });
});

router.patch("/:id/reject", auth, allowRoles("owner"), async (req, res) => {
  await pool.query(`UPDATE members SET approval_status='rejected' WHERE id=$1`, [
    req.params.id,
  ]);
  res.json({ ok: true });
});

export default router;
