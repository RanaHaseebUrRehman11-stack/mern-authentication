import { Gauge } from "lucide-react";

export function Logo({ compact = false, className = "" }) {
    return (
        <span className={`brand ${className}`.trim()}>
            <span className="brand-mark" aria-hidden="true">
                <Gauge size={20} strokeWidth={2.2} />
            </span>
            {!compact && (
                <span className="brand-text">
                    Torque<span>Desk</span>
                </span>
            )}
        </span>
    );
}

export default Logo;
