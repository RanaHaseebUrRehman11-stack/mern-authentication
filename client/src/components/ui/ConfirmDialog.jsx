import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import Button from "./Button";

function ConfirmDialog({
    open,
    title = "Are you sure?",
    message,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    confirmVariant = "danger",
    loading = false,
    onConfirm,
    onCancel
}) {
    useEffect(() => {
        if (!open) return undefined;

        const handleKey = (event) => {
            if (event.key === "Escape" && !loading) onCancel?.();
        };

        document.addEventListener("keydown", handleKey);

        return () => document.removeEventListener("keydown", handleKey);
    }, [open, loading, onCancel]);

    if (!open) return null;

    return (
        <div className="modal-backdrop" onClick={loading ? undefined : onCancel}>
            <div
                className="modal modal-confirm"
                role="dialog"
                aria-modal="true"
                aria-label={title}
                onClick={(event) => event.stopPropagation()}
            >
                <span className="modal-icon modal-icon-danger" aria-hidden="true">
                    <AlertTriangle size={22} strokeWidth={2} />
                </span>
                <h3 className="modal-title">{title}</h3>
                {message && <p className="modal-message">{message}</p>}

                <div className="modal-actions">
                    <Button
                        variant="ghost"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        {cancelLabel}
                    </Button>
                    <Button
                        variant={confirmVariant}
                        onClick={onConfirm}
                        loading={loading}
                    >
                        {confirmLabel}
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmDialog;
