import {
  useEffect,
  useRef,
  useState,
  createElement,
  type ReactNode,
  type CSSProperties,
} from "react";
import clsx from "clsx";

// ============================================================================
// useScrollReveal - fade + slide in when element enters viewport
// ============================================================================

export function useScrollReveal(options?: {
  threshold?: number;
  rootMargin?: string;
  /** Replay every time the element re-enters viewport. Default: once. */
  replay?: boolean;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            if (!options?.replay) obs.unobserve(entry.target);
          } else if (options?.replay) {
            setVisible(false);
          }
        }
      },
      {
        threshold: options?.threshold ?? 0.12,
        rootMargin: options?.rootMargin ?? "0px 0px -80px 0px",
      },
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [options?.threshold, options?.rootMargin, options?.replay]);

  return { ref, visible };
}

// ============================================================================
// <Reveal /> - drop-in wrapper that fades + slides children when in view
// ============================================================================

type RevealProps = {
  children: ReactNode;
  /** Pixels to translate from on enter. Default 32. */
  distance?: number;
  /** Direction. Default "up". */
  direction?: "up" | "down" | "left" | "right";
  /** Animation delay ms (use to stagger siblings). */
  delay?: number;
  /** Animation duration ms. Default 700. */
  duration?: number;
  className?: string;
  /** Override the default once-per-mount behavior. */
  replay?: boolean;
  /** Render as a specific element to keep layout sane. */
  as?: "div" | "section" | "article" | "header" | "li" | "span";
  style?: CSSProperties;
};

export function Reveal({
  children,
  distance = 32,
  direction = "up",
  delay = 0,
  duration = 700,
  className,
  replay = false,
  as: Tag = "div",
  style,
}: RevealProps) {
  const { ref, visible } = useScrollReveal({ replay });

  const transformHidden = (() => {
    switch (direction) {
      case "up":
        return `translate3d(0, ${distance}px, 0)`;
      case "down":
        return `translate3d(0, ${-distance}px, 0)`;
      case "left":
        return `translate3d(${distance}px, 0, 0)`;
      case "right":
        return `translate3d(${-distance}px, 0, 0)`;
    }
  })();

  return createElement(
    Tag,
    {
      ref,
      className,
      style: {
        ...style,
        opacity: visible ? 1 : 0,
        transform: visible ? "translate3d(0, 0, 0)" : transformHidden,
        transition: `opacity ${duration}ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
        willChange: "opacity, transform",
      },
    },
    children,
  );
}

// ============================================================================
// AnimatedCounter - counts up from 0 to target when scrolled into view
// ============================================================================

type CounterProps = {
  to: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  format?: "int" | "decimal-1" | "compact-k";
  className?: string;
};

export function AnimatedCounter({
  to,
  duration = 1400,
  prefix = "",
  suffix = "",
  format = "int",
  className,
}: CounterProps) {
  const { ref, visible } = useScrollReveal();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!visible) return;
    let frameId = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(eased * to);
      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      } else {
        setValue(to);
      }
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [visible, to, duration]);

  const formatted = (() => {
    if (format === "decimal-1") return value.toFixed(1);
    if (format === "compact-k") {
      if (value >= 1000) return (value / 1000).toFixed(1) + "k";
      return Math.round(value).toString();
    }
    return Math.round(value).toLocaleString();
  })();

  return (
    <span ref={ref} className={clsx("tabular-nums", className)}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}

// ============================================================================
// useParallax - translate Y based on scroll position
// ============================================================================

export function useParallax(speed = 0.4) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (!ref.current) return;
    let rafId = 0;
    const update = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const fromCenter = center - window.innerHeight / 2;
      setOffset(-fromCenter * speed);
    };
    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
    };
  }, [speed]);

  return { ref, offset };
}

// ============================================================================
// <Parallax /> - wrapper that applies translateY
// ============================================================================

export function Parallax({
  children,
  speed = 0.3,
  className,
}: {
  children: ReactNode;
  speed?: number;
  className?: string;
}) {
  const { ref, offset } = useParallax(speed);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        transform: `translate3d(0, ${offset.toFixed(2)}px, 0)`,
        willChange: "transform",
      }}
    >
      {children}
    </div>
  );
}

// ============================================================================
// <Marquee /> - infinite horizontal scroll (for logo strips)
// ============================================================================

export function Marquee({
  children,
  speedSec = 30,
  className,
  pauseOnHover = true,
}: {
  children: ReactNode;
  speedSec?: number;
  className?: string;
  pauseOnHover?: boolean;
}) {
  return (
    <div
      className={clsx("group relative w-full overflow-hidden", className)}
      style={{
        maskImage:
          "linear-gradient(90deg, transparent 0, black 80px, black calc(100% - 80px), transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(90deg, transparent 0, black 80px, black calc(100% - 80px), transparent 100%)",
      }}
    >
      <div
        className={clsx(
          "flex w-max",
          pauseOnHover && "group-hover:[animation-play-state:paused]",
        )}
        style={{
          animation: `marquee ${speedSec}s linear infinite`,
        }}
      >
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden>
          {children}
        </div>
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

// ============================================================================
// useMousePosition - for magnetic / cursor-tracking effects
// ============================================================================

export function useMagneticHover(strength = 0.25) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - (rect.left + rect.width / 2);
      const y = e.clientY - (rect.top + rect.height / 2);
      el.style.transform = `translate3d(${x * strength}px, ${y * strength}px, 0)`;
    };
    const onLeave = () => {
      el.style.transform = "translate3d(0, 0, 0)";
    };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [strength]);

  return ref;
}
