import React, { useEffect, useRef, useState } from "react";
import butterflyImg from "./butterfly.png";

// ── حساب المناطق المحظورة بناءً على الأبعاد الفعلية فقط ──
function getForbiddenZones(w, h) {
  const mobile = w < 768;

  const bookW = mobile ? Math.min(w * 0.65, 260) : 560;
  const bookH = mobile ? Math.min(h * 0.30, 180) : 360;
  const bookX  = w / 2 - bookW / 2;
  const bookY  = h / 2 - bookH / 2;
  const margin = mobile ? 18 : 80;

  const zones = [
    {
      x: bookX - margin,
      y: bookY - margin,
      w: bookW + margin * 2,
      h: bookH + margin * 2,
    },
  ];

  if (!mobile) {
    zones.push({ x: 0, y: 0, w: 220, h });
  }

  return zones;
}

function isInsideForbidden(x, y, zones) {
  return zones.some(
    (z) => x > z.x && x < z.x + z.w && y > z.y && y < z.y + z.h
  );
}

function pickTarget(cx, cy, w, h, zones) {
  const mobile = w < 768;
  const margin = 40;
  let tx, ty, tries = 0;
  do {
    const angle = Math.random() * Math.PI * 2;
    const dist  = 50 + Math.random() * (mobile ? 80 : 120);
    tx = Math.max(margin, Math.min(w - margin, cx + Math.cos(angle) * dist));
    ty = Math.max(margin, Math.min(h - margin, cy + Math.sin(angle) * dist));
    tries++;
  } while (isInsideForbidden(tx, ty, zones) && tries < 30);
  return { tx, ty };
}

// ── Hook: يتابع حجم الشاشة مع debounce ──
function useWindowSize() {
  const [size, setSize] = useState({
    width:  window.innerWidth,
    height: window.innerHeight,
  });
  useEffect(() => {
    let t;
    const onResize = () => {
      clearTimeout(t);
      t = setTimeout(
        () => setSize({ width: window.innerWidth, height: window.innerHeight }),
        150
      );
    };
    window.addEventListener("resize", onResize);
    return () => { window.removeEventListener("resize", onResize); clearTimeout(t); };
  }, []);
  return size;
}

export default function Butterflies() {
  const { width, height } = useWindowSize();
  const [butterflies, setButterflies] = useState([]);
  const animRef  = useRef();
  const bRef     = useRef([]);

  useEffect(() => {
    cancelAnimationFrame(animRef.current);

    const w = width;
    const h = height;
    const mobile = w < 768;
    const zones  = getForbiddenZones(w, h);

    const cols  = mobile ? 3 : 6;
    const rows  = mobile ? 5 : 3;
    const cellW = w / cols;
    const cellH = h / rows;
    const points = [];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        let x, y, tries = 0;
        do {
          x = col * cellW + cellW * 0.15 + Math.random() * cellW * 0.7;
          y = row * cellH + cellH * 0.15 + Math.random() * cellH * 0.7;
          tries++;
        } while (isInsideForbidden(x, y, zones) && tries < 25);

        if (!isInsideForbidden(x, y, zones)) points.push({ x, y });
      }
    }

    const minSz = mobile ? 28 : 55;
    const varSz = mobile ? 14 : 25;

    const list = points.map((p) => ({
      x: p.x, y: p.y,
      targetX: p.x, targetY: p.y,
      vx: 0, vy: 0,
      flapSpeed:  4  + Math.random() * 4,
      flapOffset: Math.random() * Math.PI * 2,
      targetTimer: 0,
      targetInterval: 80 + Math.random() * 120,
      size: minSz + Math.random() * varSz,
      visible: false,
      rotate: 0, scaleX: 1, scaleY: 1,
    }));

    bRef.current = list;
    setButterflies([...list]);

    list.forEach((_, i) => {
      setTimeout(() => {
        if (!bRef.current[i]) return;
        bRef.current[i] = { ...bRef.current[i], visible: true };
        setButterflies(prev =>
          prev.map((b, idx) => idx === i ? { ...b, visible: true } : b)
        );
      }, 300 + i * 130);
    });

    let time = 0;
    const animate = () => {
      time += 0.016;
      const currentZones = getForbiddenZones(w, h);

      bRef.current = bRef.current.map((b) => {
        const flapCycle = Math.sin(time * b.flapSpeed + b.flapOffset);
        const scaleX    = 0.25 + Math.abs(flapCycle) * 0.75;
        const scaleY    = 1    + Math.abs(flapCycle) * 0.06;

        let { targetX, targetY, targetTimer, targetInterval, vx, vy } = b;
        targetTimer++;

        if (targetTimer >= targetInterval || Math.hypot(targetX - b.x, targetY - b.y) < 15) {
          const { tx, ty } = pickTarget(b.x, b.y, w, h, currentZones);
          targetX = tx; targetY = ty;
          targetTimer = 0;
          targetInterval = 80 + Math.random() * 120;
        }

        const dx = targetX - b.x;
        const dy = targetY - b.y;
        const d  = Math.hypot(dx, dy) || 1;
        const newVx = vx * 0.92 + (dx / d) * 0.6 * 0.08;
        const newVy = vy * 0.92 + (dy / d) * 0.6 * 0.08;

        let newX = b.x + newVx;
        let newY = b.y + newVy;

        if (isInsideForbidden(newX, newY, currentZones)) {
          newX = b.x; newY = b.y;
          const { tx, ty } = pickTarget(b.x, b.y, w, h, currentZones);
          targetX = tx; targetY = ty;
        }

        return {
          ...b,
          x: newX, y: newY,
          vx: newVx, vy: newVy,
          targetX, targetY, targetTimer, targetInterval,
          scaleX, scaleY,
          rotate: Math.atan2(newVy, newVx) * (180 / Math.PI) * 0.2,
        };
      });

      setButterflies([...bRef.current]);
      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [width, height]);

  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9999 }}>
      {butterflies.map((b, i) => (
        <img
          key={i}
          src={butterflyImg}
          alt=""
          style={{
            position: "absolute",
            width: `${b.size}px`,
            left: 0, top: 0,
            opacity: b.visible ? 0.7 : 0,
            transition: "opacity 2s ease",
            transform: `translate(${b.x}px, ${b.y}px) rotate(${b.rotate}deg) scaleX(${b.scaleX}) scaleY(${b.scaleY})`,
            filter: "drop-shadow(0 0 12px rgba(255, 200, 80, 0.9))",
            transformOrigin: "center center",
            willChange: "transform",
          }}
        />
      ))}
    </div>
  );
}