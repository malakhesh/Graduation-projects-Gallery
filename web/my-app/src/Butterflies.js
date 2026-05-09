import React, { useEffect, useRef, useState } from "react";
import butterflyImg from "./butterfly.png";

// ── 7asab el mana6e2 el mamnou3a 3ala 7asab ab3ad el screen ──────────────────
// da bygebli el zones elly el farasha mesh lazem tetwa2af feeha (7awaleen el ketab w el sidebar)
function getForbiddenZones(w, h) {
  const mobile = w < 768;

  // el ketab el maftu7 — byheseb el 7agm w el mawde3 bta3o
  const bookW = mobile ? Math.min(w * 0.65, 260) : 560;
  const bookH = mobile ? Math.min(h * 0.30, 180) : 360;
  const bookX  = w / 2 - bookW / 2;  // el ketab fel nos afqiyan
  const bookY  = h / 2 - bookH / 2;  // el ketab fel nos ra2siyan
  const margin = mobile ? 18 : 80;   // el mas7a 7awaleeh (3shan el farashat mtetqa7abesh)

  // el zone el asa7iya — 7awel el ketab ma3 el margin
  const zones = [
    {
      x: bookX - margin,
      y: bookY - margin,
      w: bookW + margin * 2,
      h: bookH + margin * 2,
    },
  ];

  // f el desktop bass — bymen3 el farashat men el sidebar (el 220px el awla)
  if (!mobile) {
    zones.push({ x: 0, y: 0, w: 220, h });
  }

  return zones;
}

// bycheck eza el noo2ta (x, y) gowa ay zone mamnou3a
function isInsideForbidden(x, y, zones) {
  return zones.some(
    (z) => x > z.x && x < z.x + z.w && y > z.y && y < z.y + z.h
  );
}

// bykhtar target geded lel farasha (el mawde3 elly hateroo7 leeh)
// byhawel yel2a mawde3 mesh gowa el forbidden zones
function pickTarget(cx, cy, w, h, zones) {
  const mobile = w < 768;
  const margin = 40;  // mesh lazem tero7 fi el corners
  let tx, ty, tries = 0;
  do {
    // bykhtar direction random w mas7a random
    const angle = Math.random() * Math.PI * 2;
    const dist  = 50 + Math.random() * (mobile ? 80 : 120);
    tx = Math.max(margin, Math.min(w - margin, cx + Math.cos(angle) * dist));
    ty = Math.max(margin, Math.min(h - margin, cy + Math.sin(angle) * dist));
    tries++;
  } while (isInsideForbidden(tx, ty, zones) && tries < 30); // byhawal 30 marra aktar
  return { tx, ty };
}

// ── Hook: byetabe3 7agm el screen ma3 debounce 3shan mesh byesta7i keter ──────
function useWindowSize() {
  const [size, setSize] = useState({
    width:  window.innerWidth,
    height: window.innerHeight,
  });
  useEffect(() => {
    let t;
    const onResize = () => {
      clearTimeout(t);
      // debounce — mestannieh 150ms ba3d akher resize event 3shan mesh by update keter
      t = setTimeout(
        () => setSize({ width: window.innerWidth, height: window.innerHeight }),
        150
      );
    };
    window.addEventListener("resize", onResize);
    // cleanup lama el component yetsha7
    return () => { window.removeEventListener("resize", onResize); clearTimeout(t); };
  }, []);
  return size;
}

export default function Butterflies() {
  const { width, height } = useWindowSize()
  const [butterflies, setButterflies] = useState([])  // el state bta3 kol el farashat
  const animRef  = useRef();   // ref lel requestAnimationFrame 3shan ne2dar newakkafha
  const bRef     = useRef([]); // ref lel farashat (mesh state 3shan el animation loop mas7a)

  // da byeshtagh lama el screen size yetghayar aw el awwel marra
  useEffect(() => {
    cancelAnimationFrame(animRef.current) // wak'f ay animation قديمة

    const w = width;
    const h = height;
    const mobile = w < 768;
    const zones  = getForbiddenZones(w, h)

    // ── Tawzi3 el farashat 3ala el grid ─────────────────────────────────────
    // benقسم el screen le cells (grid) w benحط farasha fel kol cell
    const cols  = mobile ? 3 : 6;   // 3adad el a3meda
    const rows  = mobile ? 5 : 3;   // 3adad el soo7
    const cellW = w / cols;
    const cellH = h / rows;
    const points = [];  // el mawaqi3 el hayya el lazel el farashat tebda menhom

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        let x, y, tries = 0;
        do {
          // bykhtar mawde3 random gowa el cell
          x = col * cellW + cellW * 0.15 + Math.random() * cellW * 0.7;
          y = row * cellH + cellH * 0.15 + Math.random() * cellH * 0.7;
          tries++;
        } while (isInsideForbidden(x, y, zones) && tries < 25); // byhawal lazama

        // bas lo el mawde3 mesh gowa el forbidden zones
        if (!isInsideForbidden(x, y, zones)) points.push({ x, y });
      }
    }

    // ── Ibda2 el farashat ──────────────────────────────────────────────────
    const minSz = mobile ? 28 : 55;  // a8'ar 7agm
    const varSz = mobile ? 14 : 25;  // el variation fel 7agm

    // bybni el objects bta3et el farashat kollaha
    const list = points.map((p) => ({
      x: p.x, y: p.y,             // el mawde3 el 7ali
      targetX: p.x, targetY: p.y, // el mawde3 elly raye7a leeh
      vx: 0, vy: 0,               // el sur3a (velocity)
      flapSpeed:  4  + Math.random() * 4,    // sur3et el khafaqan
      flapOffset: Math.random() * Math.PI * 2, // starting point moftare2 3shan mesh kolaha te3mel nafs el 7araka
      targetTimer: 0,              // 3adad el frames men akher mara 8'ayar el target
      targetInterval: 80 + Math.random() * 120, // kol ad eh byghayar el target
      size: minSz + Math.random() * varSz,    // el 7agm (random)
      visible: false,              // byebda makhabi, byetzahar ta3an ta3an
      rotate: 0, scaleX: 1, scaleY: 1, // el transform values lel khafaqan
    }));

    bRef.current = list;
    setButterflies([...list]) // byUpdate el state 3shan yrender

    // bybayen el farashat wa7da wa7da ma3 delay bein kol wa7da (stagger effect)
    list.forEach((_, i) => {
      setTimeout(() => {
        if (!bRef.current[i]) return;
        bRef.current[i] = { ...bRef.current[i], visible: true };
        setButterflies(prev =>
          prev.map((b, idx) => idx === i ? { ...b, visible: true } : b)
        );
      }, 300 + i * 130); // kol farasha byetzahar ba3d el tania bel 130ms
    });

    // ── El Animation Loop ────────────────────────────────────────────────────
    // da el loop el asa7i elly byeshte8'al kol frame (60fps)
    let time = 0;
    const animate = () => {
      time += 0.016; // taqriban 1/60 sanya (1 frame)
      const currentZones = getForbiddenZones(w, h)

      // byUpdate kol farasha
      bRef.current = bRef.current.map((b) => {
        // ── 7esab el khafaqan (wing flapping) ──────────────────────────────
        // byesta3mel el sin function 3shan ye3mel el animation el da3i2a lel khafaqan
        const flapCycle = Math.sin(time * b.flapSpeed + b.flapOffset)
        const scaleX    = 0.25 + Math.abs(flapCycle) * 0.75 // el gena7 byet3'ayer 3ard
        const scaleY    = 1    + Math.abs(flapCycle) * 0.06 // shwaya ta7rik ra2si

        // ── 7esab el 7araka (movement) ─────────────────────────────────────
        let { targetX, targetY, targetTimer, targetInterval, vx, vy } = b;
        targetTimer++;

        // lama el wa2t yegi aw el farasha wa2afet 2odam el target — yekhtaar target gedid
        if (targetTimer >= targetInterval || Math.hypot(targetX - b.x, targetY - b.y) < 15) {
          const { tx, ty } = pickTarget(b.x, b.y, w, h, currentZones)
          targetX = tx; targetY = ty;
          targetTimer = 0;
          targetInterval = 80 + Math.random() * 120;
        }

        // byhaseb el velocity el gedida (smooth movement ma3 inertia)
        const dx = targetX - b.x;
        const dy = targetY - b.y;
        const d  = Math.hypot(dx, dy) || 1  // el mas7a lel target
        // 0.92 = damping (bykhalli el 7araka na3ma), 0.6 = el sur3a el 2aswa
        const newVx = vx * 0.92 + (dx / d) * 0.6 * 0.08;
        const newVy = vy * 0.92 + (dy / d) * 0.6 * 0.08;

        let newX = b.x + newVx;
        let newY = b.y + newVy;

        // lo el mawde3 el gedid gowa el forbidden zone — wa2afha w khayyarha target tani
        if (isInsideForbidden(newX, newY, currentZones)) {
          newX = b.x; newY = b.y; // mesh bethitharrakesh
          const { tx, ty } = pickTarget(b.x, b.y, w, h, currentZones)
          targetX = tx; targetY = ty;
        }

        return {
          ...b,
          x: newX, y: newY,
          vx: newVx, vy: newVy,
          targetX, targetY, targetTimer, targetInterval,
          scaleX, scaleY,
          // el rotation byet7aseb 3ala 7asab el direction el 7araka — bydor shwaya na7yet el target
          rotate: Math.atan2(newVy, newVx) * (180 / Math.PI) * 0.2,
        };
      });

      setButterflies([...bRef.current]) // byUpdate el state kol frame
      animRef.current = requestAnimationFrame(animate) // byetlob el frame el gai
    };

    animRef.current = requestAnimationFrame(animate) // byebda el loop

    // cleanup: bywakef el animation loop lama el component yetsha7 aw el screen yetghayar
    return () => cancelAnimationFrame(animRef.current);
  }, [width, height]); // byrun tani lama el screen size yetghayar

  return (
    // el container bta3 el farashat — fixed 3ala el screen kolaha, mesh betakhod clicks
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9999 }}>
      {butterflies.map((b, i) => (
        <img
          key={i}
          src={butterflyImg}
          alt=""
          style={{
            position: "absolute",
            width: `${b.size}px`,
            left: 0, top: 0,  // el position btegeeli men el transform
            opacity: b.visible ? 0.7 : 0,     // byebda transparent w byetzahar ta3an
            transition: "opacity 2s ease",     // el fade in na3em (2 sanya)
            // el transform byet3amel el mawde3 w el rotation w el khafaqan kollohom
            transform: `translate(${b.x}px, ${b.y}px) rotate(${b.rotate}deg) scaleX(${b.scaleX}) scaleY(${b.scaleY})`,
            filter: "drop-shadow(0 0 12px rgba(255, 200, 80, 0.9))", // el glow el dahabi 7awaleha
            transformOrigin: "center center",
            willChange: "transform", // byakhbar el browser ena el transform hayetghayar keter (optimization)
          }}
        />
      ))}
    </div>
  );
}