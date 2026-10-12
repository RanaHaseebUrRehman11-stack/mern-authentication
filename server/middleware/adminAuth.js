const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { extractToken } = require("../utils/authToken");

const adminAuth = async (req, res, next) => {
    const token = extractToken(req);

    if (!token) {
        return res.status(401).json({
            message: "No token, access denied"
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password");

        if (!user || user.isActive === false) {
            return res.status(401).json({
                message: "Account is no longer active"
            });
        }

        if (user.role !== "admin") {
            return res.status(403).json({
                message: "Admin access required"
            });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                message: "Token expired, please log in again"
            });
        }

        return res.status(401).json({
            message: "Invalid token"
        });
    }
};

module.exports = adminAuth;
