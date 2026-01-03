// backend/controllers/authController.js (or wherever your reset functions live)

import crypto from "crypto";
import bcrypt from "bcryptjs";
import pool from "../config/db.js";
import { sendEmail } from "../utils/email.js"; // ✅ use your working helper

// -------------  /api/auth/forgot-password -------------
export const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const result = await pool.query(
      "SELECT id, email, name FROM users WHERE email = $1",
      [email]
    );

    // ✅ Security: always return OK even if user not found
    if (result.rows.length === 0) {
      return res.json({
        message: "If this email exists, a reset link has been sent.",
      });
    }

    const user = result.rows[0];

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // NOTE: Your code uses reset_expires (keep consistent)
    await pool.query(
      "UPDATE users SET reset_token = $1, reset_expires = $2 WHERE id = $3",
      [token, expires, user.id]
    );

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}&email=${encodeURIComponent(
      user.email
    )}`;

    // ✅ Email send should NEVER crash the endpoint
    const emailResult = await sendEmail({
      to: user.email,
      subject: "Reset your PawConnect password",
      html: `
        <p>Hi ${user.name || ""},</p>
        <p>You requested a password reset for your <b>PawConnect</b> account.</p>
        <p>
          <a href="${resetUrl}"
             style="display:inline-block;padding:10px 18px;background:#16a34a;color:#ffffff;text-decoration:none;border-radius:6px;">
            Reset password
          </a>
        </p>
        <p>Or open this link in your browser:</p>
        <p>${resetUrl}</p>
        <p>If you didn't request this, you can safely ignore this email.</p>
      `,
    });

    return res.json({
      message: "If this email exists, a reset link has been sent.",
      // optional debug flag (remove later if you want)
      emailSent: emailResult?.ok === true,
    });
  } catch (err) {
    console.error("requestPasswordReset error:", err.message);
    return res
      .status(500)
      .json({ error: "Server error while processing reset request" });
  }
};

// -------------  /api/auth/reset-password -------------
export const resetPassword = async (req, res) => {
  const { email, token, password } = req.body;

  if (!email || !token || !password) {
    return res.status(400).json({ error: "Email, token and password required" });
  }

  try {
    const result = await pool.query(
      "SELECT id, reset_token, reset_expires FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Invalid or expired reset link" });
    }

    const user = result.rows[0];

    if (!user.reset_token || user.reset_token !== token) {
      return res.status(400).json({ error: "Invalid or expired reset link" });
    }

    if (!user.reset_expires || new Date(user.reset_expires) < new Date()) {
      return res.status(400).json({ error: "Reset link has expired" });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    await pool.query(
      "UPDATE users SET password_hash = $1, reset_token = NULL, reset_expires = NULL WHERE id = $2",
      [passwordHash, user.id]
    );

    return res.json({ message: "Password updated. You can now log in." });
  } catch (err) {
    console.error("resetPassword error:", err.message);
    return res
      .status(500)
      .json({ error: "Server error while resetting password" });
  }
};
