const ServiceRequest = require("../models/serviceRequest");
const { SERVICE_STATUS } = require("../models/serviceStatus");
const {
    isMechanicTransitionAllowed,
    isTerminal
} = require("../utils/serviceWorkflow");
const { handleError } = require("../utils/errorHandler");
const { isValidObjectId, isNonEmptyString, pick } = require("../utils/validate");

// Self-service availability. "Inactive" is intentionally excluded: account
// deactivation is an administrator action (it blocks portal access), so a
// mechanic setting it themselves would be locked out with no way back.
const SELF_SERVICE_STATUS = ["Available", "Busy"];

const POPULATE = [
    { path: "vehicle" },
    { path: "user", select: "username email" }
];

// ============================
// Mechanic Dashboard Statistics
// ============================

const getMechanicStats = async (req, res) => {
    try {
        const mechanicId = req.mechanic._id;

        const [totalJobs, assignedJobs, inProgressJobs, completedJobs] =
            await Promise.all([
                ServiceRequest.countDocuments({ mechanic: mechanicId }),
                ServiceRequest.countDocuments({
                    mechanic: mechanicId,
                    status: {
                        $in: [SERVICE_STATUS.ASSIGNED, SERVICE_STATUS.ACCEPTED]
                    }
                }),
                ServiceRequest.countDocuments({
                    mechanic: mechanicId,
                    status: SERVICE_STATUS.IN_PROGRESS
                }),
                ServiceRequest.countDocuments({
                    mechanic: mechanicId,
                    status: SERVICE_STATUS.COMPLETED
                })
            ]);

        return res.status(200).json({
            totalJobs,
            assignedJobs,
            inProgressJobs,
            completedJobs
        });
    } catch (error) {
        return handleError(res, error, "getMechanicStats");
    }
};

// ============================
// Jobs Assigned To The Authenticated Mechanic
// ============================

const getMyJobs = async (req, res) => {
    try {
        const filter = { mechanic: req.mechanic._id };

        // Optional status filter, validated against the canonical set.
        if (req.query.status) {
            const { SERVICE_STATUS_VALUES } = require("../models/serviceStatus");

            if (!SERVICE_STATUS_VALUES.includes(req.query.status)) {
                return res.status(400).json({
                    message: "Invalid status filter"
                });
            }

            filter.status = req.query.status;
        }

        const jobs = await ServiceRequest.find(filter)
            .populate(POPULATE)
            .sort({ updatedAt: -1 });

        return res.status(200).json({ jobs });
    } catch (error) {
        return handleError(res, error, "getMyJobs");
    }
};

// ============================
// Single Job Detail (scoped to the mechanic)
// ============================

const getMyJob = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid service request id"
            });
        }

        const job = await ServiceRequest.findOne({
            _id: id,
            mechanic: req.mechanic._id
        }).populate(POPULATE);

        if (!job) {
            return res.status(404).json({
                message: "Job not found"
            });
        }

        return res.status(200).json({ job });
    } catch (error) {
        return handleError(res, error, "getMyJob");
    }
};

// ============================
// Update Job Status (mechanic-driven transitions only)
// ============================

const updateMyJobStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid service request id"
            });
        }

        const job = await ServiceRequest.findOne({
            _id: id,
            mechanic: req.mechanic._id
        });

        if (!job) {
            return res.status(404).json({
                message: "Job not found"
            });
        }

        if (job.status === status) {
            return res.status(200).json({
                message: "Job status unchanged",
                job
            });
        }

        if (!isMechanicTransitionAllowed(job.status, status)) {
            return res.status(400).json({
                message: `Mechanics cannot move a job from "${job.status}" to "${status}"`
            });
        }

        job.status = status;

        if (status === SERVICE_STATUS.COMPLETED) {
            job.completedAt = new Date();

            // Free the mechanic up again once the job is finished.
            if (req.mechanic.status === "Busy") {
                req.mechanic.status = "Available";
                await req.mechanic.save();
            }
        }

        await job.save();
        await job.populate(POPULATE);

        return res.status(200).json({
            message: "Job status updated successfully",
            job
        });
    } catch (error) {
        return handleError(res, error, "updateMyJobStatus");
    }
};

// ============================
// Mechanic Profile / Availability
// ============================

const getMyProfile = async (req, res) => {
    try {
        return res.status(200).json({
            mechanic: req.mechanic,
            email: req.user.email,
            username: req.user.username
        });
    } catch (error) {
        return handleError(res, error, "getMyProfile");
    }
};

const updateMyProfile = async (req, res) => {
    try {
        const updates = pick(req.body, ["phone", "status"]);

        if (updates.phone !== undefined && !isNonEmptyString(updates.phone)) {
            return res.status(400).json({
                message: "Phone must be a non-empty value"
            });
        }

        if (
            updates.status !== undefined &&
            !SELF_SERVICE_STATUS.includes(updates.status)
        ) {
            return res.status(400).json({
                message: "Availability must be either Available or Busy"
            });
        }

        if (updates.phone !== undefined) {
            updates.phone = updates.phone.trim();
        }

        const mechanic = await require("../models/mechanic").findByIdAndUpdate(
            req.mechanic._id,
            updates,
            { returnDocument: "after", runValidators: true }
        );

        return res.status(200).json({
            message: "Profile updated successfully",
            mechanic
        });
    } catch (error) {
        return handleError(res, error, "updateMyProfile");
    }
};

module.exports = {
    getMechanicStats,
    getMyJobs,
    getMyJob,
    updateMyJobStatus,
    getMyProfile,
    updateMyProfile
};
