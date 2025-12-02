// backend/models/userModel.js
const pool = require("../config/db");

async function getAllUsers() {
  const result = await pool.query("SELECT * FROM users ORDER BY id ASC");
  return result.rows;
}

async function getUserById(id) {
  const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
  return result.rows[0];
}

async function createUser(name, email) {
  const result = await pool.query(
    "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *",
    [name, email]
  );
  return result.rows[0];
}

async function updateUser(id, name, email) {
  const result = await pool.query(
    "UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *",
    [name, email, id]
  );
  return result.rows[0];
}

async function deleteUser(id) {
  const result = await pool.query(
    "DELETE FROM users WHERE id = $1 RETURNING *",
    [id]
  );
  return result.rows[0];
}

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};

// find user by email
async function getUserByEmail(email) {
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  return result.rows[0];
}

// find user by google_id
async function getUserByGoogleId(googleId) {
  const result = await pool.query("SELECT * FROM users WHERE google_id = $1", [googleId]);
  return result.rows[0];
}

// create user with password
async function createUserWithPassword(name, email, passwordHash) {
  const result = await pool.query(
    "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING *",
    [name, email, passwordHash]
  );
  return result.rows[0];
}

// create or update user with Google login
async function upsertGoogleUser(name, email, googleId) {
  const result = await pool.query(
    `INSERT INTO users (name, email, google_id)
     VALUES ($1, $2, $3)
     ON CONFLICT (email)
     DO UPDATE SET google_id = EXCLUDED.google_id, name = EXCLUDED.name
     RETURNING *`,
    [name, email, googleId]
  );
  return result.rows[0];
}

module.exports = {
  // your existing exports...
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,

  // new ones:
  getUserByEmail,
  getUserByGoogleId,
  createUserWithPassword,
  upsertGoogleUser,
};

