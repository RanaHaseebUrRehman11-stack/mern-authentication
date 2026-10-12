const User = require("../models/user");
const Mechanic = require("../models/mechanic");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { handleError } = require("../utils/errorHandler");
const { getMechanicAccessIssue } = require("../utils/mechanicApproval");
const {
    isNonEmptyString,
    isValidEmail,
    isValidPassword,
    isNonNegativeNumber,
    safeEqual
} = require("../utils/validate");

// ============================
// Register Controller
// ============================

const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!isNonEmptyString(username)) {
            return res.status(400).json({
                message: "Username is required"
            });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({
                message: "A valid email is required"
            });
        }

        if (!isValidPassword(password)) {
            return res.status(400).json({
                message: "Password must be at least 6 characters"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        const user = new User({
            username: username.trim(),
            email: normalizedEmail,
            password
        });

        await user.save();

        return res.status(201).json({
            message: "User registered successfully"
        });
    } catch (err) {
        return handleError(res, err, "register");
    }
};

// ============================
// Login Controller
// ============================

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!isValidEmail(email) || !isNonEmptyString(password)) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        const user = await User.findOne({
            email: email.trim().toLowerCase()
        });

        if (!user || user.isActive === false) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        // Mechanics must be approved and active before they can sign in.
        // This surfaces a clear reason instead of issuing a token that the
        // mechanic portal would immediately reject.
        if (user.role === "mechanic") {
            const mechanic = await Mechanic.findOne({ user: user._id });
            const issue = getMechanicAccessIssue(mechanic);

            if (issue) {
                return res.status(403).json({
                    message: issue.message,
                    code: issue.code
                });
            }
        }

        const token = jwt.sign(
            {
                id: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h"
            }
        );

        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        return handleError(res, err, "login");
    }
};

// ============================
// Profile Controller
// ============================

const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json({ user });
    } catch (err) {
        return handleError(res, err, "getProfile");
    }
};

// ============================
// Update Profile Controller
// ============================

const updateProfile = async (req, res) => {
    try {
        const { username, currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user.id);

        if (!user || user.isActive === false) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (username !== undefined) {
            if (!isNonEmptyString(username)) {
                return res.status(400).json({
                    message: "Username cannot be empty"
                });
            }

            user.username = username.trim();
        }

        if (newPassword !== undefined) {
            if (!isValidPassword(newPassword)) {
                return res.status(400).json({
                    message: "New password must be at least 6 characters"
                });
            }

            const isMatch = await bcrypt.compare(
                currentPassword || "",
                user.password
            );

            if (!isMatch) {
                return res.status(400).json({
                    message: "Current password is incorrect"
                });
            }

            user.password = newPassword;
        }

        await user.save();

        return res.status(200).json({
            message: "Profile updated successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        return handleError(res, err, "updateProfile");
    }
};

// ============================
// Public Mechanic Registration
// ============================
// Creates a User (role "mechanic") plus a linked Mechanic record in the
// "Pending" approval state. The account cannot sign in until an admin
// approves it. If linking fails, the just-created User is rolled back so no
// orphaned login account is left behind.

const registerMechanic = async (req, res) => {
    try {
        const { name, email, password, phone, specialization, experience } =
            req.body;

        if (!isNonEmptyString(name)) {
            return res.status(400).json({
                message: "Mechanic name is required"
            });
        }

        if (!isNonEmptyString(phone)) {
            return res.status(400).json({
                message: "Phone number is required"
            });
        }

        if (!isNonEmptyString(specialization)) {
            return res.status(400).json({
                message: "Specialization is required"
            });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({
                message: "A valid email is required"
            });
        }

        if (!isValidPassword(password)) {
            return res.status(400).json({
                message: "Password must be at least 6 characters"
            });
        }

        const experienceValue = Number(experience);

        if (!isNonNegativeNumber(experienceValue)) {
            return res.status(400).json({
                message: "Experience must be a non-negative number"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const [existingUser, existingMechanic] = await Promise.all([
            User.findOne({ email: normalizedEmail }),
            Mechanic.findOne({ email: normalizedEmail })
        ]);

        if (existingUser || existingMechanic) {
            return res.status(400).json({
                message: "An account with that email already exists"
            });
        }

        const user = new User({
            username: name.trim(),
            email: normalizedEmail,
            password,
            role: "mechanic"
        });

        await user.save();

        try {
            const mechanic = new Mechanic({
                name: name.trim(),
                email: normalizedEmail,
                phone: phone.trim(),
                specialization: specialization.trim(),
                experience: experienceValue,
                status: "Inactive",
                approvalStatus: "Pending",
                user: user._id
            });

            await mechanic.save();
        } catch (mechanicError) {
            await User.findByIdAndDelete(user._id);
            throw mechanicError;
        }

        return res.status(201).json({
            message:
                "Mechanic registration submitted. Your account is pending administrator approval.",
            approvalStatus: "Pending"
        });
    } catch (err) {
        return handleError(res, err, "registerMechanic");
    }
};

// ============================
// Secure Administrator Registration
// ============================
// Disabled unless ADMIN_REGISTRATION_SECRET is configured and
// ADMIN_REGISTRATION_ENABLED is not "false". The secret is compared in
// constant time and never exposed. Operators are expected to unset the
// secret (or set ADMIN_REGISTRATION_ENABLED=false) once setup is complete.
//
// This is an additional path to the createAdmin.js bootstrap script. A public
// self-registration endpoint always creates role "user" and can never return
// an admin token or role.

const registerAdmin = async (req, res) => {
    try {
        const { username, email, password, adminSecret } = req.body;

        const configuredSecret = process.env.ADMIN_REGISTRATION_SECRET;
        const enabled =
            process.env.ADMIN_REGISTRATION_ENABLED !== "false";

        if (!enabled || !configuredSecret || !configuredSecret.trim()) {
            return res.status(403).json({
                message: "Administrator registration is disabled."
            });
        }

        if (!safeEqual(adminSecret, configuredSecret)) {
            return res.status(403).json({
                message: "Invalid administrator registration secret."
            });
        }

        if (!isNonEmptyString(username)) {
            return res.status(400).json({
                message: "Username is required"
            });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({
                message: "A valid email is required"
            });
        }

        if (!isValidPassword(password)) {
            return res.status(400).json({
                message: "Password must be at least 6 characters"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({ email: normalizedEmail });

        if (existingUser) {
            return res.status(400).json({
                message: "An account with that email already exists"
            });
        }

        const admin = new User({
            username: username.trim(),
            email: normalizedEmail,
            password,
            role: "admin"
        });

        await admin.save();

        return res.status(201).json({
            message: "Administrator account created successfully"
        });
    } catch (err) {
        return handleError(res, err, "registerAdmin");
    }
};

module.exports = {
    register,
    registerMechanic,
    registerAdmin,
    login,
    getProfile,
    updateProfile
};
