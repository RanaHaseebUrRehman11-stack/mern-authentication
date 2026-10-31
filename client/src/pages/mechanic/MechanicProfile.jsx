import { useEffect, useState } from "react";
import {
    BadgeCheck,
    BriefcaseBusiness,
    KeyRound,
    Mail,
    Phone,
    Save,
    Wrench
} from "lucide-react";

import api from "../../services/api";
import { Card } from "../../components/ui/Card";
import PageHeader from "../../components/ui/PageHeader";
import { Field, Input, Select } from "../../components/ui/Field";
import Button from "../../components/ui/Button";
import { Spinner, Alert } from "../../components/ui/Feedback";
import StatusBadge from "../../components/ui/StatusBadge";
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
            <PageHeader
                eyebrow="Account"
                title="My Profile"
                subtitle="Manage your contact details and availability."
            />

            <Alert type="error">{error}</Alert>

            {profile && (
                <>
                    <Card className="profile-hero" bodyClassName="profile-hero-body">
                        <div className="profile-row">
                            <div className="profile-avatar">
                                {profile.mechanic?.name
                                    ?.charAt(0)
                                    .toUpperCase() || "M"}
                            </div>
                            <div className="profile-identity">
                                <h2 className="profile-name">
                                    {profile.mechanic?.name}
                                </h2>
                                <p className="profile-email">
                                    <Mail
                                        size={14}
                                        strokeWidth={2}
                                        aria-hidden="true"
                                    />
                                    {profile.email}
                                </p>
                            </div>
                            <div className="profile-badges">
                                <StatusBadge
                                    status={
                                        profile.mechanic?.status || "Available"
                                    }
                                />
                                <span className="role-badge">
                                    <BadgeCheck
                                        size={14}
                                        strokeWidth={2}
                                        aria-hidden="true"
                                    />
                                    Approved workshop
                                </span>
                            </div>
                        </div>
                    </Card>

                    <div className="grid-2">
                        <Card
                            title="Credentials"
                            subtitle="Your workshop profile"
                            icon={Wrench}
                        >
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
                                    <dd>
                                        {profile.mechanic?.specialization}
                                    </dd>
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

                        <Card
                            title="Contact & Availability"
                            subtitle="Let operations know how to reach you"
                            icon={Phone}
                        >
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
                                            <option
                                                key={option}
                                                value={option}
                                            >
                                                {option}
                                            </option>
                                        ))}
                                    </Select>
                                </Field>
                                <Button
                                    type="submit"
                                    loading={savingProfile}
                                >
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
                            subtitle="Keep your account secure"
                            icon={KeyRound}
                        >
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
                                            setCurrentPassword(
                                                event.target.value
                                            )
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

                        <Card
                            title="Workshop Snapshot"
                            subtitle="At a glance"
                            icon={BriefcaseBusiness}
                        >
                            <div className="snapshot-grid">
                                <div className="snapshot-item">
                                    <span>Specialization</span>
                                    <strong>
                                        {profile.mechanic?.specialization ||
                                            "—"}
                                    </strong>
                                </div>
                                <div className="snapshot-item">
                                    <span>Experience</span>
                                    <strong>
                                        {profile.mechanic?.experience ?? 0} yrs
                                    </strong>
                                </div>
                                <div className="snapshot-item">
                                    <span>Availability</span>
                                    <strong>
                                        {profile.mechanic?.status || "—"}
                                    </strong>
                                </div>
                                <div className="snapshot-item">
                                    <span>Access</span>
                                    <strong>Approved</strong>
                                </div>
                            </div>
                        </Card>
                    </div>
                </>
            )}
        </div>
    );
}

export default MechanicProfile;
