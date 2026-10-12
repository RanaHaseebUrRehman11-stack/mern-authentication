export function Field({ label, htmlFor, error, hint, className = "", children }) {
    return (
        <div className={`field ${className}`.trim()}>
            {label && (
                <label className="field-label" htmlFor={htmlFor}>
                    {label}
                </label>
            )}
            {children}
            {hint && !error && <p className="field-hint">{hint}</p>}
            {error && <p className="field-error">{error}</p>}
        </div>
    );
}

export function Input({ id, className = "", ...rest }) {
    return <input id={id} className={`input ${className}`.trim()} {...rest} />;
}

export function Select({ id, className = "", children, ...rest }) {
    return (
        <select id={id} className={`input select ${className}`.trim()} {...rest}>
            {children}
        </select>
    );
}

export function Textarea({ id, className = "", ...rest }) {
    return (
        <textarea id={id} className={`input textarea ${className}`.trim()} {...rest} />
    );
}
