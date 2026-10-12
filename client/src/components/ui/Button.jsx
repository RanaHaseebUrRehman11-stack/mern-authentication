function Button({
    children,
    type = "button",
    variant = "primary",
    size = "md",
    className = "",
    loading = false,
    disabled = false,
    ...rest
}) {
    return (
        <button
            type={type}
            className={`btn btn-${variant} btn-${size} ${className}`.trim()}
            disabled={disabled || loading}
            {...rest}
        >
            {loading && <span className="btn-spinner" aria-hidden="true" />}
            {children}
        </button>
    );
}

export default Button;
