const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.use(cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"]
}));
app.use(express.json());

app.get("/api/health", (req, res) => {
    res.json({ message: "Backend is running"});
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/items", require("./routes/itemRoutes"));

const PORT = process.env.PORT || 5050;

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("Connected to MongoDB");
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("MongoDB connection error", error.message);
        process.exit(1);
    });