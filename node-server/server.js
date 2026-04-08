const express = require("express");
const app = express();
require("dotenv").config();

app.use(express.json());

const authRoutes = require("./routes/authRoutes");
app.use("/api/v1", authRoutes);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});