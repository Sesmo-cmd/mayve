import { useEffect, useRef, type HTMLAttributes, type ReactNode } from "react";

interface Props extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function FadeUp({ children, className = "", ...rest }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Fallback: if already in viewport at mount, reveal immediately.
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      el.classList.add("in");
    }
    // Safety net so content never stays hidden.
    const safety = window.setTimeout(() => el.classList.add("in"), 400);
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px -40px 0px" }
    );
    obs.observe(el);
    return () => {
      window.clearTimeout(safety);
      obs.disconnect();
    };
  }, []);
  return (
    <div ref={ref} className={`fu ${className}`} {...rest}>
      {children}
    </div>
  );
}
