/* eslint-disable react-refresh/only-export-components */
import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState
} from "react";

const ToastContext = createContext(null);

let idCounter = 0;

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const remove = useCallback((id) => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
    }, []);

    const push = useCallback(
        (type, message) => {
            const id = ++idCounter;
            setToasts((current) => [...current, { id, type, message }]);

            window.setTimeout(() => remove(id), 4000);
        },
        [remove]
    );

    const value = useMemo(
        () => ({
            success: (message) => push("success", message),
            error: (message) => push("error", message),
            info: (message) => push("info", message)
        }),
        [push]
    );

    return (
        <ToastContext.Provider value={value}>
            {children}

            <div className="toast-stack" role="status" aria-live="polite">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`toast toast-${toast.type}`}
                    >
                        <span>{toast.message}</span>
                        <button
                            type="button"
                            className="toast-close"
                            aria-label="Dismiss notification"
                            onClick={() => remove(toast.id)}
                        >
                            &times;
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);

    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }

    return context;
}
