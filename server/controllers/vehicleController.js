const Vehicle = require("../models/vehicle");
const ServiceRequest = require("../models/serviceRequest");
const { handleError } = require("../utils/errorHandler");
const {
    isValidObjectId,
    isNonEmptyString,
    isYear,
    pick
} = require("../utils/validate");

const VEHICLE_TYPES = ["Car", "Bike", "Van", "Truck"];

const EDITABLE_FIELDS = [
    "vehicleNumber",
    "company",
    "model",
    "year",
    "color",
    "vehicleType"
];

const validateVehiclePayload = (body, { partial = false } = {}) => {
    const errors = [];
    const has = (key) => body[key] !== undefined;

    if (!partial || has("vehicleNumber")) {
        if (!isNonEmptyString(body.vehicleNumber)) {
            errors.push("Vehicle number is required");
        }
    }

    if (!partial || has("company")) {
        if (!isNonEmptyString(body.company)) {
            errors.push("Company is required");
        }
    }

    if (!partial || has("model")) {
        if (!isNonEmptyString(body.model)) {
            errors.push("Model is required");
        }
    }

    if (!partial || has("year")) {
        if (!isYear(body.year)) {
            errors.push("A valid year is required");
        }
    }

    if (!partial || has("color")) {
        if (!isNonEmptyString(body.color)) {
            errors.push("Color is required");
        }
    }

    if (has("vehicleType") && !VEHICLE_TYPES.includes(body.vehicleType)) {
        errors.push("Invalid vehicle type");
    }

    return errors;
};

// ============================
// Register Vehicle
// ============================

const registerVehicle = async (req, res) => {
    try {
        const errors = validateVehiclePayload(req.body);

        if (errors.length > 0) {
            return res.status(400).json({
                message: "Validation failed",
                errors
            });
        }

        const vehicleNumber = req.body.vehicleNumber.trim().toUpperCase();

        const existingVehicle = await Vehicle.findOne({ vehicleNumber });

        if (existingVehicle) {
            return res.status(400).json({
                message: "Vehicle already registered"
            });
        }

        const vehicle = new Vehicle({
            owner: req.user.id,
            vehicleNumber,
            company: req.body.company.trim(),
            model: req.body.model.trim(),
            year: Number(req.body.year),
            color: req.body.color.trim(),
            ...(req.body.vehicleType
                ? { vehicleType: req.body.vehicleType }
                : {})
        });

        await vehicle.save();

        return res.status(201).json({
            message: "Vehicle registered successfully",
            vehicle
        });
    } catch (error) {
        return handleError(res, error, "registerVehicle");
    }
};

// ============================
// Get My Vehicles
// ============================

const getMyVehicles = async (req, res) => {
    try {
        const vehicles = await Vehicle.find({
            owner: req.user.id
        }).sort({ createdAt: -1 });

        return res.status(200).json({ vehicles });
    } catch (error) {
        return handleError(res, error, "getMyVehicles");
    }
};

// ============================
// Update Vehicle
// ============================

const updateVehicle = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid vehicle id"
            });
        }

        const vehicle = await Vehicle.findOne({
            _id: id,
            owner: req.user.id
        });

        if (!vehicle) {
            return res.status(404).json({
                message: "Vehicle not found"
            });
        }

        const errors = validateVehiclePayload(req.body, { partial: true });

        if (errors.length > 0) {
            return res.status(400).json({
                message: "Validation failed",
                errors
            });
        }

        const updates = pick(req.body, EDITABLE_FIELDS);

        if (updates.vehicleNumber) {
            updates.vehicleNumber =
                updates.vehicleNumber.trim().toUpperCase();

            const duplicate = await Vehicle.findOne({
                vehicleNumber: updates.vehicleNumber,
                _id: { $ne: id }
            });

            if (duplicate) {
                return res.status(409).json({
                    message: "Vehicle number already in use"
                });
            }
        }
        if (updates.company) updates.company = updates.company.trim();
        if (updates.model) updates.model = updates.model.trim();
        if (updates.color) updates.color = updates.color.trim();
        if (updates.year !== undefined) updates.year = Number(updates.year);

        const updatedVehicle = await Vehicle.findByIdAndUpdate(
            id,
            updates,
            {
                returnDocument: "after",
                runValidators: true
            }
        );

        return res.status(200).json({
            message: "Vehicle updated successfully",
            vehicle: updatedVehicle
        });
    } catch (error) {
        return handleError(res, error, "updateVehicle");
    }
};

// ============================
// Delete Vehicle
// ============================

const deleteVehicle = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid vehicle id"
            });
        }

        const vehicle = await Vehicle.findOne({
            _id: id,
            owner: req.user.id
        });

        if (!vehicle) {
            return res.status(404).json({
                message: "Vehicle not found"
            });
        }

        // Preserve service history: do not orphan existing requests.
        const linkedRequest = await ServiceRequest.findOne({
            vehicle: id
        }).select("_id");

        if (linkedRequest) {
            return res.status(409).json({
                message: "This vehicle has service requests and cannot be deleted"
            });
        }

        await Vehicle.findByIdAndDelete(id);

        return res.status(200).json({
            message: "Vehicle deleted successfully"
        });
    } catch (error) {
        return handleError(res, error, "deleteVehicle");
    }
};

module.exports = {
    registerVehicle,
    getMyVehicles,
    updateVehicle,
    deleteVehicle
};
