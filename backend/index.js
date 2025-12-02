const express = require("express");
const cors = require("cors");
require("dotenv").config();
require("./config/db");

const userRoutes = require("./routes/userRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Echoes of Nepal backend is running 🚀" });
});

app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
const authRoutes = require("./routes/authRoutes");

// ... after app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes); 
