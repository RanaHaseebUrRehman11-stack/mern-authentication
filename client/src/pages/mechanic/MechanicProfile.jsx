import { useEffect, useState } from "react";
import api from "../../services/api";
import { Card } from "../../components/ui/Card";
import { Field, Input, Select } from "../../components/ui/Field";
import Button from "../../components/ui/Button";
import { Spinner, Alert } from "../../components/ui/Feedback";
import { useToast } from "../../contexts/ToastContext";

const AVAILABILITY = ["Available", "Busy"];

function MechanicProfile() {
    const toast = useToast();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [phone, setPhone] = useState("");
    const [status, setStatus] = useState("Available");
    const [savingProfile, setSavingProfile] = useState(false);

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [savingPassword, setSavingPassword] = useState(false);

    useEffect(() => {
        let active = true;

        const load = async () => {
            try {
                const { data } = await api.get("/mechanic/profile");
                if (!active) return;

                setProfile(data);
                setPhone(data.mechanic?.phone || "");
                setStatus(data.mechanic?.status || "Available");
            } catch (err) {
                if (!active) return;
                setError(
                    err.response?.data?.message ||
                        "Unable to load your profile."
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

    const saveProfile = async (event) => {
        event.preventDefault();
        setSavingProfile(true);

        try {
            const { data } = await api.put("/mechanic/profile", {
                phone,
                status
            });

            setProfile((prev) => ({ ...prev, mechanic: data.mechanic }));
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

    if (loading) {
        return (
            <div className="page">
                <Spinner />
            </div>
        );
    }

    return (
        <div className="page">
            <div className="page-head">
                <div>
                    <h1 className="page-title">My Profile</h1>
                    <p className="page-subtitle">
                        Manage your contact details and availability.
                    </p>
                </div>
            </div>

            <Alert type="error">{error}</Alert>

            {profile && (
                <div className="grid-2">
                    <Card title="Account">
                        <dl className="detail-list">
                            <div>
                                <dt>Name</dt>
                                <dd>{profile.mechanic?.name}</dd>
                            </div>
                            <div>
                                <dt>Username</dt>
                                <dd>{profile.username}</dd>
                            </div>
                            <div>
                                <dt>Email</dt>
                                <dd>{profile.email}</dd>
                            </div>
                            <div>
                                <dt>Specialization</dt>
                                <dd>{profile.mechanic?.specialization}</dd>
                            </div>
                            <div>
                                <dt>Experience</dt>
                                <dd>
                                    {profile.mechanic?.experience} year
                                    {profile.mechanic?.experience === 1
                                        ? ""
                                        : "s"}
                                </dd>
                            </div>
                        </dl>
                    </Card>

                    <Card title="Contact & Availability">
                        <form className="form" onSubmit={saveProfile}>
                            <Field label="Phone" htmlFor="mechanic-phone">
                                <Input
                                    id="mechanic-phone"
                                    value={phone}
                                    onChange={(event) =>
                                        setPhone(event.target.value)
                                    }
                                />
                            </Field>
                            <Field
                                label="Availability"
                                htmlFor="mechanic-status"
                            >
                                <Select
                                    id="mechanic-status"
                                    value={status}
                                    onChange={(event) =>
                                        setStatus(event.target.value)
                                    }
                                >
                                    {AVAILABILITY.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </Select>
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
                                htmlFor="current-password"
                            >
                                <Input
                                    id="current-password"
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
                                htmlFor="new-password"
                                hint="At least 6 characters."
                            >
                                <Input
                                    id="new-password"
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
            )}
        </div>
    );
}

export default MechanicProfile;
