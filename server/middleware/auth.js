const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { extractToken } = require("../utils/authToken");

const authMiddleware = async (req, res, next) => {
    const token = extractToken(req);

    if (!token) {
        return res.status(401).json({
            message: "No token, access denied"
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Re-check the account on every request so deactivated or deleted
        // users are rejected even while an unexpired token still exists.
        const user = await User.findById(decoded.id).select("-password");

        if (!user || user.isActive === false) {
            return res.status(401).json({
                message: "Account is no longer active"
            });
        }

        req.user = {
            id: user._id.toString(),
            role: user.role
        };
        req.currentUser = user;

        return next();
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

module.exports = authMiddleware;
