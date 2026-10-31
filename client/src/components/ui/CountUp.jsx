import { useEffect, useRef, useState } from "react";

function CountUp({ value, duration = 900 }) {
    const numeric = Number(value);
    const isNumeric = Number.isFinite(numeric) && numeric >= 0;
    const prefersReduced =
        typeof window !== "undefined" &&
        Boolean(
            window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches
        );
    const shouldAnimate = isNumeric && !prefersReduced;
    const [display, setDisplay] = useState(shouldAnimate ? 0 : numeric);
    const frame = useRef(null);

    useEffect(() => {
        if (!shouldAnimate) return undefined;

        const start = performance.now();

        const tick = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(Math.round(numeric * eased));

            if (progress < 1) {
                frame.current = requestAnimationFrame(tick);
            }
        };

        frame.current = requestAnimationFrame(tick);

        return () => {
            if (frame.current) cancelAnimationFrame(frame.current);
        };
    }, [numeric, duration, shouldAnimate]);

    if (!isNumeric) return <>{value}</>;
    return <>{shouldAnimate ? display : numeric}</>;
}

export default CountUp;
