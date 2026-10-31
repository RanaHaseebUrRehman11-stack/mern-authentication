import { useState } from "react";
import { KeyRound, Mail, Save, ShieldCheck, UserRound } from "lucide-react";

import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import { Card } from "../components/ui/Card";
import PageHeader from "../components/ui/PageHeader";
import { Field, Input } from "../components/ui/Field";
import Button from "../components/ui/Button";
import { EmptyState } from "../components/ui/Feedback";
import { useToast } from "../contexts/ToastContext";
import { roleLabel } from "../utils/roles";
import "../styles/auth.css";

function Profile() {
    const { user, refreshUser } = useAuth();
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
                icon={UserRound}
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
            <PageHeader
                eyebrow="Account"
                title="My Profile"
                subtitle="Manage your account details and security."
            />

            <Card className="profile-hero" bodyClassName="profile-hero-body">
                <div className="profile-row">
                    <div className="profile-avatar">
                        {user.username?.charAt(0).toUpperCase()}
                    </div>
                    <div className="profile-identity">
                        <h2 className="profile-name">{user.username}</h2>
                        <p className="profile-email">
                            <Mail size={14} strokeWidth={2} aria-hidden="true" />
                            {user.email}
                        </p>
                    </div>
                    <span className="role-badge">
                        <ShieldCheck
                            size={14}
                            strokeWidth={2}
                            aria-hidden="true"
                        />
                        {roleLabel(user.role)}
                    </span>
                </div>

                <dl className="detail-list detail-list-inline">
                    <div>
                        <dt>Role</dt>
                        <dd>{roleLabel(user.role)}</dd>
                    </div>
                    <div>
                        <dt>Account ID</dt>
                        <dd className="mono">{user._id || user.id}</dd>
                    </div>
                </dl>
            </Card>

            <div className="grid-2">
                <Card
                    title="Edit Profile"
                    subtitle="Update your display name"
                    icon={UserRound}
                >
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
                            <Save
                                size={15}
                                strokeWidth={2}
                                aria-hidden="true"
                            />
                            Save Changes
                        </Button>
                    </form>
                </Card>

                <Card
                    title="Change Password"
                    subtitle="Keep your workspace secure"
                    icon={KeyRound}
                >
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
