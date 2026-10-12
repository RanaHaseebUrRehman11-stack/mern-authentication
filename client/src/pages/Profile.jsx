import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import { Card } from "../components/ui/Card";
import { Field, Input } from "../components/ui/Field";
import Button from "../components/ui/Button";
import { EmptyState } from "../components/ui/Feedback";
import { useToast } from "../contexts/ToastContext";
import "../styles/auth.css";

function Profile() {
    const { user, isAdmin, refreshUser } = useAuth();
    const toast = useToast();

    const [username, setUsername] = useState(user?.username || "");
    const [savingProfile, setSavingProfile] = useState(false);

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [savingPassword, setSavingPassword] = useState(false);

    if (!user) {
        return (
            <EmptyState
                title="Not signed in"
                message="Please log in to view your profile."
            />
        );
    }

    const saveProfile = async (event) => {
        event.preventDefault();
        setSavingProfile(true);

        try {
            await api.put("/auth/profile", { username });
            await refreshUser();
            toast.success("Profile updated.");
        } catch (err) {
            toast.error(
                err.response?.data?.message || "Unable to update profile."
            );
        } finally {
            setSavingProfile(false);
        }
    };

    const savePassword = async (event) => {
        event.preventDefault();
        setSavingPassword(true);

        try {
            await api.put("/auth/profile", { currentPassword, newPassword });
            setCurrentPassword("");
            setNewPassword("");
            toast.success("Password changed.");
        } catch (err) {
            toast.error(
                err.response?.data?.message || "Unable to change password."
            );
        } finally {
            setSavingPassword(false);
        }
    };

    return (
        <div className="page">
            <div className="page-head">
                <div>
                    <h1 className="page-title">My Profile</h1>
                    <p className="page-subtitle">
                        Manage your account details.
                    </p>
                </div>
            </div>

            <Card title="Account">
                <div className="profile-row">
                    <div className="profile-avatar">
                        {user.username?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h2 className="profile-name">{user.username}</h2>
                        <p className="profile-email">{user.email}</p>
                    </div>
                </div>

                <dl className="detail-list">
                    <div>
                        <dt>Role</dt>
                        <dd>{isAdmin ? "Administrator" : "User"}</dd>
                    </div>
                    <div>
                        <dt>Account ID</dt>
                        <dd className="mono">{user._id || user.id}</dd>
                    </div>
                </dl>
            </Card>

            <div className="grid-2">
                <Card title="Edit Profile">
                    <form className="form" onSubmit={saveProfile}>
                        <Field label="Username" htmlFor="profile-username">
                            <Input
                                id="profile-username"
                                value={username}
                                onChange={(event) =>
                                    setUsername(event.target.value)
                                }
                                required
                            />
                        </Field>
                        <Button type="submit" loading={savingProfile}>
                            Save Changes
                        </Button>
                    </form>
                </Card>

                <Card title="Change Password">
                    <form className="form" onSubmit={savePassword}>
                        <Field
                            label="Current Password"
                            htmlFor="profile-current-password"
                        >
                            <Input
                                id="profile-current-password"
                                type="password"
                                autoComplete="current-password"
                                value={currentPassword}
                                onChange={(event) =>
                                    setCurrentPassword(event.target.value)
                                }
                                required
                            />
                        </Field>
                        <Field
                            label="New Password"
                            htmlFor="profile-new-password"
                            hint="At least 6 characters."
                        >
                            <Input
                                id="profile-new-password"
                                type="password"
                                autoComplete="new-password"
                                value={newPassword}
                                onChange={(event) =>
                                    setNewPassword(event.target.value)
                                }
                                required
                            />
                        </Field>
                        <Button
                            type="submit"
                            variant="secondary"
                            loading={savingPassword}
                        >
                            Change Password
                        </Button>
                    </form>
                </Card>
            </div>
        </div>
    );
}

export default Profile;
