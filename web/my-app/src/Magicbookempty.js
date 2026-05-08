import React, { useEffect, useRef, useState } from "react"
import Butterflies from "./Butterflies";
import openSound from "./magic-slow.mp3";
import sparkleSound from "./mixkit-fairy-glitter-867.mp3";
import bgSound from "./mixkit-relaxing-harp-sweep-2628.mp3";
import QUILL_IMG from "./quill.png"

// ── Mobile hook ──────────────────────────────────────────────────────────────
// da hook byet check el screen 3'eer mobile wala la (ta7t el breakpoint)
// byestad3i re-render lama el screen size yetghayar
function useIsMobile(bp = 768) {
  const [m, setM] = useState(window.innerWidth < bp)
  useEffect(() => {
    const h = () => setM(window.innerWidth < bp)
    window.addEventListener("resize", h)
    // cleanup: mesh nesnazel el event listener lama el component yetsha7
    return () => window.removeEventListener("resize", h)
  }, [bp])
  return m
}

export default function MagicBookEmpty({ leftText, rightText, caption }) {
  const isMobile = useIsMobile()

  // ── Responsive dimensions ─────────────────────────────────────────────────
  // el ab3ad btetghayar 3ala 7asab el screen (mobile aw desktop)
  const BOOK_W    = isMobile ? Math.min(window.innerWidth - 24, 340) : 640  // 3ard el ketab
  const BOOK_H    = isMobile ? 240 : 380                                     // tool el ketab
  const PAGE_W    = isMobile ? Math.floor((BOOK_W - (isMobile ? 16 : 56)) / 2) : 292 // 3ard el sa7fa
  const SPINE_W   = isMobile ? 14 : 24    // 3ard el nas el nos (el 3amood bein el sa7feteen)
  const PAD_OUTER = isMobile ? 4  : 16    // el padding el bara
  const LINE_H    = isMobile ? 18 : 26    // tool el se6r
  const CH_W      = isMobile ? 5  : 7.2  // 3ard el 7arf el wa7ed (3shan n7aseb el quill position)
  const TEXT_FONT = isMobile ? "10px" : "14px"  // font size el nas
  const TEXT_LEFT = isMobile ? 22 : 38   // el mas7a men el shemal lel nas
  const TEXT_RIGHT= isMobile ? 8  : 14   // el mas7a men el yemeen lel nas
  const QUILL_W   = isMobile ? 72 : 120  // 3ard soret el quill
  const QUILL_H   = isMobile ? 90 : 148  // tool soret el quill
  const QUILL_TIP_X = QUILL_W * 0.82     // mawde3 ras el quill (el x) 3ala el soura
  const QUILL_TIP_Y = QUILL_H * 0.88     // mawde3 ras el quill (el y) 3ala el soura

  // el nas el byet3amel fel ketab (mobile aw desktop)
  const LEFT_TXT  = leftText  || "Report Log\n\u2015\u2015\u2015\u2015\u2015\u2015\u2015\n\nDate: Today\n\nNo reports have\nbeen filed.\n\nAll is orderly.\n\n\u2015\u2015\u2015\u2015\u2015\u2015\u2015"
  const RIGHT_TXT = rightText || "Observations:\n\n\u201cAll is well.\n\nNo violations.\n\nThe admin may\nrest easy.\u201d\n\n\u2014 The Registry\n\n\u2015\u2015\u2015\u2015\u2015\u2015\u2015"

  // el nas el kamil byet3amel bas f el desktop (aktar tafaseel)
  const LEFT_TXT_FULL  = isMobile ? LEFT_TXT  : (leftText  || "Report Log\n\u2015\u2015\u2015\u2015\u2015\u2015\u2015\u2015\u2015\u2015\u2015\n\nDate: Today\n\nUpon thorough review\nof all submissions...\n\nNo reports have been\nfiled at this time.\n\nThe projects stand\nquite orderly.\n\n\u2015\u2015\u2015\u2015\u2015\u2015\u2015\u2015\u2015\u2015\u2015")
  const RIGHT_TXT_FULL = isMobile ? RIGHT_TXT : (rightText || "Observations:\n\n\u201cAll is well within\nthe catalogue.\n\nNo misconduct,\nno violations found.\n\nThe admin may rest\nand take their tea.\u201d\n\n\u2014 The Registry\n\n\u2015\u2015\u2015\u2015\u2015\u2015\u2015\u2015\u2015\u2015\u2015")

  // refs bnestha3melha 3shan nwsal lel DOM elements w nel3ab bel animation
  const sceneRef     = useRef(null)
  const timersRef    = useRef([])      // kollekshon el timeouts 3shan ne2dar nemsa7hom
  const typeRafRef   = useRef(null)    // el timeout el khas bel typing animation
  const flipCountRef = useRef(0)       // 3adad el page flips elly etmelet
  const TOTAL_FLIPS  = isMobile ? 8 : 16  // el 3adad el koli lel flips (mobile a2al)
  const openAudio    = useRef(null)    // el sound el byet3amel lama el ketab yefta7
  const sparkleAudio = useRef(null)    // sound el sparkle/glitter
  const bgAudio      = useRef(null)    // el background music

  // Re-run animation lama el screen size yetghayar (mobile <-> desktop)
  const prevMobileRef = useRef(isMobile)
  useEffect(() => {
    if (prevMobileRef.current !== isMobile) {
      prevMobileRef.current = isMobile
      startAll() // bya3mel restart lel animation kolaha
    }
  }, [isMobile])

  // da byeshtagh el awwel marra bass — byhayez el sounds w byebda el animation
  useEffect(() => {
    openAudio.current    = new Audio(openSound)
    sparkleAudio.current = new Audio(sparkleSound)
    bgAudio.current      = new Audio(bgSound)

    // el volumes — el open sound a3la, el background a2al
    openAudio.current.volume    = 0.4
    sparkleAudio.current.volume = 0.3
    bgAudio.current.volume      = 0.15

    let playCount = 0

    // lama el open sound yekhalas, byebda el sparkle + background ma3an
    openAudio.current.onended = () => {
      setTimeout(() => { playTogether() }, 1900)
    }

    // da byle3ab el sparkle + background ma3an, w bykarrar 4 marrat
    const playTogether = () => {
      if (playCount >= 4) return
      sparkleAudio.current.currentTime = 0
      bgAudio.current.currentTime      = 0
      sparkleAudio.current.play().catch(() => {})
      bgAudio.current.play().catch(() => {})
      playCount++
      bgAudio.current.onended = () => { playTogether() } // bykarrar lama yekhalas
    }

    openAudio.current.play().catch(() => {}) // byebda el open sound
    startAll() // byebda el animation

    // cleanup: bymsa7 kol el timeouts lama el component yetsha7
    return () => {
      timersRef.current.forEach(clearTimeout)
      if (typeRafRef.current) clearTimeout(typeRafRef.current)
    }
  }, [])

  // helper function 3shan ne3mel setTimeout w neftakaro f el timersRef
  function T(fn, ms) {
    const id = setTimeout(fn, ms)
    timersRef.current.push(id)
  }

  // easing function — bya3mel el animation teb2a na3ma (msh 7etta)
  function easeInOut(t) { return t < 0.5 ? 2*t*t : -1+(4-2*t)*t }

  // da bya3mel animation 3ala el rotateY bta3 ay element (lel page flip effect)
  // fromA: el angle el bada2i, toA: el angle el nehay, dur: el mudda, cb: callback lama yekhalas
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

  // da by7aseb fein el quill lazem yeb2a (3ala 7asab el nas elly etketeb lessa)
  // byet7aseb 3ala 7asab el se6r el akherani w el 7arf el akherani
  function quillPos(text, isLeft) {
    const lines = text.split("\n")
    const lineIdx  = Math.min(lines.length - 1, 14)       // ma3andaksh aktar men 14 se6r
    const lastLine = lines[Math.min(lines.length - 1, 14)]
    const charIdx  = lastLine.length                       // 3adad el 7oroof fel se6r el akherani

    let tipX, tipY

    if (isLeft) {
      // el sa7fa el shemaliyya — byheseb el x men el shemal
      const pageLeft = PAD_OUTER
      const maxX = pageLeft + PAGE_W - TEXT_RIGHT - 4
      const minX = pageLeft + TEXT_LEFT
      tipX = Math.min(Math.max(pageLeft + TEXT_LEFT + charIdx * CH_W, minX), maxX)
    } else {
      // el sa7fa el yeminia — byheseb el x men el yemeen
      const pageLeft = PAD_OUTER + PAGE_W + SPINE_W
      const maxX = pageLeft + PAGE_W - TEXT_RIGHT - 4
      const minX = pageLeft + TEXT_LEFT
      tipX = Math.min(Math.max(pageLeft + TEXT_LEFT + charIdx * CH_W, minX), maxX)
    }

    // byheseb el y 3ala 7asab raqam el se6r
    const maxLines = Math.floor((BOOK_H - 40) / LINE_H) - 1
    const clampedLine = Math.min(lineIdx, maxLines)
    tipY = clampedLine * LINE_H + 20 + 8

    // byt7awel coordinates el ras le coordinates el quill kolaha (3shan yeb2a fe el position el sa7
    const qX = tipX - QUILL_TIP_X
    const qY = tipY - QUILL_TIP_Y

    return { qX, qY }
  }

  // da el typing animation — byekteb el nas 7arf 7arf zay ma el quill bekteb
  // byebda bel sa7fa el shemaliyya, lama yekhalas yekmel el sa7fa el yeminia
  function typeAll(onDone) {
    const lEl = document.getElementById("bk-tLeft")   // el sa7fa el shemaliyya
    const rEl = document.getElementById("bk-tRight")  // el sa7fa el yeminia
    const qEl = document.getElementById("bk-quill")   // el quill
    if (!lEl || !rEl || !qEl) return
    lEl.innerHTML = ""; rEl.innerHTML = ""
    qEl.style.opacity = "1" // bybayen el quill

    const fullL = LEFT_TXT_FULL, fullR = RIGHT_TXT_FULL
    const total = fullL.length + fullR.length
    let i = 0

    function tick() {
      let qX, qY

      if (i <= fullL.length) {
        // lessa bekteb fel sa7fa el shemaliyya
        const s = fullL.slice(0, i)
        // byda7al cursor blink 3ala akher el nas
        lEl.innerHTML = s + '<span style="display:inline-block;width:1px;height:13px;background:#1a0600;vertical-align:text-bottom;animation:bkCurBlink 0.75s step-end infinite"></span>'
        ;({ qX, qY } = quillPos(s, true))
      } else {
        // khalas el sa7fa el shemaliyya, dabba3 byal yemenia
        lEl.textContent = fullL
        const s = fullR.slice(0, i - fullL.length)
        rEl.innerHTML = s + '<span style="display:inline-block;width:1px;height:13px;background:#1a0600;vertical-align:text-bottom;animation:bkCurBlink 0.75s step-end infinite"></span>'
        ;({ qX, qY } = quillPos(s, false))
      }

      // byharrak el quill 3ala 7asab el mawde3 el 7ali
      qEl.style.transform = `translate(${qX}px, ${qY}px) rotate(-18deg)`

      i++
      // bykarrar kol shwaya (mobile as3a shwaya)
      if (i <= total) typeRafRef.current = setTimeout(tick, isMobile ? 25 + Math.random() * 15 : 40 + Math.random() * 22)
      else {
        // lama yekhalas el typing:
        lEl.textContent = fullL; rEl.textContent = fullR
        qEl.style.opacity = "0" // bykhabi el quill
        if (onDone) onDone()
      }
    }
    tick()
  }

  // da el function el asa7i elly byebda el animation kolaha men el awwel
  // byretset el state w byebda el sequence el ta7t da
  function startAll() {
    // bymsa7 kol el timeouts el 2adima
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
    if (typeRafRef.current) clearTimeout(typeRafRef.current)
    flipCountRef.current = 0

    // bygebli el elements el asa7iya men el DOM
    const cbook = document.getElementById("bk-cbook")  // el ketab el ma2fool
    const obook = document.getElementById("bk-obook")  // el ketab el maftu7
    const mglow = document.getElementById("bk-mglow")  // el glow wara el ketab
    const cap   = document.getElementById("bk-cap")    // el caption ta7t
    const pivot = document.getElementById("bk-pivot")  // el container el byet3amel el 3D rotation
    const quill = document.getElementById("bk-quill")  // el quill
    if (!cbook || !obook) return

    // reset kol 7aga lel state el awweli
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

    // ── Sequence el animation ──────────────────────────────────────────────
    // Step 1 (500ms): el ketab byetharrak shwaya lel yemeen (zay eno byet3emel attention)
    T(() => {
      pivot.style.transition = "transform 1.4s cubic-bezier(0.34,1.15,0.64,1)"
      pivot.style.transform  = "rotateX(10deg) rotateY(-12deg) scale(1.04)"
    }, 500)

    // Step 2 (1900ms): byerga3 lel nos
    T(() => {
      pivot.style.transition = "transform 0.9s ease"
      pivot.style.transform  = "rotateX(10deg) rotateY(0deg) scale(1)"
    }, 1900)

    // Step 3 (2800ms): byeftah el ketab — bykhabi el closed w bybayen el open
    T(() => {
      cbook.style.transition = "opacity 0.4s ease"; cbook.style.opacity = "0"
      obook.style.transition = "opacity 0.4s ease"; obook.style.opacity = "1"
      obook.style.pointerEvents = "auto"; mglow.style.opacity = "1"
      // ba3d shwaya byebda el floating animation
      setTimeout(() => {
        pivot.style.transition = ""
        pivot.style.animation = "bookFloat 3s ease-in-out infinite"
      }, 500)
    }, 2800)

    // Step 4 (3400ms): byebda el page flips, lama yekhalas byebda el typing
    T(() => {
      doFlip(() => {
        T(() => {
          typeAll(() => {
            // lama el typing yekhalas bybayen el caption
            T(() => { cap.style.opacity = "1" }, 400)
          })
        }, 500)
      })
    }, 3400)
  }

  // da byعمل animation lel page flip (el sa7fa btetlef men el yemeen lel shemal)
  // bykarrar recursively lela7 yewsal lel TOTAL_FLIPS
  function doFlip(onAllDone) {
    if (flipCountRef.current >= TOTAL_FLIPS) { onAllDone(); return } // khals el flips kollaha
    const fp = document.getElementById("bk-flipEl")
    if (!fp) return
    fp.style.display       = "block"
    fp.style.left          = (PAD_OUTER + PAGE_W + SPINE_W) + "px"
    fp.style.transformOrigin = "left center" // byetlef men el nas (min el spine)
    // byعمل animation men 0 le -180 degree (rotateY) = byet7awel el sa7fa
    animAngle(fp, 0, -180, 120 + Math.random() * 100, easeInOut, () => {
      fp.style.display    = "none"
      fp.style.transform  = "rotateY(0deg)"
      flipCountRef.current++
      // ta7an shwaya ba3den yعمل flip tani
      setTimeout(() => doFlip(onAllDone), 30 + Math.random() * 50)
    })
  }

  // ── Closed book sizes ─────────────────────────────────────────────────────
  // el ketab el ma2fool a8'ar men el maftu7
  const CB_W = isMobile ? 160 : 270
  const CB_H = isMobile ? 200 : 340

  return (
    <>
      <style>{`
        /* el floating animation bta3et el ketab — byetharrak le fo2 w ta7t shwaya */
        @keyframes bookFloat {
          0%   { transform: rotateX(12deg) rotateY(0deg)    translateY(0px)   rotate(0deg);    }
          25%  { transform: rotateX(10deg) rotateY(2.5deg)  translateY(-12px) rotate(0.8deg);  }
          50%  { transform: rotateX(14deg) rotateY(-2deg)   translateY(-20px) rotate(-0.6deg); }
          75%  { transform: rotateX(10deg) rotateY(1.5deg)  translateY(-10px) rotate(0.5deg);  }
          100% { transform: rotateX(12deg) rotateY(0deg)    translateY(0px)   rotate(0deg);    }
        }
        /* el sparkle animation — el nogo2 el bet6la3 fo2 */
        @keyframes bkSparkRise {
          0%   { opacity:0; transform:translateY(0) scale(5); }
          15%  { opacity:0.9; }
          100% { opacity:0; transform:translateY(-90px) translateX(var(--sdx)) scale(0); }
        }
        /* el cursor el bya3mel blink gowa el nas el byet3amel */
        @keyframes bkCurBlink { 0%,100%{opacity:1} 50%{opacity:0} }
      `}</style>

      {/* el scene el asa7iya — el wrapper el kbeer */}
      <div ref={sceneRef} style={{
        display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center",
        minHeight: isMobile ? "320px" : "480px",
        padding: isMobile ? "1rem 0.5rem" : "2rem 1rem",
        background:"transparent",
        borderRadius:"16px", overflow:"visible",
        position:"relative",
        width: "100%",
        boxSizing: "border-box",
      }}>
        {/* el container bta3 el sparks (el nogo2 el bet6la3) */}
        <div id="bk-sparks" style={{position:"absolute",inset:0,pointerEvents:"none",overflow:"hidden"}} />

        {/* el glow el dahabi wara el ketab — byetbayen lama el ketab yeftah */}
        <div id="bk-mglow" style={{
          position:"absolute", inset:"-30px",
          background:"radial-gradient(ellipse at 50% 50%, rgba(200,148,26,0.07) 0%, transparent 65%)",
          pointerEvents:"none", opacity:0,
          transition:"opacity 1.2s ease",
        }} />

        {/* el farashaat — mesh btet3amel fel mobile 3shan el performance */}
        <Butterflies />

        {/* el container el kbeer bta3 el ketab — byewfar el 3D perspective */}
        <div style={{
          position:"relative",
          width: BOOK_W + "px",
          height: BOOK_H + "px",
          perspective: isMobile ? "1400px" : "2800px", // kol ma el perspective akbar kol ma el 3D a2al
          marginBottom:"1rem",
          maxWidth: "100%",
        }}>
          {/* el pivot — da el element elly byet3amel 3aleeh el 3D rotations kollaha */}
          <div id="bk-pivot" style={{
            position:"absolute", inset:0,
            transformStyle:"preserve-3d",
            transform:"rotateX(12deg) rotateY(0deg)",
            transition:"transform 1s ease",
          }}>

            {/* ── EL KETAB EL MA2FOOL ────────────────────────────────────── */}
            {/* byet3amel fi el awwel, ba3deen byetkhabi lama el ketab yeftah */}
            <div id="bk-cbook" style={{
              position:"absolute", left:"50%", top:"50%",
              width: CB_W + "px",
              height: CB_H + "px",
              transform:"translate(-50%,-50%)",
              transformStyle:"preserve-3d",
            }}>
              {/* el nas el yemania (el 3'ala2 el yemaniyya) */}
              <div style={{
                position:"absolute",
                left: isMobile ? "-12px" : "-20px",
                top:0, bottom:0,
                width: isMobile ? "12px" : "20px",
                background:"linear-gradient(to right,#1a0804,#5a2208,#3a1404)",
                borderRadius:"4px 0 0 4px",
                border:"1px solid #7a3010",
                borderRight:"none",
              }} />
              {/* el pages el 2adima (el sof7at el zahr el byetbayen men el yemeen) */}
              <div style={{
                position:"absolute",
                right: isMobile ? "-5px" : "-8px",
                top:"5px", bottom:"5px",
                width: isMobile ? "5px" : "8px",
                background:"repeating-linear-gradient(to bottom,#f5edd8 0px,#e8dcc0 1px,#f2e6cc 2px,#ede0c4 3px)",
                borderRadius:"0 2px 2px 0",
              }} />
              {/* el body el asa7i lel ketab el ma2fool */}
              <div id="bk-cbody" style={{position:"absolute",inset:0,borderRadius:"3px 10px 10px 3px",overflow:"hidden"}}>
                {/* el 8'ela2 el boni el da7mi */}
                <div style={{position:"absolute",inset:0,background:"linear-gradient(160deg,#6b2f0c 0%,#3d1604 25%,#7a3510 50%,#2a0e02 75%,#5a2408 100%)",borderRadius:"3px 10px 10px 3px",border:"1.5px solid #9b5020"}} />
                {/* el border el dahabi el gowa */}
                <div style={{position:"absolute",top:"14px",left:"18px",right:"14px",bottom:"14px",border:"1px solid rgba(200,140,50,0.3)",borderRadius:"2px"}} />
                {/* el nas "ADMIN REGISTRY" fel nos */}
                <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-55%)",textAlign:"center",color:"#c8941a",fontFamily:"Georgia,serif",textShadow:"0 0 10px rgba(200,148,26,0.7)"}}>
                  <div style={{fontSize: isMobile ? "8px" : "11px",letterSpacing:"3.5px",opacity:0.9,marginBottom:"8px"}}>ADMIN</div>
                  <div style={{fontSize: isMobile ? "16px" : "22px",opacity:0.5,marginBottom:"8px"}}>✦</div>
                  <div style={{fontSize: isMobile ? "8px" : "11px",letterSpacing:"3.5px",opacity:0.9}}>REGISTRY</div>
                </div>
              </div>
              {/* el clasp — el 2afla el dahabi 3ala el ketab */}
              <div style={{
                position:"absolute",
                right: isMobile ? "-8px" : "-13px",
                top:"50%", transform:"translateY(-50%)",
                width: isMobile ? "9px" : "15px",
                height: isMobile ? "20px" : "34px",
                background:"linear-gradient(to bottom,#d4a020,#8b6010,#c8941a,#7a5010,#d4a020)",
                borderRadius:"0 4px 4px 0",
              }} />
            </div>

            {/* ── EL KETAB EL MAFTU7 ────────────────────────────────────── */}
            {/* byebda makhabi, byetbayen lama el ketab yeftah */}
            <div id="bk-obook" style={{
              position:"absolute", left:"50%", top:"50%",
              transform:"translate(-50%,-50%)",
              width: BOOK_W + "px",
              height: BOOK_H + "px",
              opacity:0, pointerEvents:"none",
              transformStyle:"preserve-3d",
            }}>

              {/* ── EL SA7FA EL SHEMALIYYA (LEFT PAGE) ─────────────────── */}
              <div style={{
                position:"absolute", top:0, bottom:0,
                left: PAD_OUTER + "px",
                width: PAGE_W + "px",
                overflow:"hidden",
              }}>
                {/* el background bta3 el sa7fa — fel7a bel 5etoot el ofqiyya */}
                <div style={{position:"absolute",inset:0,background:`repeating-linear-gradient(0deg,transparent 0px,transparent ${LINE_H-1}px,rgba(160,110,60,0.22) ${LINE_H-1}px,rgba(160,110,60,0.22) ${LINE_H}px),linear-gradient(to bottom left,#f7eed8,#f0e4c4,#eadcb8,#f0e6ca)`,boxShadow:"inset -6px 0 16px rgba(100,60,20,0.25)",border:"1px solid rgba(160,110,50,0.5)",borderRight:"none",borderRadius:"4px 0 0 4px"}} />
                {/* el 5et el a7mar 3ala el shemal (bas f el desktop) */}
                {!isMobile && <div style={{position:"absolute",top:0,bottom:0,left:"32px",width:"1px",background:"rgba(180,60,60,0.35)"}} />}
                {/* el text el byet3amel hena 7arf 7arf */}
                <div id="bk-tLeft" style={{
                  position:"absolute",
                  top: isMobile ? "10px" : "20px",
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

              {/* ── EL NAS (SPINE) ──────────────────────────────────────── */}
              {/* da el 3amood el nos bein el sa7feteen — el gezo2 el da7mi el 3ami2 */}
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

              {/* ── EL SA7FA EL YEMINIA (RIGHT PAGE) ──────────────────── */}
              <div style={{
                position:"absolute", top:0, bottom:0,
                left: (PAD_OUTER + PAGE_W + SPINE_W) + "px",
                width: PAGE_W + "px",
                overflow:"hidden",
              }}>
                {/* el background bta3 el sa7fa el yemenia */}
                <div style={{position:"absolute",inset:0,background:`repeating-linear-gradient(0deg,transparent 0px,transparent ${LINE_H-1}px,rgba(160,110,60,0.22) ${LINE_H-1}px,rgba(160,110,60,0.22) ${LINE_H}px),linear-gradient(to bottom right,#f7eed8,#f0e4c4,#ede0bc,#f2e8cc)`,boxShadow:"inset 6px 0 16px rgba(100,60,20,0.25)",border:"1px solid rgba(160,110,50,0.5)",borderLeft:"none",borderRadius:"0 4px 4px 0"}} />
                {/* el 5et el a7mar 3ala el yemeen (bas f el desktop) */}
                {!isMobile && <div style={{position:"absolute",top:0,bottom:0,right:"32px",width:"1px",background:"rgba(180,60,60,0.35)"}} />}
                {/* el text bta3 el sa7fa el yemenia */}
                <div id="bk-tRight" style={{
                  position:"absolute",
                  top: isMobile ? "10px" : "20px",
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

              {/* ── EL SA7FA EL BET3AMEL FLIP ──────────────────────────── */}
              {/* da el element elly byet3amel animation lama el sa7fa btet2alab */}
              {/* byebda hidden, byetbayen bas lama el doFlip function teshte8'al */}
              <div id="bk-flipEl" style={{
                position:"absolute", top:0, bottom:0,
                width: PAGE_W + "px",
                transformStyle:"preserve-3d",
                transformOrigin:"left center", // byetlef men el spine
                zIndex:20, display:"none",
                left: (PAD_OUTER + PAGE_W + SPINE_W) + "px",
              }}>
                {/* el we2h el amami lel sa7fa el bet2alab */}
                <div style={{position:"absolute",inset:0,backfaceVisibility:"hidden",background:`repeating-linear-gradient(0deg,transparent 0px,transparent ${LINE_H - 1}px,rgba(160,110,60,0.2) ${LINE_H - 1}px,rgba(160,110,60,0.2) ${LINE_H}px),linear-gradient(to left,#f5edd5,#ede0bc)`,border:"1px solid rgba(160,110,50,0.4)",borderRadius:"0 4px 4px 0"}} />
                {/* el dahri lel sa7fa el bet2alab (byet3amel lama el rotation > 90) */}
                <div style={{position:"absolute",inset:0,backfaceVisibility:"hidden",transform:"rotateY(180deg)",background:`repeating-linear-gradient(0deg,transparent 0px,transparent ${LINE_H - 1}px,rgba(160,110,60,0.2) ${LINE_H - 1}px,rgba(160,110,60,0.2) ${LINE_H}px),linear-gradient(to right,#f0e4c4,#e8d8b0)`,border:"1px solid rgba(160,110,50,0.4)",borderRadius:"4px 0 0 4px"}} />
              </div>

              {/* ── EL QUILL ────────────────────────────────────────────── */}
              {/* da el resha btet7arrak ma3 el typing animation */}
              {/* position btetghayar kol tick 3ala 7asab el 7arf elly etketeb */}
              <img
                id="bk-quill"
                src={QUILL_IMG}
                width={QUILL_W}
                height={QUILL_H}
                style={{
                  position:"absolute",
                  top:0, left:0,
                  opacity:0,            // byebda makhabi
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

        {/* ── EL CAPTION ──────────────────────────────────────────────────── */}
        {/* byetbayen ta7t el ketab ba3d ma el typing yekhalas */}
        <div id="bk-cap" style={{
          fontFamily:"'IM Fell English',Georgia,serif",
          fontSize: isMobile ? "12px" : "14px",
          color:"rgba(80,50,20,0.6)",
          letterSpacing: isMobile ? "1.5px" : "2.5px",
          textAlign:"center",
          opacity:0, transition:"opacity 1.2s ease",
          fontStyle:"italic",
          padding: isMobile ? "0 12px" : "0",
        }}>
          {caption || "— no reports to review —"}
        </div>
      </div>
    </>
  )
}