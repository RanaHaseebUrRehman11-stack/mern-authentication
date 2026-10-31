import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    ArrowRight,
    CarFront,
    CheckCircle2,
    ClipboardList,
    Plus,
    Wrench
} from "lucide-react";

import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { Card, StatCard } from "../components/ui/Card";
import PageHeader from "../components/ui/PageHeader";
import {
    Alert,
    EmptyState,
    SkeletonRows
} from "../components/ui/Feedback";
import StatusBadge from "../components/ui/StatusBadge";

function Dashboard() {
    const { user } = useAuth();

    const [vehicles, setVehicles] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        const load = async () => {
            setLoading(true);
            setError("");

            try {
                const [vehiclesRes, requestsRes] = await Promise.all([
                    api.get("/vehicles/my-vehicles"),
                    api.get("/service-requests/my-requests")
                ]);

                if (!active) return;

                setVehicles(vehiclesRes.data.vehicles || []);
                setRequests(requestsRes.data.requests || []);
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

    const activeRequests = requests.filter(
        (request) => request.status !== "Completed"
    ).length;
    const completedRequests = requests.filter(
        (request) => request.status === "Completed"
    ).length;

    const recent = requests.slice(0, 5);

    return (
        <div className="page">
            <PageHeader
                eyebrow="Owner workspace"
                title={`Welcome back, ${user?.username || "there"}`}
                subtitle="Here is an overview of your vehicles and services."
                actions={
                    <Link
                        to="/service-requests"
                        className="btn btn-primary btn-md"
                    >
                        <Plus size={16} strokeWidth={2.2} aria-hidden="true" />
                        New request
                    </Link>
                }
            />

            <Alert type="error">{error}</Alert>

            <div className="stat-grid">
                <StatCard
                    label="My Vehicles"
                    value={vehicles.length}
                    accent="blue"
                    icon={CarFront}
                    hint="Registered on your account"
                />
                <StatCard
                    label="Active Requests"
                    value={activeRequests}
                    accent="amber"
                    icon={ClipboardList}
                    hint="Currently in the workflow"
                />
                <StatCard
                    label="Completed"
                    value={completedRequests}
                    accent="green"
                    icon={CheckCircle2}
                    hint="Services finished"
                />
            </div>

            <div className="grid-2">
                <Card
                    title="Recent Service Requests"
                    subtitle="Your latest activity"
                    icon={ClipboardList}
                    actions={
                        <Link to="/service-requests" className="link">
                            View all
                        </Link>
                    }
                >
                    {loading ? (
                        <SkeletonRows rows={4} />
                    ) : recent.length === 0 ? (
                        <EmptyState
                            title="No service requests yet"
                            message="Create a service request to get started."
                            icon={Wrench}
                            action={
                                <Link
                                    to="/service-requests"
                                    className="btn btn-primary btn-sm"
                                >
                                    Create a request
                                </Link>
                            }
                        />
                    ) : (
                        <ul className="list">
                            {recent.map((request) => (
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
                                                {request.vehicle
                                                    ?.vehicleNumber ||
                                                    "Vehicle"}{" "}
                                                &middot;{" "}
                                                {new Date(
                                                    request.createdAt
                                                ).toLocaleDateString()}
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
                    title="My Vehicles"
                    subtitle="Your garage at a glance"
                    icon={CarFront}
                    actions={
                        <Link to="/vehicles" className="link">
                            Manage
                        </Link>
                    }
                >
                    {loading ? (
                        <SkeletonRows rows={4} />
                    ) : vehicles.length === 0 ? (
                        <EmptyState
                            title="No vehicles registered"
                            message="Register a vehicle to request services."
                            icon={CarFront}
                            action={
                                <Link
                                    to="/vehicles"
                                    className="btn btn-primary btn-sm"
                                >
                                    Register a vehicle
                                </Link>
                            }
                        />
                    ) : (
                        <ul className="list">
                            {vehicles.slice(0, 5).map((vehicle) => (
                                <li key={vehicle._id} className="list-item">
                                    <div className="list-item-main">
                                        <span className="list-avatar">
                                            <CarFront
                                                size={16}
                                                strokeWidth={1.9}
                                                aria-hidden="true"
                                            />
                                        </span>
                                        <div>
                                            <span className="list-title">
                                                {vehicle.vehicleNumber}
                                            </span>
                                            <span className="list-meta">
                                                {vehicle.company}{" "}
                                                {vehicle.model}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="chip">
                                        {vehicle.vehicleType}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>
            </div>

            <div className="quick-actions">
                <div className="quick-actions-copy">
                    <span className="eyebrow">Quick actions</span>
                    <h2>Keep your service day moving</h2>
                </div>
                <div className="quick-actions-buttons">
                    <Link to="/vehicles" className="btn btn-secondary btn-md">
                        <CarFront size={16} strokeWidth={2} aria-hidden="true" />
                        Register a vehicle
                    </Link>
                    <Link
                        to="/service-requests"
                        className="btn btn-primary btn-md"
                    >
                        New service request
                        <ArrowRight
                            size={16}
                            strokeWidth={2}
                            aria-hidden="true"
                        />
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
