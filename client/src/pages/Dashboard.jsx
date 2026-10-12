import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { Card, StatCard } from "../components/ui/Card";
import { Spinner, Alert, EmptyState } from "../components/ui/Feedback";
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
            <div className="page-head">
                <div>
                    <h1 className="page-title">
                        Welcome back, {user?.username}
                    </h1>
                    <p className="page-subtitle">
                        Here is an overview of your vehicles and services.
                    </p>
                </div>
            </div>

            <Alert type="error">{error}</Alert>

            <div className="stat-grid">
                <StatCard label="My Vehicles" value={vehicles.length} accent="blue" />
                <StatCard label="Active Requests" value={activeRequests} accent="amber" />
                <StatCard label="Completed" value={completedRequests} accent="green" />
            </div>

            <div className="grid-2">
                <Card
                    title="Recent Service Requests"
                    actions={
                        <Link to="/service-requests" className="link">
                            View all
                        </Link>
                    }
                >
                    {loading ? (
                        <Spinner />
                    ) : recent.length === 0 ? (
                        <EmptyState
                            title="No service requests yet"
                            message="Create a service request to get started."
                            action={
                                <Link to="/service-requests" className="link">
                                    Create a request
                                </Link>
                            }
                        />
                    ) : (
                        <ul className="list">
                            {recent.map((request) => (
                                <li key={request._id} className="list-item">
                                    <div>
                                        <span className="list-title">
                                            {request.serviceType}
                                        </span>
                                        <span className="list-meta">
                                            {request.vehicle?.vehicleNumber ||
                                                "Vehicle"}{" "}
                                            &middot;{" "}
                                            {new Date(
                                                request.createdAt
                                            ).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <StatusBadge status={request.status} />
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>

                <Card
                    title="My Vehicles"
                    actions={
                        <Link to="/vehicles" className="link">
                            Manage
                        </Link>
                    }
                >
                    {loading ? (
                        <Spinner />
                    ) : vehicles.length === 0 ? (
                        <EmptyState
                            title="No vehicles registered"
                            message="Register a vehicle to request services."
                            action={
                                <Link to="/vehicles" className="link">
                                    Register a vehicle
                                </Link>
                            }
                        />
                    ) : (
                        <ul className="list">
                            {vehicles.slice(0, 5).map((vehicle) => (
                                <li key={vehicle._id} className="list-item">
                                    <div>
                                        <span className="list-title">
                                            {vehicle.vehicleNumber}
                                        </span>
                                        <span className="list-meta">
                                            {vehicle.company} {vehicle.model}
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>
            </div>

            <div className="quick-actions">
                <Link to="/vehicles" className="btn btn-primary btn-md">
                    Register a vehicle
                </Link>
                <Link to="/service-requests" className="btn btn-secondary btn-md">
                    New service request
                </Link>
            </div>
        </div>
    );
}

export default Dashboard;
