/* eslint-disable react-refresh/only-export-components */
import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
    useCallback
} from "react";
import api from "../services/api";

const AuthContext = createContext(null);

const readStoredUser = () => {
    try {
        const raw = localStorage.getItem("user");
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(readStoredUser);
    const [token, setToken] = useState(() => localStorage.getItem("token"));
    const [initializing, setInitializing] = useState(
        () => Boolean(localStorage.getItem("token"))
    );

    const logout = useCallback(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
    }, []);

    const login = useCallback(async (email, password) => {
        const { data } = await api.post("/auth/login", { email, password });

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        setToken(data.token);
        setUser(data.user);

        return data.user;
    }, []);

    // Re-fetch the current user from the API after profile changes.
    const refreshUser = useCallback(async () => {
        const { data } = await api.get("/auth/profile");

        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));

        return data.user;
    }, []);

    // Restore the authenticated session on refresh using the profile endpoint.
    useEffect(() => {
        let active = true;

        const restore = async () => {
            if (!localStorage.getItem("token")) {
                setInitializing(false);
                return;
            }

            try {
                const { data } = await api.get("/auth/profile");
                if (!active) return;

                setUser(data.user);
                localStorage.setItem("user", JSON.stringify(data.user));
            } catch {
                if (!active) return;
                logout();
            } finally {
                if (active) setInitializing(false);
            }
        };

        restore();

        return () => {
            active = false;
        };
    }, [logout]);

    const value = useMemo(
        () => ({
            user,
            token,
            initializing,
            isAuthenticated: Boolean(token),
            isAdmin: user?.role === "admin",
            isMechanic: user?.role === "mechanic",
            login,
            logout,
            refreshUser
        }),
        [user, token, initializing, login, logout, refreshUser]
    );

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }

    return context;
}
