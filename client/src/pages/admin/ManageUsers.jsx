import { useCallback, useEffect, useState } from "react";
import api from "../../services/api";
import { Card } from "../../components/ui/Card";
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

    return (
        <div className="page">
            <div className="page-head">
                <div>
                    <h1 className="page-title">User Management</h1>
                    <p className="page-subtitle">
                        View and manage registered customers.
                    </p>
                </div>
            </div>

            <Alert type="error">{error}</Alert>

            <Card>
                {loading ? (
                    <Spinner />
                ) : users.length === 0 ? (
                    <EmptyState
                        title="No users found"
                        message="Registered users will appear here."
                    />
                ) : (
                    <Table columns={["Username", "Email", "Role", "Joined", "Actions"]}>
                        {users.map((user) => (
                            <tr key={user._id}>
                                <td>{user.username}</td>
                                <td>{user.email}</td>
                                <td className="capitalize">{user.role}</td>
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
