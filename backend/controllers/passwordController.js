import crypto from "crypto";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import pool from "../config/db.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

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

    // For security, always respond OK even if user not found
    if (result.rows.length === 0) {
      return res.json({
        message: "If this email exists, a reset link has been sent.",
      });
    }

    const user = result.rows[0];

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await pool.query(
      "UPDATE users SET reset_token = $1, reset_expires = $2 WHERE id = $3",
      [token, expires, user.id]
    );

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}&email=${encodeURIComponent(
      user.email
    )}`;

    await transporter.sendMail({
      from: `"Echoes Of Nepal" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Reset your Echoes Of Nepal password",
      html: `
        <p>Namaste ${user.name || ""},</p>
        <p>You requested a password reset for your Echoes Of Nepal account.</p>
        <p>
          <a href="${resetUrl}"
             style="display:inline-block;padding:10px 18px;background:#f97316;color:#ffffff;text-decoration:none;border-radius:6px;">
            Reset password
          </a>
        </p>
        <p>Or open this link in your browser:</p>
        <p>${resetUrl}</p>
        <p>If you didn't request this, you can safely ignore this email.</p>
      `,
    });

    res.json({
      message: "If this email exists, a reset link has been sent.",
    });
  } catch (err) {
    console.error("requestPasswordReset error:", err.message);
    res
      .status(500)
      .json({ error: "Server error while sending reset email" });
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
      return res
        .status(400)
        .json({ error: "Invalid or expired reset link" });
    }

    const user = result.rows[0];

    if (!user.reset_token || user.reset_token !== token) {
      return res
        .status(400)
        .json({ error: "Invalid or expired reset link" });
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

    res.json({ message: "Password updated. You can now log in." });
  } catch (err) {
    console.error("resetPassword error:", err.message);
    res
      .status(500)
      .json({ error: "Server error while resetting password" });
  }
};
