const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

app.use("/api/auth", require("./routes/authRoutes"));

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});

const path = require("path");

app.use(express.static(path.join(__dirname, "../dashboard2/dist")));

app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "../dashboard2/dist/index.html"));
});