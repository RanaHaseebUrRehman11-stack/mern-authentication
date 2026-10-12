const ServiceRequest = require("../models/serviceRequest");
const Vehicle = require("../models/vehicle");
const Mechanic = require("../models/mechanic");
const {
    SERVICE_STATUS,
    SERVICE_STATUS_VALUES
} = require("../models/serviceStatus");
const {
    isTerminal,
    isAdminTransitionAllowed
} = require("../utils/serviceWorkflow");
const { handleError } = require("../utils/errorHandler");
const {
    isValidObjectId,
    isNonEmptyString
} = require("../utils/validate");

// ============================
// Create Service Request
// ============================

const createServiceRequest = async (req, res) => {
    try {
        const { vehicle, serviceType, description } = req.body;

        if (!isValidObjectId(vehicle)) {
            return res.status(400).json({
                message: "A valid vehicle is required"
            });
        }

        if (!isNonEmptyString(serviceType)) {
            return res.status(400).json({
                message: "Service type is required"
            });
        }

        if (!isNonEmptyString(description)) {
            return res.status(400).json({
                message: "Description is required"
            });
        }

        const userVehicle = await Vehicle.findOne({
            _id: vehicle,
            owner: req.user.id
        });

        if (!userVehicle) {
            return res.status(404).json({
                message: "Vehicle not found"
            });
        }

        const serviceRequest = new ServiceRequest({
            user: req.user.id,
            vehicle,
            serviceType: serviceType.trim(),
            description: description.trim()
        });

        await serviceRequest.save();

        return res.status(201).json({
            message: "Service request created successfully",
            serviceRequest
        });
    } catch (error) {
        return handleError(res, error, "createServiceRequest");
    }
};

// ============================
// Get My Service Requests
// ============================

const getMyRequests = async (req, res) => {
    try {
        const requests = await ServiceRequest.find({
            user: req.user.id
        })
            .populate("vehicle")
            .populate("mechanic", "name email specialization")
            .sort({ createdAt: -1 });

        return res.status(200).json({ requests });
    } catch (error) {
        return handleError(res, error, "getMyRequests");
    }
};

// ============================
// Get All Service Requests (Admin)
// ============================

const getAllServiceRequests = async (req, res) => {
    try {
        const requests = await ServiceRequest.find()
            .populate("user", "username email")
            .populate("vehicle")
            .populate("mechanic", "name email specialization")
            .sort({ createdAt: -1 });

        return res.status(200).json({ requests });
    } catch (error) {
        return handleError(res, error, "getAllServiceRequests");
    }
};

// ============================
// Assign Mechanic
// ============================

const assignMechanic = async (req, res) => {
    try {
        const { id } = req.params;
        const { mechanic } = req.body;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid service request id"
            });
        }

        if (!isValidObjectId(mechanic)) {
            return res.status(400).json({
                message: "A valid mechanic is required"
            });
        }

        const serviceRequest = await ServiceRequest.findById(id);

        if (!serviceRequest) {
            return res.status(404).json({
                message: "Service request not found"
            });
        }

        if (isTerminal(serviceRequest.status)) {
            return res.status(409).json({
                message: "Completed or cancelled requests cannot be reassigned"
            });
        }

        const mechanicExists = await Mechanic.findById(mechanic);

        if (!mechanicExists) {
            return res.status(404).json({
                message: "Mechanic not found"
            });
        }

        if (mechanicExists.status === "Inactive") {
            return res.status(409).json({
                message: "This mechanic is inactive and cannot be assigned"
            });
        }

        const previousStatus = serviceRequest.status;

        serviceRequest.mechanic = mechanic;
        serviceRequest.assignedAt = new Date();

        // Only advance Pending/Accepted to Assigned. Reassigning an
        // in-progress job keeps its current status.
        if (
            previousStatus === SERVICE_STATUS.PENDING ||
            previousStatus === SERVICE_STATUS.ACCEPTED
        ) {
            serviceRequest.status = SERVICE_STATUS.ASSIGNED;
        }

        await serviceRequest.save();

        await serviceRequest.populate([
            { path: "user", select: "username email" },
            { path: "vehicle" },
            { path: "mechanic", select: "name email specialization" }
        ]);

        return res.status(200).json({
            message: "Mechanic assigned successfully",
            serviceRequest
        });
    } catch (error) {
        return handleError(res, error, "assignMechanic");
    }
};

// ============================
// Update Service Status
// ============================

const updateServiceStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid service request id"
            });
        }

        if (!SERVICE_STATUS_VALUES.includes(status)) {
            return res.status(400).json({
                message: "Invalid status"
            });
        }

        const serviceRequest = await ServiceRequest.findById(id);

        if (!serviceRequest) {
            return res.status(404).json({
                message: "Service request not found"
            });
        }

        if (serviceRequest.status === status) {
            // Idempotent no-op keeps the admin UI forgiving.
            return res.status(200).json({
                message: "Service status unchanged",
                serviceRequest
            });
        }

        if (!isAdminTransitionAllowed(serviceRequest.status, status)) {
            return res.status(400).json({
                message: `Invalid status transition from "${serviceRequest.status}" to "${status}"`
            });
        }

        serviceRequest.status = status;

        if (status === SERVICE_STATUS.COMPLETED) {
            serviceRequest.completedAt = new Date();
        }

        await serviceRequest.save();

        await serviceRequest.populate([
            { path: "user", select: "username email" },
            { path: "vehicle" },
            { path: "mechanic", select: "name email specialization" }
        ]);

        return res.status(200).json({
            message: "Service status updated successfully",
            serviceRequest
        });
    } catch (error) {
        return handleError(res, error, "updateServiceStatus");
    }
};

// ============================
// Get Service History
// ============================

const getServiceHistory = async (req, res) => {
    try {
        const history = await ServiceRequest.find({
            user: req.user.id,
            status: SERVICE_STATUS.COMPLETED
        })
            .populate("vehicle")
            .populate("mechanic", "name email specialization")
            .sort({ updatedAt: -1 });

        return res.status(200).json({ history });
    } catch (error) {
        return handleError(res, error, "getServiceHistory");
    }
};

module.exports = {
    createServiceRequest,
    getMyRequests,
    getAllServiceRequests,
    assignMechanic,
    updateServiceStatus,
    getServiceHistory
};
