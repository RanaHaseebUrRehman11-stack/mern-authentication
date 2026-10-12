import { useCallback, useEffect, useState } from "react";
import api from "../../services/api";
import { Card } from "../../components/ui/Card";
import { Select } from "../../components/ui/Field";
import Button from "../../components/ui/Button";
import { Spinner, Alert, EmptyState } from "../../components/ui/Feedback";
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

    return (
        <div className="page">
            <div className="page-head">
                <div>
                    <h1 className="page-title">My Jobs</h1>
                    <p className="page-subtitle">
                        Jobs assigned to you. Update their progress here.
                    </p>
                </div>
            </div>

            <Alert type="error">{error}</Alert>

            <Card
                title="Assigned Jobs"
                actions={
                    <Select
                        value={filter}
                        onChange={(event) => setFilter(event.target.value)}
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
                                    <td className="mono">
                                        {job.vehicle?.vehicleNumber || "—"}
                                    </td>
                                    <td>{job.user?.username || "Owner"}</td>
                                    <td>
                                        <span className="list-title">
                                            {job.serviceType}
                                        </span>
                                        <span className="list-meta block">
                                            {job.description}
                                        </span>
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
