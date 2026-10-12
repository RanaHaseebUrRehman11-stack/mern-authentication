const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/auth");

const {
    register,
    registerMechanic,
    registerAdmin,
    login,
    getProfile,
    updateProfile
} = require("../controllers/authController");

router.post("/register", register);

router.post("/register/mechanic", registerMechanic);

router.post("/register/admin", registerAdmin);

router.post("/login", login);

router.get("/profile", authMiddleware, getProfile);

router.put("/profile", authMiddleware, updateProfile);

module.exports = router;