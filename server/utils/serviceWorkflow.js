const { SERVICE_STATUS } = require("../models/serviceStatus");

// ============================
// Service request lifecycle
// ============================
// Canonical flow:
//   Pending -> Assigned -> In Progress -> Completed
// Cancellation is allowed while a request is still open. Completed and
// Cancelled are terminal states.
//
// Legacy "Accepted" records are tolerated: an Accepted request can move to
// Assigned, In Progress or Cancelled so old data keeps flowing.

const ADMIN_TRANSITIONS = {
    [SERVICE_STATUS.PENDING]: [
        SERVICE_STATUS.ASSIGNED,
        SERVICE_STATUS.CANCELLED
    ],
    [SERVICE_STATUS.ACCEPTED]: [
        SERVICE_STATUS.ASSIGNED,
        SERVICE_STATUS.IN_PROGRESS,
        SERVICE_STATUS.CANCELLED
    ],
    [SERVICE_STATUS.ASSIGNED]: [
        SERVICE_STATUS.IN_PROGRESS,
        SERVICE_STATUS.CANCELLED
    ],
    [SERVICE_STATUS.IN_PROGRESS]: [
        SERVICE_STATUS.COMPLETED,
        SERVICE_STATUS.CANCELLED
    ],
    [SERVICE_STATUS.COMPLETED]: [],
    [SERVICE_STATUS.CANCELLED]: []
};

// Mechanics may only drive a job forward for a job assigned to them.
const MECHANIC_TRANSITIONS = {
    [SERVICE_STATUS.ASSIGNED]: [SERVICE_STATUS.IN_PROGRESS],
    [SERVICE_STATUS.IN_PROGRESS]: [SERVICE_STATUS.COMPLETED]
};

const TERMINAL_STATUSES = [
    SERVICE_STATUS.COMPLETED,
    SERVICE_STATUS.CANCELLED
];

const isTerminal = (status) => TERMINAL_STATUSES.includes(status);

const isAdminTransitionAllowed = (from, to) =>
    (ADMIN_TRANSITIONS[from] || []).includes(to);

const isMechanicTransitionAllowed = (from, to) =>
    (MECHANIC_TRANSITIONS[from] || []).includes(to);

module.exports = {
    ADMIN_TRANSITIONS,
    MECHANIC_TRANSITIONS,
    TERMINAL_STATUSES,
    isTerminal,
    isAdminTransitionAllowed,
    isMechanicTransitionAllowed
};
