// Shared gate for mechanic access. Returns a { code, message } describing
// why a mechanic may not sign in / use the portal, or null when allowed.
//
// Legacy records that predate the approval workflow have no approvalStatus
// field; those are treated as approved (undefined !== "Pending"/"Rejected").

const getMechanicAccessIssue = (mechanic) => {
    if (!mechanic) {
        return {
            code: "MECHANIC_PROFILE_MISSING",
            message:
                "No mechanic profile is linked to this account. Please contact the administrator."
        };
    }

    if (mechanic.approvalStatus === "Rejected") {
        return {
            code: "MECHANIC_REJECTED",
            message:
                "Your mechanic registration was rejected. Please contact the administrator."
        };
    }

    if (mechanic.approvalStatus === "Pending") {
        return {
            code: "MECHANIC_PENDING",
            message:
                "Your mechanic account is pending administrator approval. You will be able to sign in once it is approved."
        };
    }

    if (mechanic.status === "Inactive") {
        return {
            code: "MECHANIC_INACTIVE",
            message:
                "Your mechanic account is inactive. Please contact the administrator."
        };
    }

    return null;
};

module.exports = { getMechanicAccessIssue };
