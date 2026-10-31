import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    ArrowRight,
    CarFront,
    CheckCircle2,
    ClipboardList,
    Clock3,
    ShieldCheck,
    UserCheck,
    Users,
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

const STATUS_MIX = [
    { key: "Pending", className: "mix-pending" },
    { key: "Assigned", className: "mix-assigned" },
    { key: "In Progress", className: "mix-progress" },
    { key: "Completed", className: "mix-completed" },
    { key: "Cancelled", className: "mix-cancelled" }
];

function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        const load = async () => {
            try {
                const [statsRes, requestsRes] = await Promise.all([
                    api.get("/admin/dashboard"),
                    api.get("/service-requests")
                ]);

                if (!active) return;

                setStats(statsRes.data);
                setRequests(requestsRes.data.requests || []);
            } catch (err) {
                if (!active) return;
                setError(
                    err.response?.data?.message ||
                        "Unable to load dashboard data."
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

    const pending = requests
        .filter(
            (request) =>
                request.status !== "Completed" &&
                request.status !== "Cancelled"
        )
        .slice(0, 6);

    const statusCounts = STATUS_MIX.map((entry) => ({
        ...entry,
        count: requests.filter((request) => request.status === entry.key)
            .length
    }));

    const totalTracked = requests.length || 1;

    return (
        <div className="page">
            <PageHeader
                eyebrow="Control centre"
                title="Admin Dashboard"
                subtitle="Platform overview and service activity."
                actions={
                    <Link to="/admin/requests" className="btn btn-primary btn-md">
                        <ClipboardList
                            size={16}
                            strokeWidth={2}
                            aria-hidden="true"
                        />
                        Manage requests
                    </Link>
                }
            />

            <Alert type="error">{error}</Alert>

            {loading ? (
                <div className="stat-grid">
                    {Array.from({ length: 7 }).map((_, index) => (
                        <div className="stat-card skeleton-card" key={index}>
                            <span className="skeleton skeleton-label" />
                            <span className="skeleton skeleton-value" />
                        </div>
                    ))}
                </div>
            ) : (
                stats && (
                    <div className="stat-grid stat-grid-seven">
                        <StatCard
                            label="Total Users"
                            value={stats.totalUsers}
                            accent="blue"
                            icon={Users}
                            hint="Vehicle owner accounts"
                        />
                        <StatCard
                            label="Total Vehicles"
                            value={stats.totalVehicles}
                            accent="indigo"
                            icon={CarFront}
                            hint="Registered in the platform"
                        />
                        <StatCard
                            label="Total Mechanics"
                            value={stats.totalMechanics}
                            accent="teal"
                            icon={Wrench}
                            hint="Workshop profiles"
                        />
                        <StatCard
                            label="Pending Mechanics"
                            value={stats.pendingMechanics}
                            accent="amber"
                            icon={UserCheck}
                            hint="Awaiting approval"
                        />
                        <StatCard
                            label="Total Requests"
                            value={stats.totalRequests}
                            accent="slate"
                            icon={ClipboardList}
                            hint="All service requests"
                        />
                        <StatCard
                            label="Pending Requests"
                            value={stats.pendingRequests}
                            accent="amber"
                            icon={Clock3}
                            hint="Not yet completed"
                        />
                        <StatCard
                            label="Completed Requests"
                            value={stats.completedRequests}
                            accent="green"
                            icon={CheckCircle2}
                            hint="Services delivered"
                        />
                    </div>
                )
            )}

            <div className="grid-2 grid-2-wide">
                <Card
                    title="Requests Needing Attention"
                    subtitle="Active work across the platform"
                    icon={ClipboardList}
                    actions={
                        <Link to="/admin/requests" className="link">
                            Manage all
                        </Link>
                    }
                >
                    {loading ? (
                        <SkeletonRows rows={5} />
                    ) : pending.length === 0 ? (
                        <EmptyState
                            title="All caught up"
                            message="There are no pending service requests."
                            icon={CheckCircle2}
                        />
                    ) : (
                        <ul className="list">
                            {pending.map((request) => (
                                <li key={request._id} className="list-item">
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
                                                {request.serviceType}
                                            </span>
                                            <span className="list-meta">
                                                {request.user?.username ||
                                                    "User"}{" "}
                                                &middot;{" "}
                                                {request.vehicle
                                                    ?.vehicleNumber ||
                                                    "Vehicle"}
                                            </span>
                                        </div>
                                    </div>
                                    <StatusBadge status={request.status} />
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>

                <Card
                    title="Service Mix"
                    subtitle="Live request distribution"
                    icon={ShieldCheck}
                >
                    {loading ? (
                        <SkeletonRows rows={5} />
                    ) : (
                        <div className="status-mix">
                            {statusCounts.map((entry) => {
                                const percent = Math.round(
                                    (entry.count / totalTracked) * 100
                                );

                                return (
                                    <div
                                        className="status-mix-row"
                                        key={entry.key}
                                    >
                                        <div className="status-mix-top">
                                            <span>{entry.key}</span>
                                            <strong>{entry.count}</strong>
                                        </div>
                                        <div
                                            className="status-mix-track"
                                            role="presentation"
                                        >
                                            <span
                                                className={entry.className}
                                                style={{
                                                    width: `${percent}%`
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}

                            <div className="admin-shortcuts">
                                <Link
                                    to="/admin/mechanics"
                                    className="admin-shortcut"
                                >
                                    <Wrench size={16} strokeWidth={2} />
                                    Review mechanics
                                    <ArrowRight size={15} strokeWidth={2} />
                                </Link>
                                <Link
                                    to="/admin/users"
                                    className="admin-shortcut"
                                >
                                    <Users size={16} strokeWidth={2} />
                                    Manage users
                                    <ArrowRight size={15} strokeWidth={2} />
                                </Link>
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}

export default AdminDashboard;
