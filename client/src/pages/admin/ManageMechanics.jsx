import { useCallback, useEffect, useState } from "react";
import api from "../../services/api";
import { Card } from "../../components/ui/Card";
import { Field, Input, Select } from "../../components/ui/Field";
import Button from "../../components/ui/Button";
import { Spinner, Alert, EmptyState } from "../../components/ui/Feedback";
import StatusBadge from "../../components/ui/StatusBadge";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { Table } from "../../components/ui/Table";
import { useToast } from "../../contexts/ToastContext";

const EMPTY_FORM = {
    name: "",
    email: "",
    phone: "",
    specialization: "",
    experience: "",
    status: "Available",
    password: "",
    confirmPassword: ""
};

const STATUSES = ["Available", "Busy", "Inactive"];

function ManageMechanics() {
    const toast = useToast();

    const [mechanics, setMechanics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [form, setForm] = useState(EMPTY_FORM);
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [accountTarget, setAccountTarget] = useState(null);
    const [accountPassword, setAccountPassword] = useState("");
    const [accountConfirm, setAccountConfirm] = useState("");
    const [creatingAccount, setCreatingAccount] = useState(false);
    const [approvalBusyId, setApprovalBusyId] = useState(null);

    const loadMechanics = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const { data } = await api.get("/admin/mechanics");
            setMechanics(data.mechanics || []);
        } catch (err) {
            setError(
                err.response?.data?.message || "Unable to load mechanics."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadMechanics();
    }, [loadMechanics]);

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
            name: form.name.trim(),
            email: form.email.trim(),
            phone: form.phone.trim(),
            specialization: form.specialization.trim(),
            experience: Number(form.experience),
            status: form.status
        };

        if (
            !payload.name ||
            !payload.email ||
            !payload.phone ||
            !payload.specialization ||
            !Number.isFinite(payload.experience)
        ) {
            setError("Please fill in all fields with valid values.");
            return;
        }

        if (!editingId && form.password) {
            if (form.password.length < 6) {
                setError("Password must be at least 6 characters.");
                return;
            }

            if (form.password !== form.confirmPassword) {
                setError("Passwords do not match.");
                return;
            }

            payload.password = form.password;
        }

        setSaving(true);

        try {
            if (editingId) {
                await api.put(`/admin/mechanics/${editingId}`, payload);
                toast.success("Mechanic updated successfully.");
            } else {
                const { data } = await api.post("/admin/mechanics", payload);
                toast.success(
                    data.accountCreated
                        ? "Mechanic added with a login account."
                        : "Mechanic created successfully."
                );
            }

            resetForm();
            await loadMechanics();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    err.response?.data?.errors?.[0] ||
                    "Unable to save the mechanic."
            );
        } finally {
            setSaving(false);
        }
    };

    const startEdit = (mechanic) => {
        setEditingId(mechanic._id);
        setForm({
            name: mechanic.name || "",
            email: mechanic.email || "",
            phone: mechanic.phone || "",
            specialization: mechanic.specialization || "",
            experience: mechanic.experience ?? "",
            status: mechanic.status || "Available"
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);

        try {
            await api.delete(`/admin/mechanics/${deleteTarget._id}`);
            toast.success("Mechanic deleted successfully.");
            setDeleteTarget(null);
            await loadMechanics();
        } catch (err) {
            toast.error(
                err.response?.data?.message ||
                    "Unable to delete the mechanic."
            );
        } finally {
            setDeleting(false);
        }
    };

    const openAccountDialog = (mechanic) => {
        setAccountTarget(mechanic);
        setAccountPassword("");
        setAccountConfirm("");
    };

    const createAccount = async (event) => {
        event.preventDefault();

        if (!accountTarget) return;

        if (accountPassword.length < 6) {
            toast.error("Password must be at least 6 characters.");
            return;
        }

        if (accountPassword !== accountConfirm) {
            toast.error("Passwords do not match.");
            return;
        }

        setCreatingAccount(true);

        try {
            await api.post(`/admin/mechanics/${accountTarget._id}/account`, {
                password: accountPassword
            });

            toast.success("Login account created.");
            setAccountTarget(null);
            await loadMechanics();
        } catch (err) {
            toast.error(
                err.response?.data?.message ||
                    "Unable to create the login account."
            );
        } finally {
            setCreatingAccount(false);
        }
    };

    const setApproval = async (mechanic, approvalStatus) => {
        setApprovalBusyId(mechanic._id);

        try {
            await api.put(`/admin/mechanics/${mechanic._id}/approval`, {
                approvalStatus
            });

            toast.success(`Mechanic ${approvalStatus.toLowerCase()}.`);
            await loadMechanics();
        } catch (err) {
            toast.error(
                err.response?.data?.message ||
                    "Unable to update the approval status."
            );
        } finally {
            setApprovalBusyId(null);
        }
    };

    return (
        <div className="page">
            <div className="page-head">
                <div>
                    <h1 className="page-title">Mechanic Management</h1>
                    <p className="page-subtitle">
                        Add and manage the mechanics available for assignment.
                    </p>
                </div>
            </div>

            <Alert type="error">{error}</Alert>

            <Card title={editingId ? "Edit Mechanic" : "Add Mechanic"}>
                <form onSubmit={handleSubmit} className="form-grid">
                    <Field label="Name" htmlFor="m-name">
                        <Input
                            id="m-name"
                            value={form.name}
                            onChange={update("name")}
                            placeholder="Full name"
                        />
                    </Field>

                    <Field label="Email" htmlFor="m-email">
                        <Input
                            id="m-email"
                            type="email"
                            value={form.email}
                            onChange={update("email")}
                            placeholder="name@example.com"
                        />
                    </Field>

                    <Field label="Phone" htmlFor="m-phone">
                        <Input
                            id="m-phone"
                            value={form.phone}
                            onChange={update("phone")}
                            placeholder="Contact number"
                        />
                    </Field>

                    <Field label="Specialization" htmlFor="m-specialization">
                        <Input
                            id="m-specialization"
                            value={form.specialization}
                            onChange={update("specialization")}
                            placeholder="e.g. Engine, Brakes"
                        />
                    </Field>

                    <Field label="Experience (years)" htmlFor="m-experience">
                        <Input
                            id="m-experience"
                            type="number"
                            min="0"
                            value={form.experience}
                            onChange={update("experience")}
                            placeholder="e.g. 5"
                        />
                    </Field>

                    <Field label="Status" htmlFor="m-status">
                        <Select
                            id="m-status"
                            value={form.status}
                            onChange={update("status")}
                        >
                            {STATUSES.map((status) => (
                                <option key={status} value={status}>
                                    {status}
                                </option>
                            ))}
                        </Select>
                    </Field>

                    {!editingId && (
                        <>
                            <Field
                                label="Login Password (optional)"
                                htmlFor="m-password"
                                hint="Set to also create a mechanic login account."
                            >
                                <Input
                                    id="m-password"
                                    type="password"
                                    autoComplete="new-password"
                                    value={form.password}
                                    onChange={update("password")}
                                    placeholder="At least 6 characters"
                                />
                            </Field>

                            {form.password && (
                                <Field
                                    label="Confirm Password"
                                    htmlFor="m-confirm-password"
                                >
                                    <Input
                                        id="m-confirm-password"
                                        type="password"
                                        autoComplete="new-password"
                                        value={form.confirmPassword}
                                        onChange={update("confirmPassword")}
                                    />
                                </Field>
                            )}
                        </>
                    )}

                    <div className="form-actions">
                        <Button type="submit" loading={saving}>
                            {editingId ? "Save changes" : "Add mechanic"}
                        </Button>
                        {editingId && (
                            <Button variant="ghost" onClick={resetForm}>
                                Cancel
                            </Button>
                        )}
                    </div>
                </form>
            </Card>

            <Card title="Mechanics">
                {loading ? (
                    <Spinner />
                ) : mechanics.length === 0 ? (
                    <EmptyState
                        title="No mechanics yet"
                        message="Add your first mechanic using the form above."
                    />
                ) : (
                    <Table
                        columns={[
                            "Name",
                            "Email",
                            "Phone",
                            "Specialization",
                            "Experience",
                            "Status",
                            "Approval",
                            "Login",
                            "Actions"
                        ]}
                    >
                        {mechanics.map((mechanic) => (
                            <tr key={mechanic._id}>
                                <td>{mechanic.name}</td>
                                <td>{mechanic.email}</td>
                                <td>{mechanic.phone}</td>
                                <td>{mechanic.specialization}</td>
                                <td>{mechanic.experience} yrs</td>
                                <td>
                                    <StatusBadge status={mechanic.status} />
                                </td>
                                <td>
                                    <StatusBadge
                                        status={
                                            mechanic.approvalStatus ||
                                            "Approved"
                                        }
                                    />
                                </td>
                                <td>
                                    {mechanic.user ? (
                                        <span className="badge badge-completed">
                                            Linked
                                        </span>
                                    ) : (
                                        <span className="muted">None</span>
                                    )}
                                </td>
                                <td>
                                    <div className="row-actions">
                                        {(mechanic.approvalStatus ||
                                            "Approved") !== "Approved" && (
                                            <Button
                                                size="sm"
                                                variant="primary"
                                                loading={
                                                    approvalBusyId ===
                                                    mechanic._id
                                                }
                                                onClick={() =>
                                                    setApproval(
                                                        mechanic,
                                                        "Approved"
                                                    )
                                                }
                                            >
                                                Approve
                                            </Button>
                                        )}
                                        {(mechanic.approvalStatus ||
                                            "Approved") !== "Rejected" && (
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                loading={
                                                    approvalBusyId ===
                                                    mechanic._id
                                                }
                                                onClick={() =>
                                                    setApproval(
                                                        mechanic,
                                                        "Rejected"
                                                    )
                                                }
                                            >
                                                Reject
                                            </Button>
                                        )}
                                        {!mechanic.user && (
                                            <Button
                                                size="sm"
                                                variant="primary"
                                                onClick={() =>
                                                    openAccountDialog(mechanic)
                                                }
                                            >
                                                Create Login
                                            </Button>
                                        )}
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            onClick={() => startEdit(mechanic)}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="danger"
                                            onClick={() =>
                                                setDeleteTarget(mechanic)
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
                title="Delete mechanic?"
                message={
                    deleteTarget
                        ? `${deleteTarget.name} will be removed from the list of mechanics.`
                        : ""
                }
                confirmLabel="Delete"
                loading={deleting}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteTarget(null)}
            />

            {accountTarget && (
                <div
                    className="modal-backdrop"
                    onClick={
                        creatingAccount
                            ? undefined
                            : () => setAccountTarget(null)
                    }
                >
                    <div
                        className="modal"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Create login account"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <h3 className="modal-title">Create Login Account</h3>
                        <p className="modal-message">
                            Set a password for {accountTarget.name} (
                            {accountTarget.email}).
                        </p>

                        <form className="form" onSubmit={createAccount}>
                            <Field
                                label="Password"
                                htmlFor="account-password"
                            >
                                <Input
                                    id="account-password"
                                    type="password"
                                    autoComplete="new-password"
                                    value={accountPassword}
                                    onChange={(event) =>
                                        setAccountPassword(event.target.value)
                                    }
                                    required
                                />
                            </Field>
                            <Field
                                label="Confirm Password"
                                htmlFor="account-confirm"
                            >
                                <Input
                                    id="account-confirm"
                                    type="password"
                                    autoComplete="new-password"
                                    value={accountConfirm}
                                    onChange={(event) =>
                                        setAccountConfirm(event.target.value)
                                    }
                                    required
                                />
                            </Field>

                            <div className="modal-actions">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setAccountTarget(null)}
                                    disabled={creatingAccount}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    loading={creatingAccount}
                                >
                                    Create Account
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ManageMechanics;
