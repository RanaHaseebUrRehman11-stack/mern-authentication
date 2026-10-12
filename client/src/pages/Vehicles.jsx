import { useCallback, useEffect, useState } from "react";
import api from "../services/api";
import { Card } from "../components/ui/Card";
import { Field, Input, Select } from "../components/ui/Field";
import Button from "../components/ui/Button";
import { Spinner, Alert, EmptyState } from "../components/ui/Feedback";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import { Table } from "../components/ui/Table";
import { useToast } from "../contexts/ToastContext";

const EMPTY_FORM = {
    vehicleNumber: "",
    company: "",
    model: "",
    year: "",
    color: "",
    vehicleType: "Car"
};

const VEHICLE_TYPES = ["Car", "Bike", "Van", "Truck"];

function Vehicles() {
    const toast = useToast();

    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [form, setForm] = useState(EMPTY_FORM);
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const loadVehicles = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const { data } = await api.get("/vehicles/my-vehicles");
            setVehicles(data.vehicles || []);
        } catch (err) {
            setError(
                err.response?.data?.message || "Unable to load your vehicles."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadVehicles();
    }, [loadVehicles]);

    const update = (key) => (event) =>
        setForm((current) => ({ ...current, [key]: event.target.value }));

    const resetForm = () => {
        setForm(EMPTY_FORM);
        setEditingId(null);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");

        const payload = {
            vehicleNumber: form.vehicleNumber.trim(),
            company: form.company.trim(),
            model: form.model.trim(),
            year: Number(form.year),
            color: form.color.trim(),
            vehicleType: form.vehicleType
        };

        if (
            !payload.vehicleNumber ||
            !payload.company ||
            !payload.model ||
            !payload.year ||
            !payload.color
        ) {
            setError("Please fill in all fields.");
            return;
        }

        setSaving(true);

        try {
            if (editingId) {
                await api.put(`/vehicles/${editingId}`, payload);
                toast.success("Vehicle updated successfully.");
            } else {
                await api.post("/vehicles", payload);
                toast.success("Vehicle registered successfully.");
            }

            resetForm();
            await loadVehicles();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    err.response?.data?.errors?.[0] ||
                    "Unable to save the vehicle."
            );
        } finally {
            setSaving(false);
        }
    };

    const startEdit = (vehicle) => {
        setEditingId(vehicle._id);
        setForm({
            vehicleNumber: vehicle.vehicleNumber || "",
            company: vehicle.company || "",
            model: vehicle.model || "",
            year: vehicle.year ?? "",
            color: vehicle.color || "",
            vehicleType: vehicle.vehicleType || "Car"
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);

        try {
            await api.delete(`/vehicles/${deleteTarget._id}`);
            toast.success("Vehicle deleted successfully.");
            setDeleteTarget(null);
            await loadVehicles();
        } catch (err) {
            toast.error(
                err.response?.data?.message || "Unable to delete the vehicle."
            );
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="page">
            <div className="page-head">
                <div>
                    <h1 className="page-title">My Vehicles</h1>
                    <p className="page-subtitle">
                        Register and manage the vehicles on your account.
                    </p>
                </div>
            </div>

            <Alert type="error">{error}</Alert>

            <Card title={editingId ? "Edit Vehicle" : "Register Vehicle"}>
                <form onSubmit={handleSubmit} className="form-grid">
                    <Field label="Vehicle Number" htmlFor="v-number">
                        <Input
                            id="v-number"
                            placeholder="e.g. ABC-1234"
                            value={form.vehicleNumber}
                            onChange={update("vehicleNumber")}
                        />
                    </Field>

                    <Field label="Company" htmlFor="v-company">
                        <Input
                            id="v-company"
                            placeholder="e.g. Toyota"
                            value={form.company}
                            onChange={update("company")}
                        />
                    </Field>

                    <Field label="Model" htmlFor="v-model">
                        <Input
                            id="v-model"
                            placeholder="e.g. Corolla"
                            value={form.model}
                            onChange={update("model")}
                        />
                    </Field>

                    <Field label="Year" htmlFor="v-year">
                        <Input
                            id="v-year"
                            type="number"
                            placeholder="e.g. 2020"
                            value={form.year}
                            onChange={update("year")}
                        />
                    </Field>

                    <Field label="Color" htmlFor="v-color">
                        <Input
                            id="v-color"
                            placeholder="e.g. White"
                            value={form.color}
                            onChange={update("color")}
                        />
                    </Field>

                    <Field label="Type" htmlFor="v-type">
                        <Select
                            id="v-type"
                            value={form.vehicleType}
                            onChange={update("vehicleType")}
                        >
                            {VEHICLE_TYPES.map((type) => (
                                <option key={type} value={type}>
                                    {type}
                                </option>
                            ))}
                        </Select>
                    </Field>

                    <div className="form-actions">
                        <Button type="submit" loading={saving}>
                            {editingId ? "Save changes" : "Register vehicle"}
                        </Button>
                        {editingId && (
                            <Button variant="ghost" onClick={resetForm}>
                                Cancel
                            </Button>
                        )}
                    </div>
                </form>
            </Card>

            <Card title="Registered Vehicles">
                {loading ? (
                    <Spinner />
                ) : vehicles.length === 0 ? (
                    <EmptyState
                        title="No vehicles yet"
                        message="Use the form above to register your first vehicle."
                    />
                ) : (
                    <Table
                        columns={[
                            "Number",
                            "Make / Model",
                            "Year",
                            "Color",
                            "Type",
                            "Actions"
                        ]}
                    >
                        {vehicles.map((vehicle) => (
                            <tr key={vehicle._id}>
                                <td className="mono">{vehicle.vehicleNumber}</td>
                                <td>
                                    {vehicle.company} {vehicle.model}
                                </td>
                                <td>{vehicle.year}</td>
                                <td>{vehicle.color}</td>
                                <td>{vehicle.vehicleType}</td>
                                <td>
                                    <div className="row-actions">
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            onClick={() => startEdit(vehicle)}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="danger"
                                            onClick={() =>
                                                setDeleteTarget(vehicle)
                                            }
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </Table>
                )}
            </Card>

            <ConfirmDialog
                open={Boolean(deleteTarget)}
                title="Delete vehicle?"
                message={
                    deleteTarget
                        ? `This will permanently remove ${deleteTarget.vehicleNumber}.`
                        : ""
                }
                confirmLabel="Delete"
                loading={deleting}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </div>
    );
}

export default Vehicles;
