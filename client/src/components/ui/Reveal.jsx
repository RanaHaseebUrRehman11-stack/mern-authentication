import { useEffect, useRef, useState } from "react";

function Reveal({ children, delay = 0, className = "", as: Tag = "div" }) {
    const ref = useRef(null);
    const prefersReduced =
        typeof window !== "undefined" &&
        (typeof IntersectionObserver === "undefined" ||
            Boolean(
                window.matchMedia?.("(prefers-reduced-motion: reduce)")
                    ?.matches
            ));
    const [visible, setVisible] = useState(prefersReduced);

    useEffect(() => {
        const node = ref.current;

        if (!node || visible || prefersReduced) return undefined;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setVisible(true);
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
        );

        observer.observe(node);

        return () => observer.disconnect();
    }, [prefersReduced, visible]);

    return (
        <Tag
            ref={ref}
            className={`reveal ${visible ? "is-visible" : ""} ${className}`.trim()}
            style={{ "--reveal-delay": `${delay}ms` }}
        >
            {children}
        </Tag>
    );
}

export default Reveal;
