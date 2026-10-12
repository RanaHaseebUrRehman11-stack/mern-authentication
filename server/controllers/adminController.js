const User = require("../models/user");
const Vehicle = require("../models/vehicle");
const Mechanic = require("../models/mechanic");
const ServiceRequest = require("../models/serviceRequest");
const { SERVICE_STATUS } = require("../models/serviceStatus");
const { handleError } = require("../utils/errorHandler");
const { isValidObjectId } = require("../utils/validate");

// ============================
// Dashboard Statistics
// ============================

const getDashboardStats = async (req, res) => {
    try {
        const [
            totalUsers,
            totalVehicles,
            totalMechanics,
            pendingMechanics,
            totalRequests,
            pendingRequests,
            assignedRequests,
            inProgressRequests,
            completedRequests
        ] = await Promise.all([
            User.countDocuments({ role: "user", isActive: { $ne: false } }),
            Vehicle.countDocuments(),
            Mechanic.countDocuments(),
            Mechanic.countDocuments({ approvalStatus: "Pending" }),
            ServiceRequest.countDocuments(),
            ServiceRequest.countDocuments({
                status: SERVICE_STATUS.PENDING
            }),
            ServiceRequest.countDocuments({
                status: {
                    $in: [SERVICE_STATUS.ACCEPTED, SERVICE_STATUS.ASSIGNED]
                }
            }),
            ServiceRequest.countDocuments({
                status: SERVICE_STATUS.IN_PROGRESS
            }),
            ServiceRequest.countDocuments({
                status: SERVICE_STATUS.COMPLETED
            })
        ]);

        return res.status(200).json({
            totalUsers,
            totalVehicles,
            totalMechanics,
            pendingMechanics,
            totalRequests,
            pendingRequests,
            assignedRequests,
            inProgressRequests,
            completedRequests
        });
    } catch (error) {
        return handleError(res, error, "getDashboardStats");
    }
};

// ============================
// Get All Users
// ============================

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ isActive: { $ne: false } })
            .select("-password")
            .sort({ createdAt: -1 });

        return res.status(200).json({ users });
    } catch (error) {
        return handleError(res, error, "getAllUsers");
    }
};

// ============================
// Delete User (soft delete)
// ============================
// Soft deletion preserves all dependent vehicles and service requests and
// avoids accidental data loss. A full, cascading deletion is intentionally
// left as a business decision (see README).

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid user id"
            });
        }

        if (req.user.id === id) {
            return res.status(403).json({
                message: "You cannot delete your own account"
            });
        }

        const user = await User.findById(id);

        if (!user || user.isActive === false) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (user.role === "admin") {
            return res.status(403).json({
                message: "Administrator accounts cannot be deleted"
            });
        }

        if (user.role !== "user") {
            // Mechanic logins are tied to a Mechanic record. Removing only the
            // user would orphan an active mechanic that can still be assigned
            // jobs but can never sign in. Use the mechanics endpoint instead.
            return res.status(409).json({
                message:
                    "Mechanic accounts must be removed from the mechanics page"
            });
        }

        user.isActive = false;
        await user.save();

        return res.status(200).json({
            message: "User deleted successfully"
        });
    } catch (error) {
        return handleError(res, error, "deleteUser");
    }
};

module.exports = {
    getDashboardStats,
    getAllUsers,
    deleteUser
};
