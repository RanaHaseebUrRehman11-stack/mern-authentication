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
    if (!open) return null;

    return (
        <div className="modal-backdrop" onClick={loading ? undefined : onCancel}>
            <div
                className="modal"
                role="dialog"
                aria-modal="true"
                aria-label={title}
                onClick={(event) => event.stopPropagation()}
            >
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
