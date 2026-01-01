// backend/controllers/authController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import crypto from "crypto";
import { sendEmail } from "../utils/email.js";

// helper to create JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// --------- REGISTER (email + password + email verification) ----------
export const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "Name, email and password required" });
    }

    const existing = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (existing.rows.length > 0) {
      return res
        .status(400)
        .json({ error: "User already exists with this email" });
    }

    // strong password rule
    const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!strongPassword.test(password)) {
      return res.status(400).json({
        error:
          "Weak password. Must include uppercase, lowercase, number & at least 8 characters.",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const verificationToken = crypto.randomBytes(32).toString("hex");

    await pool.query(
      `INSERT INTO users (name, email, password_hash, verified, verification_token)
       VALUES ($1, $2, $3, $4, $5)`,
      [name, email, passwordHash, false, verificationToken]
    );

    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

    await sendEmail({
      to: email,
      subject: "Verify your Echoes Of Nepal account",
      html: `
        <p>Namaste ${name},</p>
        <p>Please verify your Echoes Of Nepal account:</p>
        <p><a href="${verifyUrl}" target="_blank">Verify Now</a></p>
        <br/>
        <p>If you did not create this account, please ignore this email.</p>
      `,
    });

    res.json({
      message: "Account created! Please check your email to verify your account.",
    });
  } catch (err) {
    console.error("Register error:", err.message);
    res.status(500).json({ error: "Server error during registration" });
  }
};

// --------- VERIFY EMAIL ----------
export const verifyEmail = async (req, res) => {
  const { token } = req.query;

  try {
    if (!token) {
      return res.status(400).json({ error: "Verification token missing" });
    }

    const result = await pool.query(
      "SELECT * FROM users WHERE verification_token = $1",
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    const user = result.rows[0];

    await pool.query(
      "UPDATE users SET verified = true, verification_token = NULL WHERE id = $1",
      [user.id]
    );

    res.json({ message: "Email verified successfully!" });
  } catch (err) {
    console.error("Verify email error:", err.message);
    res.status(500).json({ error: "Server error verifying email" });
  }
};

// --------- LOGIN (email + password) ----------
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const user = result.rows[0];

    // block login until email verified (only for email/password accounts)
    if (user.password_hash && user.verified === false) {
      return res.status(403).json({
        error: "Please verify your email before logging in.",
      });
    }

    if (!user.password_hash) {
      return res
        .status(400)
        .json({ error: "This account was created with Google login" });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const token = generateToken(user);
    res.json({ token });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ error: "Server error during login" });
  }
};

// --------- GOOGLE AUTH ----------
export const googleAuth = async (req, res) => {
  const { idToken } = req.body;

  try {
    if (!idToken) {
      return res.status(400).json({ error: "idToken is required" });
    }

    // dev/demo decode (not production secure)
    const parts = idToken.split(".");
    if (parts.length !== 3) {
      return res.status(400).json({ error: "Invalid idToken format" });
    }

    const payloadJson = Buffer.from(parts[1], "base64").toString("utf8");
    const payload = JSON.parse(payloadJson);

    const email = payload.email;
    const name = payload.name || email?.split("@")[0] || "Google User";

    if (!email) {
      return res
        .status(400)
        .json({ error: "Google token did not contain an email" });
    }

    let userResult = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    let user;
    if (userResult.rows.length === 0) {
      // ✅ IMPORTANT: set verified true for Google users
      const insertResult = await pool.query(
        `INSERT INTO users (name, email, verified, verification_token)
         VALUES ($1, $2, $3, $4)
         RETURNING id, name, email`,
        [name, email, true, null]
      );
      user = insertResult.rows[0];
    } else {
      user = userResult.rows[0];
    }

    const token = generateToken(user);
    res.json({ token });
  } catch (err) {
    console.error("Google auth error:", err.message);
    res.status(500).json({ error: "Server error during Google login" });
  }
};

// --------- GET CURRENT USER (/me) ----------
export const getMe = async (req, res) => {
  try {
    const { id, name, email } = req.user;
    res.json({ user: { id, name, email } });
  } catch (err) {
    console.error("GetMe error:", err.message);
    res.status(500).json({ error: "Server error fetching user" });
  }
};
