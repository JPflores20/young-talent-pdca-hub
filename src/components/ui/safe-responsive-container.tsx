import React, { useState, useEffect, useRef } from "react";
import { ResponsiveContainer, ResponsiveContainerProps } from "recharts";

interface SafeResponsiveContainerProps extends ResponsiveContainerProps {
  children: React.ReactNode;
}

/**
 * SafeResponsiveContainer
 * Wraps Recharts' ResponsiveContainer to prevent the "width(0) and height(0) of chart should be greater than 0"
 * warning when charts are rendered inside closed Accordions, hidden tabs, or unmounted/animating dialogs.
 */
export function SafeResponsiveContainer({
  children,
  width = "100%",
  height = "100%",
  minWidth = 1,
  minHeight = 1,
  className,
  style,
  initialDimension = { width: 800, height: 400 },
  ...props
}: SafeResponsiveContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!containerRef.current) return;

    const measure = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: Math.floor(rect.width),
          height: Math.floor(rect.height),
        });
      }
    };

    measure();

    if (typeof ResizeObserver !== "undefined") {
      const resizeObserver = new ResizeObserver(() => {
        measure();
      });
      resizeObserver.observe(containerRef.current);
      return () => {
        resizeObserver.disconnect();
      };
    }
  }, []);

  const isTest = typeof process !== "undefined" && process.env?.NODE_ENV === "test";

  // In browser: only render ResponsiveContainer when container has non-zero dimensions.
  // In tests (JSDOM): render with initialDimension fallback (800x400).
  const shouldRender = isTest || (mounted && dimensions.width > 0 && dimensions.height > 0);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
        minWidth,
        minHeight,
        ...style,
      }}
    >
      {shouldRender ? (
        <ResponsiveContainer
          width="100%"
          height="100%"
          minWidth={minWidth}
          minHeight={minHeight}
          initialDimension={initialDimension}
          {...props}
        >
          {children}
        </ResponsiveContainer>
      ) : null}
    </div>
  );
}
