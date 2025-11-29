// backend/controllers/authController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";

// helper to create our own JWT
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// --------- REGISTER (email + password) ----------
export const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email and password required" });
    }

    // check if user exists
    const existing = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: "User already exists with this email" });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const result = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email",
      [name, email, passwordHash]
    );

    const user = result.rows[0];
    const token = generateToken(user);

    res.status(201).json({ token });
  } catch (err) {
    console.error("Register error:", err.message);
    res.status(500).json({ error: "Server error during registration" });
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

    if (!user.password) {
      return res
        .status(400)
        .json({ error: "This account was created with Google login" });
    }

    const match = await bcrypt.compare(password, user.password);

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

    // NOTE: This is a simple decode for dev/demo (NOT secure for production)
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

    // check if user exists
    let userResult = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    let user;
    if (userResult.rows.length === 0) {
      // create a new user with no password (Google only)
      const insertResult = await pool.query(
        "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id, name, email",
        [name, email]
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
    const { id, name, email } = req.user; // set by protect()
    res.json({ user: { id, name, email } });
  } catch (err) {
    console.error("GetMe error:", err.message);
    res.status(500).json({ error: "Server error fetching user" });
  }
};
