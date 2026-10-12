import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { Card, StatCard } from "../../components/ui/Card";
import { Spinner, Alert, EmptyState } from "../../components/ui/Feedback";
import StatusBadge from "../../components/ui/StatusBadge";

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
        .filter((request) => request.status !== "Completed" && request.status !== "Cancelled")
        .slice(0, 6);

    return (
        <div className="page">
            <div className="page-head">
                <div>
                    <h1 className="page-title">Admin Dashboard</h1>
                    <p className="page-subtitle">
                        Platform overview and service activity.
                    </p>
                </div>
            </div>

            <Alert type="error">{error}</Alert>

            {loading ? (
                <Spinner />
            ) : (
                stats && (
                    <div className="stat-grid">
                        <StatCard label="Total Users" value={stats.totalUsers} accent="blue" />
                        <StatCard label="Total Vehicles" value={stats.totalVehicles} accent="indigo" />
                        <StatCard label="Total Mechanics" value={stats.totalMechanics} accent="teal" />
                        <StatCard label="Pending Mechanics" value={stats.pendingMechanics} accent="amber" />
                        <StatCard label="Total Requests" value={stats.totalRequests} accent="slate" />
                        <StatCard label="Pending Requests" value={stats.pendingRequests} accent="amber" />
                        <StatCard label="Completed Requests" value={stats.completedRequests} accent="green" />
                    </div>
                )
            )}

            <Card
                title="Requests Needing Attention"
                actions={
                    <Link to="/admin/requests" className="link">
                        Manage all
                    </Link>
                }
            >
                {loading ? (
                    <Spinner />
                ) : pending.length === 0 ? (
                    <EmptyState
                        title="All caught up"
                        message="There are no pending service requests."
                    />
                ) : (
                    <ul className="list">
                        {pending.map((request) => (
                            <li key={request._id} className="list-item">
                                <div>
                                    <span className="list-title">
                                        {request.serviceType}
                                    </span>
                                    <span className="list-meta">
                                        {request.user?.username || "User"} &middot;{" "}
                                        {request.vehicle?.vehicleNumber ||
                                            "Vehicle"}
                                    </span>
                                </div>
                                <StatusBadge status={request.status} />
                            </li>
                        ))}
                    </ul>
                )}
            </Card>
        </div>
    );
}

export default AdminDashboard;
