// backend/controllers/userController.js
const User = require("../models/userModel");

async function getUsers(req, res) {
  try {
    const users = await User.getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function getUser(req, res) {
  try {
    const user = await User.getUserById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function addUser(req, res) {
  const { name, email } = req.body;
  try {
    const newUser = await User.createUser(name, email);
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function editUser(req, res) {
  const { name, email } = req.body;
  try {
    const updatedUser = await User.updateUser(req.params.id, name, email);
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function removeUser(req, res) {
  try {
    const deletedUser = await User.deleteUser(req.params.id);
    res.json(deletedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  getUsers,
  getUser,
  addUser,
  editUser,
  removeUser,
};
