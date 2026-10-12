import { Link } from "react-router-dom";

function Landing() {
    return (
        <div className="landing">
            <header className="landing-hero">
                <h1 className="landing-title">Vehicle Service Management</h1>
                <p className="landing-subtitle">
                    Choose the account type you want to continue with. Each
                    account has its own secure sign-in and dashboard.
                </p>
            </header>

            <section
                className="role-grid"
                aria-label="Account options"
            >
                <article className="role-card role-card-owner">
                    <div className="role-icon" aria-hidden="true">
                        &#128663;
                    </div>
                    <h2 className="role-title">Vehicle Owner</h2>
                    <p className="role-desc">
                        Register your vehicles, request service and follow your
                        service history from request to completion.
                    </p>
                    <ul className="role-points">
                        <li>Manage your own vehicles</li>
                        <li>Create and track service requests</li>
                        <li>View completed service history</li>
                    </ul>
                    <div className="role-actions">
                        <Link to="/login" className="btn btn-primary btn-md">
                            Login
                        </Link>
                        <Link to="/register" className="btn btn-secondary btn-md">
                            Register
                        </Link>
                    </div>
                </article>

                <article className="role-card role-card-mechanic">
                    <div className="role-icon" aria-hidden="true">
                        &#128295;
                    </div>
                    <h2 className="role-title">Mechanic</h2>
                    <p className="role-desc">
                        Sign in to see the jobs assigned to you and move each
                        job through its service lifecycle.
                    </p>
                    <ul className="role-points">
                        <li>View only your assigned jobs</li>
                        <li>Update job progress and completion</li>
                    </ul>
                    <p className="role-note">
                        Register to request a mechanic account. An
                        administrator must approve it before you can sign in.
                    </p>
                    <div className="role-actions">
                        <Link
                            to="/login/mechanic"
                            className="btn btn-primary btn-md"
                        >
                            Mechanic Login
                        </Link>
                        <Link
                            to="/register/mechanic"
                            className="btn btn-secondary btn-md"
                        >
                            Register as Mechanic
                        </Link>
                    </div>
                </article>

                <article className="role-card role-card-admin">
                    <div className="role-icon" aria-hidden="true">
                        &#128737;
                    </div>
                    <h2 className="role-title">Administrator</h2>
                    <p className="role-desc">
                        Manage users and mechanics, assign service requests and
                        view platform-wide analytics.
                    </p>
                    <ul className="role-points">
                        <li>Users and mechanic management</li>
                        <li>Service request assignment</li>
                        <li>Platform dashboard analytics</li>
                    </ul>
                    <p className="role-note">
                        Administrator accounts are provisioned by the system
                        operator. Self-registration requires the administrator
                        registration secret.
                    </p>
                    <div className="role-actions">
                        <Link
                            to="/login/admin"
                            className="btn btn-secondary btn-md"
                        >
                            Admin Login
                        </Link>
                        <Link
                            to="/register/admin"
                            className="btn btn-secondary btn-md"
                        >
                            Register as Admin
                        </Link>
                    </div>
                </article>
            </section>
        </div>
    );
}

export default Landing;
