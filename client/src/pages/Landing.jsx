import { useState } from "react";
import { Link } from "react-router-dom";
import {
    ArrowRight,
    ArrowUpRight,
    BadgeCheck,
    CalendarCheck,
    Car,
    CarFront,
    Check,
    ChevronDown,
    ClipboardCheck,
    ClipboardList,
    Gauge,
    KeyRound,
    LineChart,
    LockKeyhole,
    ShieldCheck,
    Sparkles,
    Timer,
    UserCog,
    Users,
    Wrench
} from "lucide-react";

import Reveal from "../components/ui/Reveal";

const CAPABILITIES = [
    {
        icon: CarFront,
        title: "Vehicle registry",
        text: "Keep every vehicle, plate and service detail organised in one clean, owner-scoped record."
    },
    {
        icon: ClipboardList,
        title: "Service requests",
        text: "Turn a problem into a structured request with the right vehicle, service type and description."
    },
    {
        icon: UserCog,
        title: "Workload assignment",
        text: "Route incoming work to the right workshop professional with clear ownership from day one."
    },
    {
        icon: Timer,
        title: "Job lifecycle",
        text: "Move work through assigned, in progress and completed states with a dependable audit trail."
    },
    {
        icon: LineChart,
        title: "Operations analytics",
        text: "See users, vehicles, requests and approvals in a focused command centre built for decisions."
    },
    {
        icon: LockKeyhole,
        title: "Role-based access",
        text: "Every workspace is scoped to the role it serves, backed by secure session handling."
    }
];

const STEPS = [
    {
        number: "01",
        title: "Create your account",
        text: "Register as a vehicle owner, apply as a workshop professional or provision a control-centre account."
    },
    {
        number: "02",
        title: "Add your vehicle",
        text: "Store the make, model, year, colour and plate so every request arrives with the right context."
    },
    {
        number: "03",
        title: "Request a service",
        text: "Choose a service type and describe the issue. Your request enters a clear, trackable workflow."
    },
    {
        number: "04",
        title: "Track to completion",
        text: "Follow progress from assignment through active work to a completed service history record."
    }
];

const FAQS = [
    {
        question: "How does account approval work?",
        answer:
            "Quite simply. Workshop accounts are reviewed from the control centre before access is granted, while vehicle owners can start as soon as they register."
    },
    {
        question: "Can I track the progress of a service?",
        answer:
            "Yes. Every request has a status that moves from pending, to assigned, to in progress, and finally to completed, so you always know where things stand."
    },
    {
        question: "Is my data separated by role?",
        answer:
            "Each workspace only exposes the information relevant to that role. Owners see their own vehicles and requests, workshop accounts see assigned jobs, and the control centre sees the platform overview."
    },
    {
        question: "What happens to completed services?",
        answer:
            "Completed requests are preserved in a service history view, giving you a permanent record of work carried out on each vehicle."
    }
];

function Landing() {
    const [openFaq, setOpenFaq] = useState(0);

    return (
        <div className="landing">
            <section className="hero">
                <div className="hero-copy">
                    <span className="eyebrow">
                        <Sparkles size={14} strokeWidth={2.2} aria-hidden="true" />
                        Vehicle service operations, reimagined
                    </span>
                    <h1>
                        Run every service.
                        <span> From request to road.</span>
                    </h1>
                    <p className="hero-lede">
                        TorqueDesk brings vehicles, service requests, workshop
                        jobs and platform oversight into one polished operating
                        system for modern automotive teams.
                    </p>
                    <div className="hero-actions">
                        <Link to="/register" className="btn btn-primary btn-lg">
                            Create your account
                            <ArrowRight size={17} strokeWidth={2.2} aria-hidden="true" />
                        </Link>
                        <Link to="/login" className="btn btn-secondary btn-lg">
                            Sign in
                        </Link>
                    </div>
                    <div className="hero-trust">
                        <span>
                            <Check size={14} strokeWidth={2.4} aria-hidden="true" />
                            Role-scoped workspaces
                        </span>
                        <span>
                            <Check size={14} strokeWidth={2.4} aria-hidden="true" />
                            Secure sessions
                        </span>
                        <span>
                            <Check size={14} strokeWidth={2.4} aria-hidden="true" />
                            End-to-end visibility
                        </span>
                    </div>
                </div>

                <div className="hero-visual" aria-label="Service workflow preview">
                    <div className="hero-grid" aria-hidden="true" />
                    <div className="hero-orbit hero-orbit-one" aria-hidden="true" />
                    <div className="hero-orbit hero-orbit-two" aria-hidden="true" />

                    <div className="command-card">
                        <div className="command-head">
                            <div className="window-dots" aria-hidden="true">
                                <span />
                                <span />
                                <span />
                            </div>
                            <span className="command-title">
                                <Gauge size={15} strokeWidth={2} aria-hidden="true" />
                                Service pipeline
                            </span>
                            <span className="live-pill">
                                <span className="status-dot" aria-hidden="true" />
                                Live workflow
                            </span>
                        </div>

                        <div className="pipeline">
                            <div className="pipeline-row">
                                <span className="pipeline-icon">
                                    <Car size={17} strokeWidth={1.9} aria-hidden="true" />
                                </span>
                                <div>
                                    <strong>Vehicle check-in</strong>
                                    <span>Request captured with full context</span>
                                </div>
                                <span className="mini-status done">Ready</span>
                            </div>
                            <div className="pipeline-row">
                                <span className="pipeline-icon">
                                    <Users size={17} strokeWidth={1.9} aria-hidden="true" />
                                </span>
                                <div>
                                    <strong>Workload assignment</strong>
                                    <span>Ownership becomes clear</span>
                                </div>
                                <span className="mini-status active">Assigned</span>
                            </div>
                            <div className="pipeline-row">
                                <span className="pipeline-icon">
                                    <Wrench size={17} strokeWidth={1.9} aria-hidden="true" />
                                </span>
                                <div>
                                    <strong>Service in progress</strong>
                                    <span>Progress stays visible</span>
                                </div>
                                <span className="mini-status progress">Active</span>
                            </div>
                            <div className="pipeline-row">
                                <span className="pipeline-icon">
                                    <ClipboardCheck
                                        size={17}
                                        strokeWidth={1.9}
                                        aria-hidden="true"
                                    />
                                </span>
                                <div>
                                    <strong>Completion record</strong>
                                    <span>History you can trust</span>
                                </div>
                                <span className="mini-status neutral">Queued</span>
                            </div>
                        </div>

                        <div className="command-footer">
                            <span>
                                <BadgeCheck
                                    size={15}
                                    strokeWidth={2}
                                    aria-hidden="true"
                                />
                                One shared source of truth
                            </span>
                            <span className="command-progress" aria-hidden="true">
                                <span />
                            </span>
                        </div>
                    </div>

                    <div className="floating-card floating-card-top">
                        <span className="floating-icon">
                            <ShieldCheck size={16} strokeWidth={2} aria-hidden="true" />
                        </span>
                        <div>
                            <strong>Role-based access</strong>
                            <span>Every view stays in scope</span>
                        </div>
                    </div>

                    <div className="floating-card floating-card-bottom">
                        <span className="floating-icon accent">
                            <CalendarCheck size={16} strokeWidth={2} aria-hidden="true" />
                        </span>
                        <div>
                            <strong>Every job tracked</strong>
                            <span>From request to completion</span>
                        </div>
                    </div>
                </div>
            </section>

            <Reveal className="capability-strip">
                <span>Built for real service workflows</span>
                <div className="capability-chips">
                    <span>Vehicle owners</span>
                    <span>Workshop teams</span>
                    <span>Service managers</span>
                    <span>Platform operators</span>
                </div>
            </Reveal>

            <Reveal as="section" className="landing-section" id="platform">
                <div className="section-heading">
                    <span className="eyebrow">The platform</span>
                    <h2>One platform for the entire service lifecycle</h2>
                    <p>
                        Purpose-built modules that remove the gaps between a
                        vehicle arriving, work being assigned and a service
                        being completed.
                    </p>
                </div>

                <div className="feature-grid">
                    {CAPABILITIES.map((feature, index) => {
                        const Icon = feature.icon;

                        return (
                            <Reveal
                                key={feature.title}
                                delay={index * 60}
                                className="feature-card"
                            >
                                <span className="feature-icon">
                                    <Icon size={21} strokeWidth={1.9} aria-hidden="true" />
                                </span>
                                <h3>{feature.title}</h3>
                                <p>{feature.text}</p>
                            </Reveal>
                        );
                    })}
                </div>
            </Reveal>

            <Reveal as="section" className="landing-section" id="how-it-works">
                <div className="section-heading">
                    <span className="eyebrow">How it works</span>
                    <h2>From request to road, in four steps</h2>
                    <p>
                        A predictable path for every service, with the right
                        information visible to the right people at every stage.
                    </p>
                </div>

                <div className="steps-grid">
                    {STEPS.map((step, index) => (
                        <Reveal
                            key={step.number}
                            delay={index * 70}
                            className="step-card"
                        >
                            <div className="step-top">
                                <span className="step-number">{step.number}</span>
                                <ArrowUpRight
                                    size={17}
                                    className="step-arrow"
                                    aria-hidden="true"
                                />
                            </div>
                            <h3>{step.title}</h3>
                            <p>{step.text}</p>
                        </Reveal>
                    ))}
                </div>

                <Reveal className="workflow-panel">
                    <div className="workflow-copy">
                        <span className="eyebrow">Service workflow</span>
                        <h3>A status every stakeholder can trust</h3>
                        <p>
                            Requests move through a clear lifecycle, so nobody
                            has to ask what happens next.
                        </p>
                    </div>
                    <div className="workflow-track">
                        {[
                            "Pending",
                            "Assigned",
                            "In Progress",
                            "Completed"
                        ].map((status, index) => (
                            <div className="workflow-node" key={status}>
                                <span className="workflow-index">
                                    {index + 1}
                                </span>
                                <span>{status}</span>
                                {index < 3 && (
                                    <span
                                        className="workflow-line"
                                        aria-hidden="true"
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </Reveal>
            </Reveal>

            <Reveal as="section" className="landing-section" id="portals">
                <div className="section-heading">
                    <span className="eyebrow">Workspaces</span>
                    <h2>Choose your workspace</h2>
                    <p>
                        Each account has its own secure sign-in and a focused
                        dashboard designed around what that role needs to do.
                    </p>
                </div>

                <div className="role-grid">
                    <article className="role-card role-card-owner">
                        <div className="role-card-top">
                            <span className="role-icon" aria-hidden="true">
                                <CarFront size={23} strokeWidth={1.9} />
                            </span>
                            <span className="role-tag">Most common</span>
                        </div>
                        <h2 className="role-title">Vehicle Owner</h2>
                        <p className="role-desc">
                            Register your vehicles, request service and follow
                            your service history from request to completion.
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
                            <Link
                                to="/register"
                                className="btn btn-secondary btn-md"
                            >
                                Register
                            </Link>
                        </div>
                    </article>

                    <article className="role-card role-card-mechanic">
                        <div className="role-card-top">
                            <span className="role-icon" aria-hidden="true">
                                <Wrench size={23} strokeWidth={1.9} />
                            </span>
                            <span className="role-tag">Approval required</span>
                        </div>
                        <h2 className="role-title">Mechanic</h2>
                        <p className="role-desc">
                            Sign in to see the jobs assigned to you and move
                            each job through its service lifecycle.
                        </p>
                        <ul className="role-points">
                            <li>View only your assigned jobs</li>
                            <li>Update job progress and completion</li>
                        </ul>
                        <p className="role-note">
                            Register to request a mechanic account. An
                            administrator must approve it before you can sign
                            in.
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
                        <div className="role-card-top">
                            <span className="role-icon" aria-hidden="true">
                                <ShieldCheck size={23} strokeWidth={1.9} />
                            </span>
                            <span className="role-tag">Restricted</span>
                        </div>
                        <h2 className="role-title">Administrator</h2>
                        <p className="role-desc">
                            Manage users and mechanics, assign service
                            requests and view platform-wide analytics.
                        </p>
                        <ul className="role-points">
                            <li>Users and mechanic management</li>
                            <li>Service request assignment</li>
                            <li>Platform dashboard analytics</li>
                        </ul>
                        <p className="role-note">
                            Administrator accounts are provisioned by the
                            system operator. Self-registration requires the
                            administrator registration secret.
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
                </div>
            </Reveal>

            <Reveal as="section" className="landing-section benefits-section">
                <div className="benefits-panel">
                    <div className="benefits-copy">
                        <span className="eyebrow">Why TorqueDesk</span>
                        <h2>A calmer, clearer service day</h2>
                        <p>
                            Replace scattered updates with one dependable
                            operating rhythm. Everyone sees the state of play,
                            and every action has a clear next step.
                        </p>
                        <ul className="benefit-list">
                            <li>
                                <span>
                                    <Check size={15} strokeWidth={2.4} />
                                </span>
                                Structured intake instead of lost details
                            </li>
                            <li>
                                <span>
                                    <Check size={15} strokeWidth={2.4} />
                                </span>
                                Clear ownership from assignment to completion
                            </li>
                            <li>
                                <span>
                                    <Check size={15} strokeWidth={2.4} />
                                </span>
                                A complete service record for every vehicle
                            </li>
                        </ul>
                        <Link to="/register" className="btn btn-primary btn-md">
                            Start with a free account
                            <ArrowRight size={16} strokeWidth={2.2} aria-hidden="true" />
                        </Link>
                    </div>

                    <div className="benefit-cards">
                        <div className="benefit-card">
                            <span className="feature-icon">
                                <Car size={20} strokeWidth={1.9} aria-hidden="true" />
                            </span>
                            <h3>For drivers</h3>
                            <p>
                                A simple way to register vehicles, request help
                                and know exactly what is happening.
                            </p>
                        </div>
                        <div className="benefit-card">
                            <span className="feature-icon">
                                <Wrench size={20} strokeWidth={1.9} aria-hidden="true" />
                            </span>
                            <h3>For workshops</h3>
                            <p>
                                A focused job queue with the context needed to
                                start work without chasing information.
                            </p>
                        </div>
                        <div className="benefit-card">
                            <span className="feature-icon">
                                <KeyRound size={20} strokeWidth={1.9} aria-hidden="true" />
                            </span>
                            <h3>For operations</h3>
                            <p>
                                Oversight of accounts, approvals and service
                                activity from one considered control centre.
                            </p>
                        </div>
                    </div>
                </div>
            </Reveal>

            <Reveal as="section" className="landing-section" id="faq">
                <div className="faq-layout">
                    <div className="section-heading faq-heading">
                        <span className="eyebrow">FAQ</span>
                        <h2>Questions, answered</h2>
                        <p>
                            The essentials about access, tracking and how the
                            platform keeps every workspace in scope.
                        </p>
                    </div>

                    <div className="faq-list">
                        {FAQS.map((faq, index) => {
                            const isOpen = openFaq === index;

                            return (
                                <div
                                    className={`faq-item ${
                                        isOpen ? "is-open" : ""
                                    }`}
                                    key={faq.question}
                                >
                                    <button
                                        type="button"
                                        className="faq-question"
                                        aria-expanded={isOpen}
                                        onClick={() =>
                                            setOpenFaq(isOpen ? -1 : index)
                                        }
                                    >
                                        <span>{faq.question}</span>
                                        <ChevronDown
                                            size={18}
                                            strokeWidth={2}
                                            className="faq-chevron"
                                            aria-hidden="true"
                                        />
                                    </button>
                                    <div className="faq-answer">
                                        <div>
                                            <p>{faq.answer}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </Reveal>

            <Reveal className="cta-panel">
                <div>
                    <span className="eyebrow">Ready when you are</span>
                    <h2>Give every service a clearer journey.</h2>
                    <p>
                        Join the platform that keeps vehicle owners, workshop
                        teams and operations moving in sync.
                    </p>
                </div>
                <div className="cta-actions">
                    <Link to="/register" className="btn btn-primary btn-lg">
                        Create your account
                        <ArrowRight size={17} strokeWidth={2.2} aria-hidden="true" />
                    </Link>
                    <Link to="/login" className="btn btn-secondary btn-lg">
                        Sign in
                    </Link>
                </div>
            </Reveal>
        </div>
    );
}

export default Landing;
