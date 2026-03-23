const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            require: true,
            unique: true,
            trim: true
        },
        password: {
            type: String,
            requried: true
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);