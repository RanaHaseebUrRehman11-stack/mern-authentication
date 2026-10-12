const { handleError } = require("../utils/errorHandler");

// Express 5 automatically forwards rejected promises from async handlers,
// so this central handler catches anything not handled inside controllers.
// eslint-disable-next-line no-unused-vars
const notFound = (req, res, next) => {
    res.status(404).json({
        message: `Route not found: ${req.method} ${req.originalUrl}`
    });
};

// eslint-disable-next-line no-unused-vars
const errorMiddleware = (err, req, res, next) => {
    return handleError(res, err, "Unhandled");
};

module.exports = { notFound, errorMiddleware };
