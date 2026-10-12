const handleError = (res, error, context = "Server") => {
    // Errors that deliberately carry an HTTP status (e.g. CORS rejection).
    if (
        typeof error.status === "number" &&
        error.status >= 400 &&
        error.status < 500
    ) {
        return res.status(error.status).json({
            message: error.message || "Request rejected"
        });
    }

    // Mongoose schema validation failure
    if (error.name === "ValidationError") {
        const errors = Object.values(error.errors).map(
            (item) => item.message
        );
        return res.status(400).json({
            message: "Validation failed",
            errors
        });
    }

    // Invalid ObjectId / wrong type
    if (error.name === "CastError") {
        return res.status(400).json({
            message: `Invalid value for ${error.path}`
        });
    }

    // MongoDB duplicate key
    if (error.code === 11000) {
        const field = Object.keys(error.keyValue || {})[0] || "field";
        return res.status(409).json({
            message: `A record with that ${field} already exists`
        });
    }

    // JWT problems surfacing through controllers
    if (
        error.name === "JsonWebTokenError" ||
        error.name === "TokenExpiredError"
    ) {
        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }

    // Log sanitized developer information only
    console.error(`[${context}]`, error.message);

    return res.status(500).json({
        message: "Internal server error"
    });
};

module.exports = { handleError };
