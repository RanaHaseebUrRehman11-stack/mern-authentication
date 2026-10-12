import { useCallback, useEffect, useState } from "react";
import api from "../services/api";
import { Card } from "../components/ui/Card";
import { Field, Select, Textarea } from "../components/ui/Field";
import Button from "../components/ui/Button";
import { Spinner, Alert, EmptyState } from "../components/ui/Feedback";
import StatusBadge from "../components/ui/StatusBadge";
import { Table } from "../components/ui/Table";
import { useToast } from "../contexts/ToastContext";

const SERVICE_TYPES = [
    "General Service",
    "Oil Change",
    "Brake Repair",
    "Engine Diagnostics",
    "Tire Replacement",
    "Battery Replacement",
    "AC Service",
    "Body Work"
];

const EMPTY_FORM = {
    vehicle: "",
    serviceType: "",
    description: ""
};

function ServiceRequests() {
    const toast = useToast();

    const [vehicles, setVehicles] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const [vehiclesRes, requestsRes] = await Promise.all([
                api.get("/vehicles/my-vehicles"),
                api.get("/service-requests/my-requests")
            ]);

            const loadedVehicles = vehiclesRes.data.vehicles || [];
            setVehicles(loadedVehicles);
            setRequests(requestsRes.data.requests || []);

            setForm((current) => ({
                ...current,
                vehicle: current.vehicle || loadedVehicles[0]?._id || ""
            }));
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    "Unable to load your service requests."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        load();
    }, [load]);

    const update = (key) => (event) =>
        setForm((current) => ({ ...current, [key]: event.target.value }));

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");

        if (!form.vehicle) {
            setError("Please register a vehicle before creating a request.");
            return;
        }

        if (!form.serviceType || !form.description.trim()) {
            setError("Please choose a service type and add a description.");
            return;
        }

        setSaving(true);

        try {
            await api.post("/service-requests", {
                vehicle: form.vehicle,
                serviceType: form.serviceType,
                description: form.description.trim()
            });

            toast.success("Service request created successfully.");
            setForm({
                vehicle: form.vehicle,
                serviceType: "",
                description: ""
            });
            await load();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    err.response?.data?.errors?.[0] ||
                    "Unable to create the service request."
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="page">
            <div className="page-head">
                <div>
                    <h1 className="page-title">Service Requests</h1>
                    <p className="page-subtitle">
                        Request a service for one of your vehicles.
                    </p>
                </div>
            </div>

            <Alert type="error">{error}</Alert>

            <Card title="New Service Request">
                {vehicles.length === 0 && !loading ? (
                    <EmptyState
                        title="No vehicles available"
                        message="Register a vehicle first before creating a service request."
                    />
                ) : (
                    <form onSubmit={handleSubmit} className="form-grid">
                        <Field label="Vehicle" htmlFor="sr-vehicle">
                            <Select
                                id="sr-vehicle"
                                value={form.vehicle}
                                onChange={update("vehicle")}
                            >
                                <option value="">Select a vehicle</option>
                                {vehicles.map((vehicle) => (
                                    <option
                                        key={vehicle._id}
                                        value={vehicle._id}
                                    >
                                        {vehicle.vehicleNumber} —{" "}
                                        {vehicle.company} {vehicle.model}
                                    </option>
                                ))}
                            </Select>
                        </Field>

                        <Field label="Service Type" htmlFor="sr-type">
                            <Select
                                id="sr-type"
                                value={form.serviceType}
                                onChange={update("serviceType")}
                            >
                                <option value="">Select a service</option>
                                {SERVICE_TYPES.map((type) => (
                                    <option key={type} value={type}>
                                        {type}
                                    </option>
                                ))}
                            </Select>
                        </Field>

                        <Field
                            label="Description"
                            htmlFor="sr-description"
                            className="span-2"
                        >
                            <Textarea
                                id="sr-description"
                                rows={3}
                                placeholder="Describe the issue you are experiencing"
                                value={form.description}
                                onChange={update("description")}
                            />
                        </Field>

                        <div className="form-actions">
                            <Button type="submit" loading={saving}>
                                Submit request
                            </Button>
                        </div>
                    </form>
                )}
            </Card>

            <Card title="My Requests">
                {loading ? (
                    <Spinner />
                ) : requests.length === 0 ? (
                    <EmptyState
                        title="No requests yet"
                        message="Your service requests will appear here."
                    />
                ) : (
                    <Table
                        columns={[
                            "Service",
                            "Vehicle",
                            "Status",
                            "Mechanic",
                            "Created"
                        ]}
                    >
                        {requests.map((request) => (
                            <tr key={request._id}>
                                <td>
                                    <span className="list-title">
                                        {request.serviceType}
                                    </span>
                                    <span className="list-meta block">
                                        {request.description}
                                    </span>
                                </td>
                                <td>
                                    {request.vehicle?.vehicleNumber || "—"}
                                </td>
                                <td>
                                    <StatusBadge status={request.status} />
                                </td>
                                <td>
                                    {request.mechanic?.name || (
                                        <span className="muted">
                                            Not assigned
                                        </span>
                                    )}
                                </td>
                                <td>
                                    {new Date(
                                        request.createdAt
                                    ).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </Table>
                )}
            </Card>
        </div>
    );
}

export default ServiceRequests;
