/*
 * Safe initial-administrator bootstrap script.
 *
 * Run explicitly (never automatically on server start):
 *   node createAdmin.js
 *
 * Required environment variables (see .env.example):
 *   ADMIN_USERNAME, ADMIN_EMAIL, ADMIN_PASSWORD
 *
 * This script never prints passwords or secrets and never resets an
 * existing account. If an account with ADMIN_EMAIL already exists it
 * exits without changes.
 */

require("dotenv").config();

const mongoose = require("mongoose");
const User = require("./models/user");

const requiredEnv = ["ADMIN_USERNAME", "ADMIN_EMAIL", "ADMIN_PASSWORD"];

const createAdmin = async () => {
    const missing = requiredEnv.filter(
        (key) => !process.env[key] || !process.env[key].trim()
    );

    if (missing.length > 0) {
        console.error(
            `Missing required environment variables: ${missing.join(", ")}`
        );
        console.error(
            "Set them in server/.env before running this script. See .env.example."
        );
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Database connected");

        const email = process.env.ADMIN_EMAIL.trim().toLowerCase();

        const existingAdmin = await User.findOne({ email });

        if (existingAdmin) {
            console.log(
                "An account with that email already exists. No changes made."
            );
            process.exit(0);
        }

        const admin = new User({
            username: process.env.ADMIN_USERNAME.trim(),
            email,
            password: process.env.ADMIN_PASSWORD,
            role: "admin"
        });

        await admin.save();

        console.log("Admin created successfully");
        process.exit(0);
    } catch (error) {
        console.error("Failed to create admin:", error.message);
        process.exit(1);
    }
};

createAdmin();
