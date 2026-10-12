import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { Card, StatCard } from "../../components/ui/Card";
import { Spinner, Alert, EmptyState } from "../../components/ui/Feedback";
import StatusBadge from "../../components/ui/StatusBadge";

function MechanicDashboard() {
    const [stats, setStats] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        const load = async () => {
            try {
                const [statsRes, jobsRes] = await Promise.all([
                    api.get("/mechanic/dashboard"),
                    api.get("/mechanic/jobs")
                ]);

                if (!active) return;

                setStats(statsRes.data);
                setJobs(jobsRes.data.jobs || []);
            } catch (err) {
                if (!active) return;
                setError(
                    err.response?.data?.message ||
                        "Unable to load your dashboard."
                );
            } finally {
                if (active) setLoading(false);
            }
        };

        load();

        return () => {
            active = false;
        };
    }, []);

    const activeJobs = jobs
        .filter(
            (job) =>
                job.status !== "Completed" && job.status !== "Cancelled"
        )
        .slice(0, 6);

    return (
        <div className="page">
            <div className="page-head">
                <div>
                    <h1 className="page-title">Mechanic Dashboard</h1>
                    <p className="page-subtitle">
                        Your assigned jobs and workload at a glance.
                    </p>
                </div>
            </div>

            <Alert type="error">{error}</Alert>

            {loading ? (
                <Spinner />
            ) : (
                stats && (
                    <div className="stat-grid">
                        <StatCard label="Total Jobs" value={stats.totalJobs} accent="slate" />
                        <StatCard label="Assigned" value={stats.assignedJobs} accent="blue" />
                        <StatCard label="In Progress" value={stats.inProgressJobs} accent="amber" />
                        <StatCard label="Completed" value={stats.completedJobs} accent="green" />
                    </div>
                )
            )}

            <Card
                title="Active Jobs"
                actions={
                    <Link to="/mechanic/jobs" className="link">
                        View all
                    </Link>
                }
            >
                {loading ? (
                    <Spinner />
                ) : activeJobs.length === 0 ? (
                    <EmptyState
                        title="No active jobs"
                        message="New assignments will appear here."
                    />
                ) : (
                    <ul className="list">
                        {activeJobs.map((job) => (
                            <li key={job._id} className="list-item">
                                <div>
                                    <span className="list-title">
                                        {job.serviceType}
                                    </span>
                                    <span className="list-meta">
                                        {job.vehicle?.vehicleNumber ||
                                            "Vehicle"}{" "}
                                        &middot;{" "}
                                        {job.user?.username || "Owner"}
                                    </span>
                                </div>
                                <StatusBadge status={job.status} />
                            </li>
                        ))}
                    </ul>
                )}
            </Card>
        </div>
    );
}

export default MechanicDashboard;
