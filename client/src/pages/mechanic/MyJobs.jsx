import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Play, Wrench } from "lucide-react";

import api from "../../services/api";
import { Card } from "../../components/ui/Card";
import PageHeader from "../../components/ui/PageHeader";
import { Select } from "../../components/ui/Field";
import Button from "../../components/ui/Button";
import {
    Spinner,
    Alert,
    EmptyState
} from "../../components/ui/Feedback";
import StatusBadge from "../../components/ui/StatusBadge";
import { Table } from "../../components/ui/Table";
import { useToast } from "../../contexts/ToastContext";

const FILTERS = ["All", "Assigned", "In Progress", "Completed"];

function MyJobs() {
    const toast = useToast();

    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState("All");
    const [busyId, setBusyId] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const { data } = await api.get("/mechanic/jobs");
            setJobs(data.jobs || []);
        } catch (err) {
            setError(
                err.response?.data?.message || "Unable to load your jobs."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        load();
    }, [load]);

    const updateStatus = async (job, status) => {
        setBusyId(job._id);

        try {
            await api.put(`/mechanic/jobs/${job._id}/status`, { status });
            toast.success(`Job marked as ${status}.`);
            await load();
        } catch (err) {
            toast.error(
                err.response?.data?.message || "Unable to update the job."
            );
        } finally {
            setBusyId(null);
        }
    };

    const visibleJobs =
        filter === "All" ? jobs : jobs.filter((job) => job.status === filter);

    const counts = FILTERS.reduce((result, option) => {
        result[option] =
            option === "All"
                ? jobs.length
                : jobs.filter((job) => job.status === option).length;
        return result;
    }, {});

    return (
        <div className="page">
            <PageHeader
                eyebrow="Job queue"
                title="My Jobs"
                subtitle="Jobs assigned to you. Update their progress here."
                actions={
                    <span className="header-chip">
                        <Wrench
                            size={15}
                            strokeWidth={2}
                            aria-hidden="true"
                        />
                        {counts.Assigned || 0} waiting
                    </span>
                }
            />

            <Alert type="error">{error}</Alert>

            <div className="filter-chips" aria-label="Filter jobs">
                {FILTERS.map((option) => (
                    <button
                        key={option}
                        type="button"
                        className={`filter-chip ${
                            filter === option ? "active" : ""
                        }`}
                        onClick={() => setFilter(option)}
                    >
                        {option}
                        <span>{counts[option] || 0}</span>
                    </button>
                ))}
            </div>

            <Card
                title="Assigned Jobs"
                subtitle="Update each job as work progresses"
                icon={Wrench}
                actions={
                    <Select
                        value={filter}
                        onChange={(event) => setFilter(event.target.value)}
                        aria-label="Filter jobs"
                    >
                        {FILTERS.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </Select>
                }
            >
                {loading ? (
                    <Spinner />
                ) : visibleJobs.length === 0 ? (
                    <EmptyState
                        title="No jobs"
                        message="There are no jobs matching this filter."
                        icon={Wrench}
                    />
                ) : (
                    <Table
                        columns={[
                            "Vehicle",
                            "Owner",
                            "Service",
                            "Status",
                            "Created",
                            "Action"
                        ]}
                    >
                        {visibleJobs.map((job) => {
                            const isBusy = busyId === job._id;

                            return (
                                <tr key={job._id}>
                                    <td>
                                        <span className="plate">
                                            {job.vehicle?.vehicleNumber ||
                                                "—"}
                                        </span>
                                    </td>
                                    <td>
                                        {job.user?.username || "Owner"}
                                    </td>
                                    <td>
                                        <div className="table-primary column">
                                            <span className="list-title">
                                                {job.serviceType}
                                            </span>
                                            <span className="list-meta block">
                                                {job.description}
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <StatusBadge status={job.status} />
                                    </td>
                                    <td>
                                        {new Date(
                                            job.createdAt
                                        ).toLocaleDateString()}
                                    </td>
                                    <td>
                                        {job.status === "Assigned" && (
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                loading={isBusy}
                                                onClick={() =>
                                                    updateStatus(
                                                        job,
                                                        "In Progress"
                                                    )
                                                }
                                            >
                                                <Play
                                                    size={13}
                                                    strokeWidth={2}
                                                    aria-hidden="true"
                                                />
                                                Start
                                            </Button>
                                        )}
                                        {job.status === "In Progress" && (
                                            <Button
                                                size="sm"
                                                variant="primary"
                                                loading={isBusy}
                                                onClick={() =>
                                                    updateStatus(
                                                        job,
                                                        "Completed"
                                                    )
                                                }
                                            >
                                                <CheckCircle2
                                                    size={13}
                                                    strokeWidth={2}
                                                    aria-hidden="true"
                                                />
                                                Complete
                                            </Button>
                                        )}
                                        {(job.status === "Completed" ||
                                            job.status === "Cancelled") && (
                                            <span className="muted">—</span>
                                        )}
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

export default MyJobs;
