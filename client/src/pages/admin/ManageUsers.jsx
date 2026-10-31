import { useCallback, useEffect, useState } from "react";
import { ShieldCheck, Trash2, Users } from "lucide-react";

import api from "../../services/api";
import { Card } from "../../components/ui/Card";
import PageHeader from "../../components/ui/PageHeader";
import { Spinner, Alert, EmptyState } from "../../components/ui/Feedback";
import Button from "../../components/ui/Button";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { Table } from "../../components/ui/Table";
import { useToast } from "../../contexts/ToastContext";

function ManageUsers() {
    const toast = useToast();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const loadUsers = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const { data } = await api.get("/admin/users");
            setUsers(data.users || []);
        } catch (err) {
            setError(
                err.response?.data?.message || "Unable to load users."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadUsers();
    }, [loadUsers]);

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);

        try {
            await api.delete(`/admin/users/${deleteTarget._id}`);
            toast.success("User deleted successfully.");
            setDeleteTarget(null);
            await loadUsers();
        } catch (err) {
            toast.error(
                err.response?.data?.message || "Unable to delete the user."
            );
        } finally {
            setDeleting(false);
        }
    };

    const ownerCount = users.filter((user) => user.role === "user").length;

    return (
        <div className="page">
            <PageHeader
                eyebrow="Accounts"
                title="User Management"
                subtitle="View and manage registered customers."
                actions={
                    <span className="header-chip">
                        <Users size={15} strokeWidth={2} aria-hidden="true" />
                        {users.length} accounts
                    </span>
                }
            />

            <Alert type="error">{error}</Alert>

            <Card
                title="All Accounts"
                subtitle={`${ownerCount} vehicle owner${
                    ownerCount === 1 ? "" : "s"
                } and protected system accounts`}
                icon={Users}
            >
                {loading ? (
                    <Spinner />
                ) : users.length === 0 ? (
                    <EmptyState
                        title="No users found"
                        message="Registered users will appear here."
                        icon={Users}
                    />
                ) : (
                    <Table columns={["Username", "Email", "Role", "Joined", "Actions"]}>
                        {users.map((user) => (
                            <tr key={user._id}>
                                <td>
                                    <div className="table-primary">
                                        <span className="avatar avatar-xs">
                                            {user.username
                                                ?.charAt(0)
                                                .toUpperCase()}
                                        </span>
                                        <span className="list-title">
                                            {user.username}
                                        </span>
                                    </div>
                                </td>
                                <td>{user.email}</td>
                                <td>
                                    <span
                                        className={`role-badge ${
                                            user.role !== "user"
                                                ? "role-badge-protected"
                                                : ""
                                        }`}
                                    >
                                        {user.role !== "user" && (
                                            <ShieldCheck
                                                size={13}
                                                strokeWidth={2}
                                                aria-hidden="true"
                                            />
                                        )}
                                        <span className="capitalize">
                                            {user.role}
                                        </span>
                                    </span>
                                </td>
                                <td>
                                    {new Date(
                                        user.createdAt
                                    ).toLocaleDateString()}
                                </td>
                                <td>
                                    {user.role === "user" ? (
                                        <Button
                                            size="sm"
                                            variant="danger"
                                            onClick={() =>
                                                setDeleteTarget(user)
                                            }
                                        >
                                            <Trash2
                                                size={13}
                                                strokeWidth={2}
                                                aria-hidden="true"
                                            />
                                            Delete
                                        </Button>
                                    ) : (
                                        <span className="muted">
                                            Protected
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </Table>
                )}
            </Card>

            <ConfirmDialog
                open={Boolean(deleteTarget)}
                title="Delete user?"
                message={
                    deleteTarget
                        ? `${deleteTarget.username} (${deleteTarget.email}) will no longer be able to sign in. Their vehicles and service records are preserved.`
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

export default ManageUsers;
