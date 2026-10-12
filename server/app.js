const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const { notFound, errorMiddleware } = require("./middleware/errorMiddleware");

const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const vehicleRoutes = require("./routes/vehicle");
const serviceRequestRoutes = require("./routes/serviceRequest");
const mechanicRoutes = require("./routes/mechanic");

const app = express();

// ============================
// Security headers
// ============================

app.use(helmet());

// ============================
// CORS configuration
// ============================
// Origins are configurable via CLIENT_ORIGINS (comma separated). When it is
// not set, we fall back to common local development origins.

const configuredOrigins = (process.env.CLIENT_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

const defaultOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173"
];

const allowedOrigins =
    configuredOrigins.length > 0 ? configuredOrigins : defaultOrigins;

const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, same-origin)
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        // Reject cleanly so the response is a 403, not a 500.
        const corsError = new Error("Not allowed by CORS");
        corsError.status = 403;
        return callback(corsError);
    }
};

// ============================
// Rate limiting (login brute-force protection)
// ============================

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    // Automated tests issue many logins from one IP; skip there only.
    skip: () => process.env.NODE_ENV === "test",
    message: {
        message: "Too many login attempts. Please try again later."
    }
});

// Registration is open to the public (customers + mechanics) and also guards
// the secret-protected admin signup, so throttle it to blunt abuse and secret
// brute-forcing.
const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => process.env.NODE_ENV === "test",
    message: {
        message: "Too many registration attempts. Please try again later."
    }
});

// Middleware

app.use(cors(corsOptions));

app.use(express.json());

// Routes

app.use("/api/auth/login", loginLimiter);

app.use("/api/auth/register", registerLimiter);

app.use("/api/auth", authRoutes);

app.use("/api/admin", adminRoutes);

app.use("/api/vehicles", vehicleRoutes);

app.use("/api/service-requests", serviceRequestRoutes);

app.use("/api/mechanic", mechanicRoutes);

// Health / test route

app.get("/", (req, res) => {
    res.send("Server is running successfully");
});

// 404 + centralized error handling (must be last)

app.use(notFound);

app.use(errorMiddleware);

module.exports = app;
