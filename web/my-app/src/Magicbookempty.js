import React, { useEffect, useRef } from "react"
import Butterflies from "./Butterflies";
import openSound from "./magic-slow.mp3";
import sparkleSound from "./mixkit-fairy-glitter-867.mp3";
import bgSound from "./mixkit-relaxing-harp-sweep-2628.mp3";
import QUILL_IMG from "./quill.png"

const BOOK_W     = 640
const BOOK_H     = 380
const PAGE_W     = 292
const SPINE_W    = 24
const PAD_OUTER  = 16
const LINE_H     = 26
const CH_W       = 7.2
const TEXT_FONT  = "14px"
const TEXT_LEFT  = 38
const TEXT_RIGHT = 14
const QUILL_W    = 120
const QUILL_H    = 148
const QUILL_TIP_X = QUILL_W * 0.82
const QUILL_TIP_Y = QUILL_H * 0.88

export default function MagicBookEmpty({ leftText, rightText, caption }) {
  const LEFT_TXT  = leftText  || "Report Log\n\u2015\u2015\u2015\u2015\u2015\u2015\u2015\u2015\u2015\u2015\u2015\n\nDate: Today\n\nUpon thorough review\nof all submissions...\n\nNo reports have been\nfiled at this time.\n\nThe projects stand\nquite orderly.\n\n\u2015\u2015\u2015\u2015\u2015\u2015\u2015\u2015\u2015\u2015\u2015"
  const RIGHT_TXT = rightText || "Observations:\n\n\u201cAll is well within\nthe catalogue.\n\nNo misconduct,\nno violations found.\n\nThe admin may rest\nand take their tea.\u201d\n\n\u2014 The Registry\n\n\u2015\u2015\u2015\u2015\u2015\u2015\u2015\u2015\u2015\u2015\u2015"

  const sceneRef     = useRef(null)
  const timersRef    = useRef([])
  const typeRafRef   = useRef(null)
  const flipCountRef = useRef(0)
  const TOTAL_FLIPS  = 16
  const openAudio    = useRef(null)
  const sparkleAudio = useRef(null)
  const bgAudio      = useRef(null)

  useEffect(() => {
    openAudio.current    = new Audio(openSound)
    sparkleAudio.current = new Audio(sparkleSound)
    bgAudio.current      = new Audio(bgSound)

    openAudio.current.volume    = 0.4
    sparkleAudio.current.volume = 0.3
    bgAudio.current.volume      = 0.15

    let playCount = 0

    openAudio.current.onended = () => {
      setTimeout(() => { playTogether() }, 1900)
    }

    const playTogether = () => {
      if (playCount >= 4) return
      sparkleAudio.current.currentTime = 0
      bgAudio.current.currentTime      = 0
      sparkleAudio.current.play()
      bgAudio.current.play()
      playCount++
      bgAudio.current.onended = () => { playTogether() }
    }

    openAudio.current.play()
    startAll()

    return () => {
      timersRef.current.forEach(clearTimeout)
      if (typeRafRef.current) clearTimeout(typeRafRef.current)
    }
  }, [])

  function T(fn, ms) {
    const id = setTimeout(fn, ms)
    timersRef.current.push(id)
  }

  function easeInOut(t) { return t < 0.5 ? 2*t*t : -1+(4-2*t)*t }

  function animAngle(el, fromA, toA, dur, easeFn, cb) {
    const start = performance.now()
    function step(now) {
      let p = Math.min((now - start) / dur, 1)
      el.style.transform = `rotateY(${fromA + (toA - fromA) * easeFn(p)}deg)`
      if (p < 1) requestAnimationFrame(step)
      else if (cb) cb()
    }
    requestAnimationFrame(step)
  }

  function doFlip(onAllDone) {
    if (flipCountRef.current >= TOTAL_FLIPS) { onAllDone(); return }
    const fp = document.getElementById("bk-flipEl")
    if (!fp) return
    fp.style.display       = "block"
    fp.style.left          = (PAD_OUTER + PAGE_W + SPINE_W) + "px"
    fp.style.transformOrigin = "left center"
    animAngle(fp, 0, -180, 120 + Math.random() * 100, easeInOut, () => {
      fp.style.display    = "none"
      fp.style.transform  = "rotateY(0deg)"
      flipCountRef.current++
      setTimeout(() => doFlip(onAllDone), 30 + Math.random() * 50)
    })
  }

  function quillPos(text, isLeft) {
    const lines = text.split("\n")
    const lineIdx  = Math.min(lines.length - 1, 14)
    const lastLine = lines[Math.min(lines.length - 1, 14)]
    const charIdx  = lastLine.length

    let tipX, tipY

    if (isLeft) {
      const pageLeft = PAD_OUTER
      const maxX = pageLeft + PAGE_W - TEXT_RIGHT - 4
      const minX = pageLeft + TEXT_LEFT
      tipX = Math.min(Math.max(pageLeft + TEXT_LEFT + charIdx * CH_W, minX), maxX)
    } else {
      const pageLeft = PAD_OUTER + PAGE_W + SPINE_W
      const maxX = pageLeft + PAGE_W - TEXT_RIGHT - 4
      const minX = pageLeft + TEXT_LEFT
      tipX = Math.min(Math.max(pageLeft + TEXT_LEFT + charIdx * CH_W, minX), maxX)
    }

    const maxLines = Math.floor((BOOK_H - 40) / LINE_H) - 1
    const clampedLine = Math.min(lineIdx, maxLines)
    tipY = clampedLine * LINE_H + 20 + 8

    const qX = tipX - QUILL_TIP_X
    const qY = tipY - QUILL_TIP_Y

    return { qX, qY }
  }

  function typeAll(onDone) {
    const lEl = document.getElementById("bk-tLeft")
    const rEl = document.getElementById("bk-tRight")
    const qEl = document.getElementById("bk-quill")
    if (!lEl || !rEl || !qEl) return
    lEl.innerHTML = ""; rEl.innerHTML = ""
    qEl.style.opacity = "1"

    const fullL = LEFT_TXT, fullR = RIGHT_TXT
    const total = fullL.length + fullR.length
    let i = 0

    function tick() {
      let qX, qY

      if (i <= fullL.length) {
        const s = fullL.slice(0, i)
        lEl.innerHTML = s + '<span style="display:inline-block;width:1px;height:13px;background:#1a0600;vertical-align:text-bottom;animation:bkCurBlink 0.75s step-end infinite"></span>'
        ;({ qX, qY } = quillPos(s, true))
      } else {
        lEl.textContent = fullL
        const s = fullR.slice(0, i - fullL.length)
        rEl.innerHTML = s + '<span style="display:inline-block;width:1px;height:13px;background:#1a0600;vertical-align:text-bottom;animation:bkCurBlink 0.75s step-end infinite"></span>'
        ;({ qX, qY } = quillPos(s, false))
      }

      qEl.style.transform = `translate(${qX}px, ${qY}px) rotate(-18deg)`

      i++
      if (i <= total) typeRafRef.current = setTimeout(tick, 40 + Math.random() * 22)
      else {
        lEl.textContent = fullL; rEl.textContent = fullR
        qEl.style.opacity = "0"
        if (onDone) onDone()
      }
    }
    tick()
  }

  function startAll() {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
    if (typeRafRef.current) clearTimeout(typeRafRef.current)
    flipCountRef.current = 0

    const cbook = document.getElementById("bk-cbook")
    const obook = document.getElementById("bk-obook")
    const mglow = document.getElementById("bk-mglow")
    const cap   = document.getElementById("bk-cap")
    const pivot = document.getElementById("bk-pivot")
    const quill = document.getElementById("bk-quill")
    if (!cbook || !obook) return

    // ── إيقاف الـ float animation أثناء حركة الفتح ──
    pivot.style.animation  = "none"
    cbook.style.transition = ""; cbook.style.opacity = "1"
    obook.style.opacity    = "0"; obook.style.pointerEvents = "none"
    mglow.style.opacity    = "0"; cap.style.opacity   = "0"
    quill.style.opacity    = "0"; quill.style.transform = ""
    document.getElementById("bk-tLeft").textContent  = ""
    document.getElementById("bk-tRight").textContent = ""
    document.getElementById("bk-flipEl").style.display = "none"
    pivot.style.transition = "transform 1s ease"
    pivot.style.transform  = "rotateX(12deg) rotateY(0deg)"

    T(() => {
      pivot.style.transition = "transform 1.4s cubic-bezier(0.34,1.15,0.64,1)"
      pivot.style.transform  = "rotateX(10deg) rotateY(-12deg) scale(1.04)"
    }, 500)
    T(() => {
      pivot.style.transition = "transform 0.9s ease"
      pivot.style.transform  = "rotateX(10deg) rotateY(0deg) scale(1)"
    }, 1900)
    T(() => {
      cbook.style.transition = "opacity 0.4s ease"; cbook.style.opacity = "0"
      obook.style.transition = "opacity 0.4s ease"; obook.style.opacity = "1"
      obook.style.pointerEvents = "auto"; mglow.style.opacity = "1"
      // ── تشغيل الـ float animation بعد ما الكتاب يفتح ──
      setTimeout(() => {
        pivot.style.transition = ""
        pivot.style.animation = "bookFloat 3s ease-in-out infinite"
      }, 500)
    }, 2800)
    T(() => {
      doFlip(() => {
        T(() => {
          typeAll(() => {
            T(() => { cap.style.opacity = "1" }, 400)
          })
        }, 500)
      })
    }, 3400)
  }

  return (
    <>
      <style>{`
        @keyframes bookFloat {
          0%   { transform: rotateX(12deg) rotateY(0deg)    translateY(0px)   rotate(0deg);    }
          25%  { transform: rotateX(10deg) rotateY(2.5deg)  translateY(-12px) rotate(0.8deg);  }
         50%  { transform: rotateX(14deg) rotateY(-2deg)   translateY(-20px) rotate(-0.6deg); }
         75%  { transform: rotateX(10deg) rotateY(1.5deg)  translateY(-10px) rotate(0.5deg);  }
         100% { transform: rotateX(12deg) rotateY(0deg)    translateY(0px)   rotate(0deg);    }
}
        @keyframes bkSparkRise {
          0%   { opacity:0; transform:translateY(0) scale(5); }
          15%  { opacity:0.9; }
          100% { opacity:0; transform:translateY(-90px) translateX(var(--sdx)) scale(0); }
        }
        @keyframes bkCurBlink { 0%,100%{opacity:1} 50%{opacity:0} }
      `}</style>

      <div ref={sceneRef} style={{
        display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center",
        minHeight:"480px", padding:"2rem 1rem",
        background:"transparent",
        borderRadius:"16px", overflow:"visible",
        position:"relative",
      }}>
        <div id="bk-sparks" style={{position:"absolute",inset:0,pointerEvents:"none",overflow:"hidden"}} />
        <div id="bk-mglow" style={{
          position:"absolute", inset:"-30px",
          background:"radial-gradient(ellipse at 50% 50%, rgba(200,148,26,0.07) 0%, transparent 65%)",
          pointerEvents:"none", opacity:0,
          transition:"opacity 1.2s ease",
        }} />

        <Butterflies />

        <div style={{
          position:"relative",
          width: BOOK_W + "px",
          height: BOOK_H + "px",
          perspective:"2800px",
          marginBottom:"1rem",
        }}>
          <div id="bk-pivot" style={{
            position:"absolute", inset:0,
            transformStyle:"preserve-3d",
            transform:"rotateX(12deg) rotateY(0deg)",
            transition:"transform 1s ease",
          }}>

            {/* CLOSED BOOK */}
            <div id="bk-cbook" style={{
              position:"absolute", left:"50%", top:"50%",
              width:"270px", height:"340px",
              transform:"translate(-50%,-50%)",
              transformStyle:"preserve-3d",
            }}>
              <div style={{position:"absolute",left:"-20px",top:0,bottom:0,width:"20px",background:"linear-gradient(to right,#1a0804,#5a2208,#3a1404)",borderRadius:"4px 0 0 4px",border:"1px solid #7a3010",borderRight:"none"}} />
              <div style={{position:"absolute",right:"-8px",top:"5px",bottom:"5px",width:"8px",background:"repeating-linear-gradient(to bottom,#f5edd8 0px,#e8dcc0 1px,#f2e6cc 2px,#ede0c4 3px)",borderRadius:"0 2px 2px 0"}} />
              <div id="bk-cbody" style={{position:"absolute",inset:0,borderRadius:"3px 10px 10px 3px",overflow:"hidden"}}>
                <div style={{position:"absolute",inset:0,background:"linear-gradient(160deg,#6b2f0c 0%,#3d1604 25%,#7a3510 50%,#2a0e02 75%,#5a2408 100%)",borderRadius:"3px 10px 10px 3px",border:"1.5px solid #9b5020"}} />
                <div style={{position:"absolute",top:"14px",left:"18px",right:"14px",bottom:"14px",border:"1px solid rgba(200,140,50,0.3)",borderRadius:"2px"}} />
                <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-55%)",textAlign:"center",color:"#c8941a",fontFamily:"Georgia,serif",textShadow:"0 0 10px rgba(200,148,26,0.7)"}}>
                  <div style={{fontSize:"11px",letterSpacing:"3.5px",opacity:0.9,marginBottom:"8px"}}>ADMIN</div>
                  <div style={{fontSize:"22px",opacity:0.5,marginBottom:"8px"}}>✦</div>
                  <div style={{fontSize:"11px",letterSpacing:"3.5px",opacity:0.9}}>REGISTRY</div>
                </div>
              </div>
              <div style={{position:"absolute",right:"-13px",top:"50%",transform:"translateY(-50%)",width:"15px",height:"34px",background:"linear-gradient(to bottom,#d4a020,#8b6010,#c8941a,#7a5010,#d4a020)",borderRadius:"0 4px 4px 0"}} />
            </div>

            {/* OPEN BOOK */}
            <div id="bk-obook" style={{
              position:"absolute", left:"50%", top:"50%",
              transform:"translate(-50%,-50%)",
              width: BOOK_W + "px",
              height: BOOK_H + "px",
              opacity:0, pointerEvents:"none",
              transformStyle:"preserve-3d",
            }}>

              {/* LEFT PAGE */}
              <div style={{
                position:"absolute", top:0, bottom:0,
                left: PAD_OUTER + "px",
                width: PAGE_W + "px",
                overflow:"hidden",
              }}>
                <div style={{position:"absolute",inset:0,background:`repeating-linear-gradient(0deg,transparent 0px,transparent ${LINE_H-1}px,rgba(160,110,60,0.22) ${LINE_H-1}px,rgba(160,110,60,0.22) ${LINE_H}px),linear-gradient(to bottom left,#f7eed8,#f0e4c4,#eadcb8,#f0e6ca)`,boxShadow:"inset -6px 0 16px rgba(100,60,20,0.25)",border:"1px solid rgba(160,110,50,0.5)",borderRight:"none",borderRadius:"4px 0 0 4px"}} />
                <div style={{position:"absolute",top:0,bottom:0,left:"32px",width:"1px",background:"rgba(180,60,60,0.35)"}} />
                <div id="bk-tLeft" style={{
                  position:"absolute",
                  top:"20px",
                  left: TEXT_LEFT + "px",
                  right: TEXT_RIGHT + "px",
                  fontFamily:"'IM Fell English',Georgia,serif",
                  fontStyle:"italic",
                  fontSize: TEXT_FONT,
                  color:"#1a0800",
                  lineHeight: LINE_H + "px",
                  whiteSpace:"pre-wrap",
                  wordBreak:"break-word",
                  letterSpacing:"0.4px",
                }} />
              </div>

              {/* SPINE */}
              <div style={{
                position:"absolute",
                left: (PAD_OUTER + PAGE_W) + "px",
                top:0, bottom:0,
                width: SPINE_W + "px",
                background:"linear-gradient(to right,#1a0804,#4a1e08,#2a1004,#4a1e08,#1a0804)",
                borderLeft:"1.5px solid #8b4010",
                borderRight:"1.5px solid #8b4010",
                boxShadow:"0 0 18px rgba(0,0,0,0.7)",
                zIndex:10,
              }} />

              {/* RIGHT PAGE */}
              <div style={{
                position:"absolute", top:0, bottom:0,
                left: (PAD_OUTER + PAGE_W + SPINE_W) + "px",
                width: PAGE_W + "px",
                overflow:"hidden",
              }}>
                <div style={{position:"absolute",inset:0,background:`repeating-linear-gradient(0deg,transparent 0px,transparent ${LINE_H-1}px,rgba(160,110,60,0.22) ${LINE_H-1}px,rgba(160,110,60,0.22) ${LINE_H}px),linear-gradient(to bottom right,#f7eed8,#f0e4c4,#ede0bc,#f2e8cc)`,boxShadow:"inset 6px 0 16px rgba(100,60,20,0.25)",border:"1px solid rgba(160,110,50,0.5)",borderLeft:"none",borderRadius:"0 4px 4px 0"}} />
                <div style={{position:"absolute",top:0,bottom:0,right:"32px",width:"1px",background:"rgba(180,60,60,0.35)"}} />
                <div id="bk-tRight" style={{
                  position:"absolute",
                  top:"20px",
                  left: TEXT_LEFT + "px",
                  right: TEXT_RIGHT + "px",
                  fontFamily:"'IM Fell English',Georgia,serif",
                  fontStyle:"italic",
                  fontSize: TEXT_FONT,
                  color:"#1a0800",
                  lineHeight: LINE_H + "px",
                  whiteSpace:"pre-wrap",
                  wordBreak:"break-word",
                  letterSpacing:"0.4px",
                }} />
              </div>

              {/* FLIP PAGE */}
              <div id="bk-flipEl" style={{
                position:"absolute", top:0, bottom:0,
                width: PAGE_W + "px",
                transformStyle:"preserve-3d",
                transformOrigin:"left center",
                zIndex:20, display:"none",
                left: (PAD_OUTER + PAGE_W + SPINE_W) + "px",
              }}>
                <div style={{position:"absolute",inset:0,backfaceVisibility:"hidden",background:"repeating-linear-gradient(0deg,transparent 0px,transparent 25px,rgba(160,110,60,0.2) 25px,rgba(160,110,60,0.2) 26px),linear-gradient(to left,#f5edd5,#ede0bc)",border:"1px solid rgba(160,110,50,0.4)",borderRadius:"0 4px 4px 0"}} />
                <div style={{position:"absolute",inset:0,backfaceVisibility:"hidden",transform:"rotateY(180deg)",background:"repeating-linear-gradient(0deg,transparent 0px,transparent 25px,rgba(160,110,60,0.2) 25px,rgba(160,110,60,0.2) 26px),linear-gradient(to right,#f0e4c4,#e8d8b0)",border:"1px solid rgba(160,110,50,0.4)",borderRadius:"4px 0 0 4px"}} />
              </div>

              {/* QUILL */}
              <img
                id="bk-quill"
                src={QUILL_IMG}
                width={QUILL_W}
                height={QUILL_H}
                style={{
                  position:"absolute",
                  top:0, left:0,
                  opacity:0,
                  pointerEvents:"none",
                  zIndex:40,
                  transition:"opacity 0.7s ease",
                  filter:"drop-shadow(0 2px 8px rgba(180,120,0,0.5))",
                  transformOrigin:"top left",
                }}
                alt="quill"
              />
            </div>

          </div>
        </div>

        {/* Caption */}
        <div id="bk-cap" style={{
          fontFamily:"'IM Fell English',Georgia,serif",
          fontSize:"14px", color:"rgba(80,50,20,0.6)",
          letterSpacing:"2.5px", textAlign:"center",
          opacity:0, transition:"opacity 1.2s ease",
          fontStyle:"italic",
        }}>
          {caption || "— no reports to review —"}
        </div>
      </div>
    </>
  )
}