import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    CheckCircle2,
    ClipboardList,
    Clock3,
    Wrench
} from "lucide-react";

import api from "../../services/api";
import { Card, StatCard } from "../../components/ui/Card";
import PageHeader from "../../components/ui/PageHeader";
import {
    Alert,
    EmptyState,
    SkeletonRows
} from "../../components/ui/Feedback";
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
            <PageHeader
                eyebrow="Workshop workspace"
                title="Mechanic Dashboard"
                subtitle="Your assigned jobs and workload at a glance."
                actions={
                    <Link to="/mechanic/jobs" className="btn btn-primary btn-md">
                        <ClipboardList
                            size={16}
                            strokeWidth={2}
                            aria-hidden="true"
                        />
                        Open job queue
                    </Link>
                }
            />

            <Alert type="error">{error}</Alert>

            {loading ? (
                <div className="stat-grid">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div className="stat-card skeleton-card" key={index}>
                            <span className="skeleton skeleton-label" />
                            <span className="skeleton skeleton-value" />
                        </div>
                    ))}
                </div>
            ) : (
                stats && (
                    <div className="stat-grid">
                        <StatCard
                            label="Total Jobs"
                            value={stats.totalJobs}
                            accent="slate"
                            icon={ClipboardList}
                            hint="All time assignments"
                        />
                        <StatCard
                            label="Assigned"
                            value={stats.assignedJobs}
                            accent="blue"
                            icon={Wrench}
                            hint="Waiting to start"
                        />
                        <StatCard
                            label="In Progress"
                            value={stats.inProgressJobs}
                            accent="amber"
                            icon={Clock3}
                            hint="Active on the bench"
                        />
                        <StatCard
                            label="Completed"
                            value={stats.completedJobs}
                            accent="green"
                            icon={CheckCircle2}
                            hint="Finished services"
                        />
                    </div>
                )
            )}

            <Card
                title="Active Jobs"
                subtitle="Work currently on your bench"
                icon={Wrench}
                actions={
                    <Link to="/mechanic/jobs" className="link">
                        View all
                    </Link>
                }
            >
                {loading ? (
                    <SkeletonRows rows={4} />
                ) : activeJobs.length === 0 ? (
                    <EmptyState
                        title="No active jobs"
                        message="New assignments will appear here."
                        icon={Wrench}
                    />
                ) : (
                    <ul className="list">
                        {activeJobs.map((job) => (
                            <li key={job._id} className="list-item">
                                <div className="list-item-main">
                                    <span className="list-avatar">
                                        <Wrench
                                            size={16}
                                            strokeWidth={1.9}
                                            aria-hidden="true"
                                        />
                                    </span>
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
                                </div>
                                <StatusBadge status={job.status} />
                            </li>
                        ))}
                    </ul>
                )}
            </Card>

            <div className="quick-actions">
                <div className="quick-actions-copy">
                    <span className="eyebrow">Next up</span>
                    <h2>Clear the queue, one job at a time</h2>
                </div>
                <div className="quick-actions-buttons">
                    <Link
                        to="/mechanic/jobs"
                        className="btn btn-primary btn-md"
                    >
                        Manage my jobs
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default MechanicDashboard;
