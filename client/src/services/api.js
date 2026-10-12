import axios from "axios";

// Base URL is configurable via VITE_API_URL. Falls back to localhost:5000,
// which matches the backend default port.
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
    baseURL: `${API_URL}/api`
});

// Attach the JWT using the standard Bearer scheme.
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

// Normalise error messages and handle expired / invalid sessions.
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const code = error.response?.data?.code;

        // 401 = expired/invalid session. A 403 carrying a MECHANIC_* code
        // means the signed-in mechanic was revoked (rejected, deactivated or
        // profile removed) mid-session, so the stale session is dropped too.
        const sessionRevoked =
            status === 401 ||
            (status === 403 &&
                typeof code === "string" &&
                code.startsWith("MECHANIC_"));

        if (sessionRevoked) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");

            const onLoginPage =
                window.location.pathname.startsWith("/login");

            if (!onLoginPage) {
                window.location.href = "/login";
            }
        }

        if (!error.response) {
            error.friendlyMessage =
                "Unable to reach the server. Please check your connection.";
        } else {
            error.friendlyMessage =
                error.response.data?.message ||
                error.response.data?.errors?.[0] ||
                "Something went wrong. Please try again.";
        }

        return Promise.reject(error);
    }
);

export default api;
