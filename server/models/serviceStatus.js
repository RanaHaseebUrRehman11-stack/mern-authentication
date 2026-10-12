// Canonical service-request status values.
// "Accepted" is retained for backward compatibility with any legacy records
// that may already use it, but the current workflow uses "Assigned".
const SERVICE_STATUS = {
    PENDING: "Pending",
    ACCEPTED: "Accepted",
    ASSIGNED: "Assigned",
    IN_PROGRESS: "In Progress",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled"
};

const SERVICE_STATUS_VALUES = Object.values(SERVICE_STATUS);

module.exports = { SERVICE_STATUS, SERVICE_STATUS_VALUES };
