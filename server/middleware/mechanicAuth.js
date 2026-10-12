const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Mechanic = require("../models/mechanic");
const { extractToken } = require("../utils/authToken");
const { getMechanicAccessIssue } = require("../utils/mechanicApproval");

// Authorises an authenticated mechanic and attaches the linked Mechanic
// record as req.mechanic. The link is resolved from the database, never from
// client-supplied data.
const mechanicAuth = async (req, res, next) => {
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

        if (user.role !== "mechanic") {
            return res.status(403).json({
                message: "Mechanic access required"
            });
        }

        const mechanic = await Mechanic.findOne({ user: user._id });

        const issue = getMechanicAccessIssue(mechanic);

        if (issue) {
            return res.status(403).json({
                message: issue.message,
                code: issue.code
            });
        }

        req.user = user;
        req.mechanic = mechanic;
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

module.exports = mechanicAuth;
