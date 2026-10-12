const mongoose = require("mongoose");

const mechanicSchema = new mongoose.Schema({

    // Optional login account linked to this mechanic record. Only admins can
    // create/link the account, and the linked User must have role "mechanic".
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },

    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    phone: {
        type: String,
        required: true
    },

    specialization: {
        type: String,
        required: true
    },

    experience: {
        type: Number,
        required: true
    },

    status: {
        type: String,
        enum: ["Available", "Busy", "Inactive"],
        default: "Available"
    },

    // Approval workflow for self-registered mechanics. Admin-created and
    // legacy records default to "Approved"; public registration sets "Pending".
    approvalStatus: {
        type: String,
        enum: ["Pending", "Approved", "Rejected"],
        default: "Approved"
    }

}, {
    timestamps: true
});

// At most one mechanic record per linked login account.
mechanicSchema.index(
    { user: 1 },
    { unique: true, partialFilterExpression: { user: { $type: "objectId" } } }
);

const Mechanic = mongoose.model("Mechanic", mechanicSchema);

module.exports = Mechanic;