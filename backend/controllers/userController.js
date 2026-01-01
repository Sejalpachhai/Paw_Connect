// backend/controllers/userController.js
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../models/userModel.js";

export async function getUsers(req, res) {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getUser(req, res) {
  try {
    const user = await getUserById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function addUser(req, res) {
  const { name, email } = req.body;
  try {
    const user = await createUser(name, email);
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function editUser(req, res) {
  const { name, email } = req.body;
  try {
    const user = await updateUser(req.params.id, name, email);
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function removeUser(req, res) {
  try {
    const user = await deleteUser(req.params.id);
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
