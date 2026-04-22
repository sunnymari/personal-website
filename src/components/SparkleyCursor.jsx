import { useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";

const SPARKLE_COLORS = ["#FF2D78", "#FFB3CC", "#FF6FA8", "#fff", "#FFD6E7", "#FF90BB"];

export default function SparkleyCursor() {
  const cursorImageRef = useRef(null);
  const mouseRef = useRef({ x: -100, y: -100 });
  const animRef = useRef(null);
  const lastSparkleRef = useRef(0);

  const createSparkle = useCallback((x, y) => {
    const container = document.getElementById("sparkle-container");
    if (!container) return;

    const sparkle = document.createElement("div");
    const size = 4 + Math.random() * 8;
    const isHeart = Math.random() > 0.5;
    const color = SPARKLE_COLORS[Math.floor(Math.random() * SPARKLE_COLORS.length)];
    const angle = Math.random() * 360;
    const dist = 20 + Math.random() * 40;
    const dx = Math.cos((angle * Math.PI) / 180) * dist;
    const dy = Math.sin((angle * Math.PI) / 180) * dist;
    const duration = 500 + Math.random() * 400;

    sparkle.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      width: ${size}px;
      height: ${size}px;
      pointer-events: none;
      z-index: 99998;
      font-size: ${size}px;
      line-height: 1;
      transform: translate(-50%, -50%);
      color: ${color};
      transition: none;
    `;
    sparkle.textContent = isHeart ? "♥" : "✦";

    container.appendChild(sparkle);

    const start = performance.now();
    const animate = (now) => {
      const progress = (now - start) / duration;
      if (progress >= 1) {
        sparkle.remove();
        return;
      }
      const eased = 1 - Math.pow(progress, 2);
      sparkle.style.transform = `translate(calc(-50% + ${dx * progress}px), calc(-50% + ${dy * progress}px)) scale(${eased}) rotate(${progress * 180}deg)`;
      sparkle.style.opacity = eased;
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    const cursorImage = cursorImageRef.current;
    if (!cursorImage) return;

    const onMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      cursorImage.style.left = `${e.clientX}px`;
      cursorImage.style.top = `${e.clientY}px`;

      const now = performance.now();
      if (now - lastSparkleRef.current > 35) {
        createSparkle(e.clientX, e.clientY);
        lastSparkleRef.current = now;
      }
    };

    const onClickBurst = (e) => {
      for (let i = 0; i < 7; i++) {
        window.setTimeout(() => createSparkle(e.clientX, e.clientY), i * 12);
      }
    };

    const onEnterClickable = () => {
      cursorImage.style.transform = "translate(-20%, -14%) scale(1.16)";
    };

    const onLeaveClickable = () => {
      cursorImage.style.transform = "translate(-20%, -14%) scale(1)";
    };

    const tick = () => {
      const { x, y } = mouseRef.current;
      cursorImage.style.left = `${x}px`;
      cursorImage.style.top = `${y}px`;
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);

    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerdown", onClickBurst);

    const clickables = document.querySelectorAll("a, button, [role='button'], input, textarea");
    clickables.forEach((el) => {
      el.addEventListener("mouseenter", onEnterClickable);
      el.addEventListener("mouseleave", onLeaveClickable);
    });

    document.body.style.cursor = "none";

    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerdown", onClickBurst);
      document.body.style.cursor = "";
      cancelAnimationFrame(animRef.current);
      document.documentElement.style.cursor = "";
      clickables.forEach((el) => {
        el.removeEventListener("mouseenter", onEnterClickable);
        el.removeEventListener("mouseleave", onLeaveClickable);
      });
    };
  }, [createSparkle]);

  useEffect(() => {
    document.documentElement.style.cursor = "none";
    return () => {
      document.documentElement.style.cursor = "";
    };
  }, []);

  if (typeof document === "undefined") return null;

  return createPortal(
    <>
      <div
        id="sparkle-container"
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 99998,
          overflow: "hidden",
        }}
      />

      <div
        ref={cursorImageRef}
        style={{
          position: "fixed",
          width: "68px",
          height: "68px",
          backgroundImage: "url('/kawaii-cursor.png')",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "contain",
          pointerEvents: "none",
          zIndex: 99999,
          transform: "translate(-20%, -14%)",
          transition: "transform 0.2s cubic-bezier(0.34,1.56,0.64,1)",
          left: "-100px",
          top: "-100px",
          mixBlendMode: "normal",
        }}
      />
    </>,
    document.body
  );
}
