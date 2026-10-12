const Mechanic = require("../models/mechanic");
const User = require("../models/user");
const ServiceRequest = require("../models/serviceRequest");
const { handleError } = require("../utils/errorHandler");
const {
    isValidObjectId,
    isNonEmptyString,
    isValidEmail,
    isValidPassword,
    pick
} = require("../utils/validate");

const MECHANIC_STATUS = ["Available", "Busy", "Inactive"];

const EDITABLE_FIELDS = [
    "name",
    "email",
    "phone",
    "specialization",
    "experience",
    "status"
];

const validateMechanicPayload = (body, { partial = false } = {}) => {
    const errors = [];

    const has = (key) => body[key] !== undefined;

    if (!partial || has("name")) {
        if (!isNonEmptyString(body.name)) {
            errors.push("Name is required");
        }
    }

    if (!partial || has("email")) {
        if (!isValidEmail(body.email)) {
            errors.push("A valid email is required");
        }
    }

    if (!partial || has("phone")) {
        if (!isNonEmptyString(body.phone)) {
            errors.push("Phone is required");
        }
    }

    if (!partial || has("specialization")) {
        if (!isNonEmptyString(body.specialization)) {
            errors.push("Specialization is required");
        }
    }

    if (!partial || has("experience")) {
        const experience = Number(body.experience);
        if (!Number.isFinite(experience) || experience < 0) {
            errors.push("Experience must be a non-negative number");
        }
    }

    if (has("status") && !MECHANIC_STATUS.includes(body.status)) {
        errors.push("Invalid status value");
    }

    return errors;
};

// ============================
// Create Mechanic
// ============================

const createMechanic = async (req, res) => {
    try {
        const errors = validateMechanicPayload(req.body);

        if (errors.length > 0) {
            return res.status(400).json({
                message: "Validation failed",
                errors
            });
        }

        const email = req.body.email.trim().toLowerCase();

        const existingMechanic = await Mechanic.findOne({ email });

        if (existingMechanic) {
            return res.status(400).json({
                message: "Mechanic already exists"
            });
        }

        const mechanic = new Mechanic({
            name: req.body.name.trim(),
            email,
            phone: req.body.phone.trim(),
            specialization: req.body.specialization.trim(),
            experience: Number(req.body.experience),
            approvalStatus: "Approved",
            ...(req.body.status ? { status: req.body.status } : {})
        });

        await mechanic.save();

        // Optional: create a linked, restricted login account for the mechanic.
        // The admin supplies the password; it is never generated or echoed.
        let accountCreated = false;

        if (req.body.password !== undefined) {
            if (!isValidPassword(req.body.password)) {
                await Mechanic.findByIdAndDelete(mechanic._id);

                return res.status(400).json({
                    message: "Password must be at least 6 characters"
                });
            }

            const existingAccount = await User.findOne({ email });

            if (existingAccount) {
                await Mechanic.findByIdAndDelete(mechanic._id);

                return res.status(409).json({
                    message: "A login account already uses that email"
                });
            }

            const account = await User.create({
                username: mechanic.name,
                email,
                password: req.body.password,
                role: "mechanic"
            });

            mechanic.user = account._id;
            await mechanic.save();
            accountCreated = true;
        }

        return res.status(201).json({
            message: "Mechanic created successfully",
            mechanic,
            accountCreated
        });
    } catch (error) {
        return handleError(res, error, "createMechanic");
    }
};

// ============================
// Create / Link a Mechanic Login Account
// ============================

const createMechanicAccount = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid mechanic id"
            });
        }

        const mechanic = await Mechanic.findById(id);

        if (!mechanic) {
            return res.status(404).json({
                message: "Mechanic not found"
            });
        }

        if (mechanic.user) {
            return res.status(409).json({
                message: "This mechanic already has a login account"
            });
        }

        if (!isValidPassword(req.body.password)) {
            return res.status(400).json({
                message: "Password must be at least 6 characters"
            });
        }

        const email = (req.body.email || mechanic.email).trim().toLowerCase();

        if (!isValidEmail(email)) {
            return res.status(400).json({
                message: "A valid email is required"
            });
        }

        const existingAccount = await User.findOne({ email });

        if (existingAccount) {
            return res.status(409).json({
                message: "A login account already uses that email"
            });
        }

        const account = await User.create({
            username: mechanic.name,
            email,
            password: req.body.password,
            role: "mechanic"
        });

        mechanic.user = account._id;
        await mechanic.save();

        return res.status(201).json({
            message: "Mechanic login account created successfully",
            mechanic
        });
    } catch (error) {
        return handleError(res, error, "createMechanicAccount");
    }
};

// ============================
// Get All Mechanics
// ============================

const getAllMechanics = async (req, res) => {
    try {
        const mechanics = await Mechanic.find().sort({ createdAt: -1 });

        return res.status(200).json({ mechanics });
    } catch (error) {
        return handleError(res, error, "getAllMechanics");
    }
};

// ============================
// Update Mechanic
// ============================

const updateMechanic = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid mechanic id"
            });
        }

        const errors = validateMechanicPayload(req.body, { partial: true });

        if (errors.length > 0) {
            return res.status(400).json({
                message: "Validation failed",
                errors
            });
        }

        const updates = pick(req.body, EDITABLE_FIELDS);

        if (updates.email) {
            updates.email = updates.email.trim().toLowerCase();
        }
        if (updates.name) {
            updates.name = updates.name.trim();
        }
        if (updates.phone) {
            updates.phone = updates.phone.trim();
        }
        if (updates.specialization) {
            updates.specialization = updates.specialization.trim();
        }
        if (updates.experience !== undefined) {
            updates.experience = Number(updates.experience);
        }

        const updatedMechanic = await Mechanic.findByIdAndUpdate(
            id,
            updates,
            {
                returnDocument: "after",
                runValidators: true
            }
        );

        if (!updatedMechanic) {
            return res.status(404).json({
                message: "Mechanic not found"
            });
        }

        return res.status(200).json({
            message: "Mechanic updated successfully",
            mechanic: updatedMechanic
        });
    } catch (error) {
        return handleError(res, error, "updateMechanic");
    }
};

// ============================
// Update Mechanic Approval Status
// ============================

const APPROVAL_STATUS = ["Pending", "Approved", "Rejected"];

const updateMechanicApproval = async (req, res) => {
    try {
        const { id } = req.params;
        const { approvalStatus } = req.body;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid mechanic id"
            });
        }

        if (!APPROVAL_STATUS.includes(approvalStatus)) {
            return res.status(400).json({
                message: "Invalid approval status value"
            });
        }

        const mechanic = await Mechanic.findById(id);

        if (!mechanic) {
            return res.status(404).json({
                message: "Mechanic not found"
            });
        }

        mechanic.approvalStatus = approvalStatus;

        // Keep availability consistent with the approval decision so a
        // rejected/unapproved mechanic cannot be assigned new work.
        if (approvalStatus === "Approved") {
            if (mechanic.status === "Inactive") {
                mechanic.status = "Available";
            }
        } else {
            mechanic.status = "Inactive";
        }

        await mechanic.save();

        return res.status(200).json({
            message: `Mechanic ${approvalStatus.toLowerCase()} successfully`,
            mechanic
        });
    } catch (error) {
        return handleError(res, error, "updateMechanicApproval");
    }
};

// ============================
// Delete Mechanic
// ============================

const deleteMechanic = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid mechanic id"
            });
        }

        // Preserve service history: do not orphan existing requests.
        const linkedRequest = await ServiceRequest.findOne({
            mechanic: id
        }).select("_id");

        if (linkedRequest) {
            return res.status(409).json({
                message: "This mechanic is assigned to service requests and cannot be deleted"
            });
        }

        const deletedMechanic = await Mechanic.findByIdAndDelete(id);

        if (!deletedMechanic) {
            return res.status(404).json({
                message: "Mechanic not found"
            });
        }

        // Deactivate (soft-delete) the linked login account, if any, so it can
        // no longer authenticate.
        if (deletedMechanic.user) {
            await User.updateOne(
                { _id: deletedMechanic.user },
                { $set: { isActive: false } }
            );
        }

        return res.status(200).json({
            message: "Mechanic deleted successfully"
        });
    } catch (error) {
        return handleError(res, error, "deleteMechanic");
    }
};

module.exports = {
    createMechanic,
    createMechanicAccount,
    getAllMechanics,
    updateMechanic,
    updateMechanicApproval,
    deleteMechanic
};
