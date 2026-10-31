import { useCallback, useEffect, useState } from "react";
import { ClipboardList, RefreshCw, UserCog, Wrench } from "lucide-react";

import api from "../../services/api";
import { Card } from "../../components/ui/Card";
import PageHeader from "../../components/ui/PageHeader";
import { Select } from "../../components/ui/Field";
import Button from "../../components/ui/Button";
import { Spinner, Alert, EmptyState } from "../../components/ui/Feedback";
import StatusBadge from "../../components/ui/StatusBadge";
import { Table } from "../../components/ui/Table";
import { useToast } from "../../contexts/ToastContext";

const STATUS_OPTIONS = [
    "Pending",
    "Assigned",
    "In Progress",
    "Completed",
    "Cancelled"
];

function ManageRequests() {
    const toast = useToast();

    const [requests, setRequests] = useState([]);
    const [mechanics, setMechanics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [busyId, setBusyId] = useState(null);
    const [draft, setDraft] = useState({});

    const load = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const [requestsRes, mechanicsRes] = await Promise.all([
                api.get("/service-requests"),
                api.get("/admin/mechanics")
            ]);

            setRequests(requestsRes.data.requests || []);
            setMechanics(mechanicsRes.data.mechanics || []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    "Unable to load service requests."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        load();
    }, [load]);

    const setDraftField = (id, key, value) =>
        setDraft((current) => ({
            ...current,
            [id]: { ...current[id], [key]: value }
        }));

    const handleAssign = async (request) => {
        const mechanicId =
            draft[request._id]?.mechanic || request.mechanic?._id || "";

        if (!mechanicId) {
            toast.error("Please choose a mechanic to assign.");
            return;
        }

        setBusyId(request._id);

        try {
            await api.put(`/service-requests/${request._id}/assign`, {
                mechanic: mechanicId
            });
            toast.success("Mechanic assigned successfully.");
            await load();
        } catch (err) {
            toast.error(
                err.response?.data?.message || "Unable to assign the mechanic."
            );
        } finally {
            setBusyId(null);
        }
    };

    const handleStatus = async (request) => {
        const status = draft[request._id]?.status || request.status;

        setBusyId(request._id);

        try {
            await api.put(`/service-requests/${request._id}/status`, {
                status
            });
            toast.success("Status updated successfully.");
            await load();
        } catch (err) {
            toast.error(
                err.response?.data?.message || "Unable to update the status."
            );
        } finally {
            setBusyId(null);
        }
    };

    const activeCount = requests.filter(
        (request) =>
            request.status !== "Completed" && request.status !== "Cancelled"
    ).length;

    return (
        <div className="page">
            <PageHeader
                eyebrow="Operations"
                title="Service Requests"
                subtitle="Review, assign mechanics and update service status."
                actions={
                    <span className="header-chip">
                        <ClipboardList
                            size={15}
                            strokeWidth={2}
                            aria-hidden="true"
                        />
                        {activeCount} active
                    </span>
                }
            />

            <Alert type="error">{error}</Alert>

            <Card
                title="All Service Requests"
                subtitle="Assign ownership and keep every status accurate"
                icon={ClipboardList}
                actions={
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={load}
                        disabled={loading}
                    >
                        <RefreshCw
                            size={13}
                            strokeWidth={2}
                            aria-hidden="true"
                        />
                        Refresh
                    </Button>
                }
            >
                {loading ? (
                    <Spinner />
                ) : requests.length === 0 ? (
                    <EmptyState
                        title="No service requests"
                        message="Customer requests will appear here."
                        icon={ClipboardList}
                    />
                ) : (
                    <Table
                        columns={[
                            "Customer",
                            "Vehicle",
                            "Service",
                            "Status",
                            "Assign Mechanic",
                            "Update Status"
                        ]}
                    >
                        {requests.map((request) => {
                            const row = draft[request._id] || {};
                            const isBusy = busyId === request._id;
                            const statusOptions = STATUS_OPTIONS.includes(
                                request.status
                            )
                                ? STATUS_OPTIONS
                                : [request.status, ...STATUS_OPTIONS];

                            return (
                                <tr key={request._id}>
                                    <td>
                                        <div className="table-primary">
                                            <span className="avatar avatar-xs">
                                                {request.user?.username
                                                    ?.charAt(0)
                                                    .toUpperCase() || "U"}
                                            </span>
                                            <div>
                                                <span className="list-title">
                                                    {request.user?.username ||
                                                        "User"}
                                                </span>
                                                <span className="list-meta block">
                                                    {request.user?.email || ""}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="plate">
                                            {request.vehicle?.vehicleNumber ||
                                                "—"}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="list-title">
                                            {request.serviceType}
                                        </span>
                                        <span className="list-meta block">
                                            {request.description}
                                        </span>
                                    </td>
                                    <td>
                                        <StatusBadge status={request.status} />
                                    </td>
                                    <td>
                                        <div className="row-actions row-actions-wrap">
                                            <Select
                                                aria-label={`Assign mechanic for ${request.serviceType}`}
                                                value={
                                                    row.mechanic ||
                                                    request.mechanic?._id ||
                                                    ""
                                                }
                                                onChange={(event) =>
                                                    setDraftField(
                                                        request._id,
                                                        "mechanic",
                                                        event.target.value
                                                    )
                                                }
                                            >
                                                <option value="">
                                                    Select mechanic
                                                </option>
                                                {mechanics.map((mechanic) => (
                                                    <option
                                                        key={mechanic._id}
                                                        value={mechanic._id}
                                                    >
                                                        {mechanic.name} (
                                                        {
                                                            mechanic.specialization
                                                        }
                                                        )
                                                    </option>
                                                ))}
                                            </Select>
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                loading={isBusy}
                                                onClick={() =>
                                                    handleAssign(request)
                                                }
                                            >
                                                <UserCog
                                                    size={13}
                                                    strokeWidth={2}
                                                    aria-hidden="true"
                                                />
                                                Assign
                                            </Button>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="row-actions row-actions-wrap">
                                            <Select
                                                aria-label={`Update status for ${request.serviceType}`}
                                                value={
                                                    row.status ||
                                                    request.status
                                                }
                                                onChange={(event) =>
                                                    setDraftField(
                                                        request._id,
                                                        "status",
                                                        event.target.value
                                                    )
                                                }
                                            >
                                                {statusOptions.map(
                                                    (status) => (
                                                        <option
                                                            key={status}
                                                            value={status}
                                                        >
                                                            {status}
                                                        </option>
                                                    )
                                                )}
                                            </Select>
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                loading={isBusy}
                                                onClick={() =>
                                                    handleStatus(request)
                                                }
                                            >
                                                <Wrench
                                                    size={13}
                                                    strokeWidth={2}
                                                    aria-hidden="true"
                                                />
                                                Update
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </Table>
                )}
            </Card>
        </div>
    );
}

export default ManageRequests;
