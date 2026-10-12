const STATUS_CLASS = {
    Pending: "badge-pending",
    Accepted: "badge-pending",
    Assigned: "badge-assigned",
    "In Progress": "badge-progress",
    Completed: "badge-completed",
    Cancelled: "badge-cancelled",
    Available: "badge-completed",
    Busy: "badge-progress",
    Inactive: "badge-cancelled",
    Approved: "badge-completed",
    Rejected: "badge-cancelled"
};

function StatusBadge({ status }) {
    const className = STATUS_CLASS[status] || "badge-default";

    return <span className={`badge ${className}`}>{status}</span>;
}

export default StatusBadge;
