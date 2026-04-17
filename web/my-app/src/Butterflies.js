import React, { useEffect, useRef, useState } from "react";
import butterflyImg from "./butterfly.png";

export default function Butterflies() {
  const [butterflies, setButterflies] = useState([]);
  const animationRef = useRef();
  const butterfliesRef = useRef([]);

  const BOOK = {
    x: window.innerWidth / 2 - 280,
    y: window.innerHeight / 2 - 180,
    w: 560, h: 360,
  };

  const SAFE_MARGIN = 80;
  const FORBIDDEN = [
    { x: BOOK.x - SAFE_MARGIN, y: BOOK.y - SAFE_MARGIN, w: BOOK.w + SAFE_MARGIN*2, h: BOOK.h + SAFE_MARGIN*2 },
    { x: 0, y: 0, w: 220, h: window.innerHeight },
  ];

  const isInsideForbidden = (x, y) =>
    FORBIDDEN.some(z => x > z.x && x < z.x + z.w && y > z.y && y < z.y + z.h);

  const pickNewTarget = (currentX, currentY) => {
    const margin = 60;
    let tx, ty, tries = 0;
    do {
      const angle = Math.random() * Math.PI * 2;
      const dist  = 60 + Math.random() * 120;
      tx = currentX + Math.cos(angle) * dist;
      ty = currentY + Math.sin(angle) * dist;
      tx = Math.max(margin, Math.min(window.innerWidth  - margin, tx));
      ty = Math.max(margin, Math.min(window.innerHeight - margin, ty));
      tries++;
    } while (isInsideForbidden(tx, ty) && tries < 30);
    return { tx, ty };
  };

  useEffect(() => {
    // ── توزيع شبكي مضمون ──
    const cols = 6;
    const rows = 3;
    const cellW = window.innerWidth / cols;
    const cellH = window.innerHeight / rows;
    const points = [];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        let tries = 0;
        let x, y;
        do {
          x = col * cellW + cellW * 0.2 + Math.random() * cellW * 0.6;
          y = row * cellH + cellH * 0.2 + Math.random() * cellH * 0.6;
          tries++;
        } while (isInsideForbidden(x, y) && tries < 20);

        if (!isInsideForbidden(x, y)) {
          points.push({ x, y });
        }
      }
    }

    const list = points.map((p) => ({
      x: p.x, y: p.y,
      targetX: p.x, targetY: p.y,
      vx: 0, vy: 0,
      flapSpeed: 4 + Math.random() * 4,
      flapOffset: Math.random() * Math.PI * 2,
      targetTimer: 0,
      targetInterval: 80 + Math.random() * 120,
      size: 55 + Math.random() * 25,
      offset: Math.random() * 1000,
      visible: false,
      rotate: 0,
      scaleX: 1,
      scaleY: 1,
    }));

    butterfliesRef.current = list;
    setButterflies(list);

    list.forEach((_, i) => {
      setTimeout(() => {
        butterfliesRef.current[i].visible = true;
        setButterflies(prev => prev.map((b, idx) =>
          idx === i ? { ...b, visible: true } : b
        ));
      }, 300 + i * 150);
    });

  }, []);

  useEffect(() => {
    let time = 0;

    const animate = () => {
      time += 0.016;

      butterfliesRef.current = butterfliesRef.current.map((b) => {
        const flapCycle = Math.sin(time * b.flapSpeed + b.flapOffset);
        const scaleX    = 0.25 + Math.abs(flapCycle) * 0.75;
        const scaleY    = 1 + Math.abs(flapCycle) * 0.06;

        let { targetX, targetY, targetTimer, targetInterval, vx, vy } = b;
        targetTimer++;

        const distToTarget = Math.hypot(targetX - b.x, targetY - b.y);

        if (targetTimer >= targetInterval || distToTarget < 15) {
          const { tx, ty } = pickNewTarget(b.x, b.y);
          targetX = tx;
          targetY = ty;
          targetTimer = 0;
          targetInterval = 80 + Math.random() * 120;
        }

        const dx = targetX - b.x;
        const dy = targetY - b.y;
        const dist = Math.hypot(dx, dy) || 1;

        const speed = 0.6;
        const ax = (dx / dist) * speed;
        const ay = (dy / dist) * speed;

        const newVx = vx * 0.92 + ax * 0.08;
        const newVy = vy * 0.92 + ay * 0.08;

        let newX = b.x + newVx;
        let newY = b.y + newVy;

        if (isInsideForbidden(newX, newY)) {
          newX = b.x;
          newY = b.y;
          const { tx, ty } = pickNewTarget(b.x, b.y);
          targetX = tx;
          targetY = ty;
        }

        const rotate = Math.atan2(newVy, newVx) * (180 / Math.PI) * 0.2;

        return {
          ...b,
          x: newX, y: newY,
          vx: newVx, vy: newVy,
          targetX, targetY,
          targetTimer, targetInterval,
          scaleX, scaleY, rotate,
        };
      });

      setButterflies([...butterfliesRef.current]);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, []);

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