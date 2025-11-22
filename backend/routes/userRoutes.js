// backend/routes/userRoutes.js
const express = require("express");
const {
  getUsers,
  getUser,
  addUser,
  editUser,
  removeUser,
} = require("../controllers/userController");

const router = express.Router();

router.get("/", getUsers);
router.get("/:id", getUser);
router.post("/", addUser);
router.put("/:id", editUser);
router.delete("/:id", removeUser);

module.exports = router;
