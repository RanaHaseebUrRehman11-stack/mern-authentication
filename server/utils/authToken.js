// Extracts a JWT from the Authorization header.
// Supports the standard "Bearer <token>" scheme as well as a bare token,
// preserving backward compatibility with existing clients.
const extractToken = (req) => {
    const header = req.header("Authorization");

    if (!header || typeof header !== "string") {
        return null;
    }

    const value = header.trim();

    if (value.toLowerCase().startsWith("bearer ")) {
        const token = value.slice(7).trim();
        return token.length > 0 ? token : null;
    }

    return value.length > 0 ? value : null;
};

module.exports = { extractToken };
