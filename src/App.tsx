import React, { useEffect, useRef, useState } from "react";
import { GooeyText } from "./components/ui/gooey-text-morphing";
import { motion, useAnimationFrame, useMotionValue, useTransform } from "framer-motion";

// ─── SVG SYMBOLS FROM THE MANGA ───────────────────────────────────────────────

const ToriiGateIcon = () => (
  <svg viewBox="0 0 80 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <rect x="5" y="12" width="70" height="6" rx="3" fill="currentColor"/>
    <rect x="10" y="22" width="60" height="4" rx="2" fill="currentColor"/>
    <rect x="15" y="26" width="6" height="74" rx="3" fill="currentColor"/>
    <rect x="59" y="26" width="6" height="74" rx="3" fill="currentColor"/>
    <path d="M5 12 Q40 2 75 12" stroke="currentColor" strokeWidth="4" fill="none"/>
  </svg>
);

const OfudaIcon = ({ text = "呪" }: { text?: string }) => (
  <div className="relative flex flex-col items-center">
    <div className="w-8 h-16 bg-amber-50 border border-amber-300 flex items-center justify-center rounded-sm shadow-md">
      <span className="text-red-800 text-xs font-bold writing-vertical" style={{ writingMode: 'vertical-rl' }}>{text}</span>
    </div>
    <div className="w-1 h-4 bg-amber-200"></div>
    <div className="flex gap-1">
      <div className="w-3 h-1 bg-amber-200 -rotate-12"></div>
      <div className="w-3 h-1 bg-amber-200 rotate-12"></div>
    </div>
  </div>
);

const DemonEyeIcon = () => (
  <svg viewBox="0 0 60 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <ellipse cx="30" cy="20" rx="28" ry="18" stroke="currentColor" strokeWidth="2" fill="none"/>
    <circle cx="30" cy="20" r="9" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="1.5"/>
    <ellipse cx="30" cy="20" rx="3" ry="9" fill="currentColor"/>
    <line x1="2" y1="20" x2="58" y2="20" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2"/>
  </svg>
);

const KakuriyoSealIcon = () => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 2"/>
    <polygon points="50,8 61,35 90,35 67,54 76,82 50,65 24,82 33,54 10,35 39,35" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    <circle cx="50" cy="50" r="8" fill="currentColor" fillOpacity="0.4"/>
    {/* kanji in center */}
    <text x="50" y="56" textAnchor="middle" fontSize="12" fill="currentColor" fontFamily="serif">禍</text>
  </svg>
);

// ─── ANIMATED FLAME PARTICLE ──────────────────────────────────────────────────
function BlueFlame({ x, delay, size }: { x: number; delay: number; size: number }) {
  return (
    <motion.div
      className="absolute bottom-0 pointer-events-none"
      style={{ left: `${x}%`, width: size, height: size * 2.5 }}
      animate={{
        y: [0, -(120 + size * 3)],
        opacity: [0, 0.9, 0.7, 0],
        scaleX: [1, 0.7, 0.4, 0.1],
      }}
      transition={{
        duration: 2.5 + Math.random(),
        delay,
        repeat: Infinity,
        ease: "easeOut",
      }}
    >
      <div
        className="w-full h-full rounded-full"
        style={{
          background: "radial-gradient(ellipse at 50% 90%, #00f7ff 0%, #0066ff 40%, #4400ff 70%, transparent 100%)",
          filter: "blur(2px)",
          boxShadow: "0 0 12px 4px rgba(0, 200, 255, 0.5)",
        }}
      />
    </motion.div>
  );
}

// ─── FALLING PETALS ───────────────────────────────────────────────────────────
function Petal({ x, delay }: { x: number; delay: number }) {
  return (
    <motion.div
      className="absolute top-0 w-2 h-2 pointer-events-none rounded-full"
      style={{ left: `${x}%`, background: "rgba(255,150,150,0.5)" }}
      animate={{ y: ["0vh", "110vh"], x: [0, 80, -40, 60, 0], rotate: [0, 360], opacity: [0, 0.8, 0.8, 0] }}
      transition={{ duration: 8 + delay * 2, delay, repeat: Infinity, ease: "linear" }}
    />
  );
}

// ─── CHAIN LINK ───────────────────────────────────────────────────────────────
const ChainSVG = ({ vertical = false }: { vertical?: boolean }) => (
  <svg
    viewBox="0 0 20 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={vertical ? "h-full w-4" : "w-full h-4"}
    style={vertical ? {} : { transform: "rotate(90deg)" }}
  >
    {[0, 1, 2, 3].map(i => (
      <ellipse key={i} cx="10" cy={10 + i * 20} rx="7" ry="8" stroke="#8a7a60" strokeWidth="2" fill="none" opacity="0.7"/>
    ))}
  </svg>
);

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  // Detect mobile for reduced particle counts (better perf on phones)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const [particles] = useState(() =>
    Array.from({ length: isMobile ? 6 : 14 }, (_, i) => ({ x: Math.random() * 100, delay: i * 0.4, size: 8 + Math.random() * 14 }))
  );
  const [petals] = useState(() =>
    Array.from({ length: isMobile ? 8 : 18 }, (_, i) => ({ x: Math.random() * 100, delay: i * 0.6 }))
  );

  return (
    <div className="relative w-full min-h-screen bg-[#06050a] overflow-hidden font-sans" style={{ fontFamily: "'Outfit', sans-serif" }}>

      {/* ── BACKGROUND: Layered atmospheric image ─────────────────── */}
      <div className="absolute inset-0 z-0">
        {/* Main dark urban background */}
        <img
          src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
          alt="Dark Urban Night"
          className="w-full h-full object-cover"
          style={{ opacity: 0.18, filter: "saturate(0.5) brightness(0.4)" }}
        />
        {/* Red/crimson vignette */}
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(180,20,20,0.18) 0%, transparent 70%)" }} />
        {/* Bottom fog */}
        <div className="absolute bottom-0 left-0 right-0 h-64 pointer-events-none" style={{ background: "linear-gradient(to top, rgba(6,5,10,1) 0%, rgba(6,5,10,0.6) 60%, transparent 100%)" }} />
        {/* Top dark overlay */}
        <div className="absolute top-0 left-0 right-0 h-48 pointer-events-none" style={{ background: "linear-gradient(to bottom, rgba(6,5,10,0.9) 0%, transparent 100%)" }} />
      </div>

      {/* ── BLUE FLAMES at the bottom ─────────────────────────────── */}
      <div className="absolute inset-x-0 bottom-0 h-64 z-10 overflow-hidden pointer-events-none">
        {particles.map((p, i) => (
          <BlueFlame key={i} x={p.x} delay={p.delay} size={p.size} />
        ))}
      </div>

      {/* ── FALLING CHERRY PETALS ─────────────────────────────────── */}
      <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
        {petals.map((p, i) => (
          <Petal key={i} x={p.x} delay={p.delay} />
        ))}
      </div>

      {/* ── DECORATIVE CORNER: Torii Left — hidden on mobile ────── */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-20 text-red-700/40 opacity-60 pointer-events-none hidden md:block" style={{ width: 60, height: 80 }}>
        <ToriiGateIcon />
      </div>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 text-red-700/40 opacity-60 pointer-events-none scale-x-[-1] hidden md:block" style={{ width: 60, height: 80 }}>
        <ToriiGateIcon />
      </div>

      {/* ── TOP OFUDA STRIP ───────────────────────────────────────── */}
      <div className="absolute top-0 left-0 right-0 z-20 flex justify-around items-start pt-2 pointer-events-none">
        {["封", "禍", "鬼", "封", "禍"].map((kanji, i) => (
          <motion.div
            key={i}
            className={i > 2 ? "hidden sm:block" : ""}
            animate={{ rotate: ["-3deg", "3deg", "-3deg"] }}
            transition={{ duration: 3 + i * 0.3, repeat: Infinity, ease: "easeInOut" }}
          >
            <OfudaIcon text={kanji} />
          </motion.div>
        ))}
      </div>

      {/* ── VERTICAL KANJI LEFT & RIGHT — hidden on mobile ────────── */}
      <div className="absolute left-0 top-0 bottom-0 w-14 z-20 flex-col justify-center items-center pointer-events-none hidden lg:flex">
        <div className="h-16" />
        <div className="flex flex-col items-center gap-2 opacity-30">
          {["極", "楽", "街", "鬼", "道"].map((k, i) => (
            <span key={i} className="text-red-400 text-lg font-bold" style={{ fontFamily: "serif", writingMode: "vertical-rl" }}>{k}</span>
          ))}
        </div>
        <div className="mt-4 opacity-20">
          <ChainSVG vertical />
        </div>
      </div>
      <div className="absolute right-0 top-0 bottom-0 w-14 z-20 flex-col justify-center items-center pointer-events-none hidden lg:flex">
        <div className="h-16" />
        <div className="flex flex-col items-center gap-2 opacity-30">
          {["祝", "誕", "生", "日", "友"].map((k, i) => (
            <span key={i} className="text-blue-400 text-lg font-bold" style={{ fontFamily: "serif", writingMode: "vertical-rl" }}>{k}</span>
          ))}
        </div>
        <div className="mt-4 opacity-20">
          <ChainSVG vertical />
        </div>
      </div>

      {/* ── MAIN CONTENT ──────────────────────────────────────────── */}
      <div className="relative z-30 w-full min-h-screen flex flex-col items-center justify-center px-4 sm:px-8 md:px-16 pt-14 sm:pt-20 pb-16 sm:pb-24">

        {/* Top Tag */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="flex items-center gap-3 mb-6"
        >
          <div className="h-px w-8 sm:w-16 bg-gradient-to-r from-transparent to-red-500"></div>
          <span className="text-red-400 text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.35em] uppercase font-semibold border border-red-800/50 px-2 sm:px-3 py-1 rounded-full bg-red-950/30 text-center">
            極楽街 — Gokurakugai District
          </span>
          <div className="h-px w-8 sm:w-16 bg-gradient-to-l from-transparent to-red-500"></div>
        </motion.div>

        {/* ── CARD ──────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.3 }}
          className="relative w-full max-w-5xl rounded-xl sm:rounded-2xl overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(20,8,8,0.95) 0%, rgba(10,8,25,0.95) 100%)",
            border: "1px solid rgba(180,30,30,0.3)",
            boxShadow: "0 0 60px rgba(180,20,20,0.2), 0 0 120px rgba(0,60,120,0.15), inset 0 0 80px rgba(0,0,0,0.5)",
          }}
        >
          {/* Brushstroke top border */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-900 via-red-500 to-red-900 opacity-80" />
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-900 via-blue-400 to-blue-900 opacity-60" />

          {/* Corner seals */}
          {[
            "absolute top-3 left-3 text-red-500/30",
            "absolute top-3 right-3 text-red-500/30 rotate-90",
            "absolute bottom-3 left-3 text-blue-500/30 -rotate-90",
            "absolute bottom-3 right-3 text-blue-500/30 rotate-180",
          ].map((cls, i) => (
            <div key={i} className={cls} style={{ width: 44, height: 44 }}>
              <KakuriyoSealIcon />
            </div>
          ))}

          {/* Inner Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 min-h-0 lg:min-h-[520px]">

            {/* LEFT: Characters panel */}
            <div className="relative flex flex-col justify-between p-4 sm:p-6 md:p-8 border-b lg:border-b-0 lg:border-r border-red-900/20">

              {/* Character Image — TAO */}
              <div className="relative rounded-xl overflow-hidden mb-4 sm:mb-6 group" style={{ aspectRatio: "9/10" }}>
                <img
                  src="https://images.unsplash.com/photo-1578632767115-351597cf2477?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Anime Character Aesthetic"
                  className="w-full h-full object-cover object-top transition-transform duration-1000 group-hover:scale-105"
                  style={{ filter: "contrast(1.1) saturate(0.85) brightness(0.9)" }}
                />
                {/* Red tonal overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0510] via-red-950/10 to-transparent" />
                {/* Scanlines */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)",
                  }}
                />
                {/* Character label */}
                <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                  <div>
                    <p className="text-red-400 text-[10px] sm:text-xs tracking-widest uppercase font-semibold">Residente del Distrito</p>
                    <p className="text-white text-lg sm:text-xl font-bold" style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: "0.1em" }}>VALENTINA</p>
                  </div>
                  <div className="text-red-500/60 flex flex-col items-end gap-1">
                    <span className="text-[10px] sm:text-xs text-gray-500">No.</span>
                    <span className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: "'Bebas Neue', cursive" }}>001</span>
                  </div>
                </div>
                {/* Demon eye corner watermark */}
                <div className="absolute top-3 right-3 text-red-500/40 opacity-80" style={{ width: 36, height: 24 }}>
                  <DemonEyeIcon />
                </div>
              </div>

              {/* Bottom stats: Manga-style character data */}
              <div className="space-y-1.5 sm:space-y-2">
                {[
                  { label: "CLASIFICACIÓN", value: "S-RANK PROTEGIDA", color: "text-red-400" },
                  { label: "ESTADO", value: "CUMPLEAÑOS SAGRADO", color: "text-blue-400" },
                  { label: "HABILIDAD", value: "HACER FELIZ AL MUNDO", color: "text-amber-400" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex items-center justify-between border-b border-white/5 pb-1.5 sm:pb-2 gap-2">
                    <span className="text-gray-600 text-[8px] sm:text-[10px] tracking-wider sm:tracking-widest uppercase shrink-0">{label}</span>
                    <span className={`${color} text-[10px] sm:text-xs font-semibold tracking-wider text-right`}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT: Gooey Text + Kanji + Message */}
            <div className="relative flex flex-col items-center justify-between p-4 sm:p-6 md:p-8">

              {/* Rotating Kakuriyo Seal background */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 text-red-400"
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                style={{ width: "100%", height: "100%" }}
              >
                <div style={{ width: 320, height: 320 }}>
                  <KakuriyoSealIcon />
                </div>
              </motion.div>

              {/* Big Kanji: 誕生日おめでとう */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 1 }}
                className="flex gap-3 mb-2"
              >
                {["誕", "生", "日"].map((k, i) => (
                  <motion.span
                    key={k}
                    className="text-3xl sm:text-4xl md:text-5xl font-bold"
                    style={{
                      fontFamily: "serif",
                      color: "transparent",
                      WebkitTextStroke: "1px rgba(255,100,100,0.5)",
                      textShadow: "0 0 20px rgba(255,50,50,0.3)",
                    }}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 3, delay: i * 0.3, repeat: Infinity }}
                  >
                    {k}
                  </motion.span>
                ))}
              </motion.div>

              {/* GooeyText Component */}
              <div className="h-[80px] sm:h-[120px] md:h-[180px] flex items-center justify-center w-full relative overflow-hidden">
                <GooeyText
                  texts={["FELIZ", "CUMPLEAÑOS", "VALENTINA", "GOKURAKUGAI"]}
                  morphTime={1.2}
                  cooldownTime={0.7}
                  className="w-full text-center"
                  textClassName="font-display text-white tracking-wider sm:tracking-widest text-2xl sm:text-4xl md:text-5xl lg:text-6xl"
                />
              </div>

              {/* Decorative horizontal divider with seal */}
              <div className="w-full flex items-center gap-3 my-2">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-red-800 to-transparent"></div>
                <div className="text-red-600/60" style={{ width: 28, height: 28 }}>
                  <KakuriyoSealIcon />
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blue-800 to-transparent"></div>
              </div>

              {/* Message */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 1.5 }}
                className="text-center space-y-3"
              >
                <p className="text-gray-300 text-sm sm:text-base md:text-lg font-light leading-relaxed italic px-1">
                  "En el Distrito Gokuraku, donde la oscuridad y la luz bailan juntas,<br className="hidden sm:inline" />
                  hoy el universo detiene sus guerras para celebrarte."
                </p>
                <p className="text-red-400/80 text-[10px] sm:text-sm tracking-[0.15em] sm:tracking-[0.3em] uppercase font-semibold">
                  — Tao & Alma, Guardianes del Distrito
                </p>
              </motion.div>

              {/* Bottom floating ofuda decorations */}
              <div className="flex justify-center gap-4 sm:gap-6 mt-3 sm:mt-4 opacity-50">
                {["守", "愛", "光"].map((k, i) => (
                  <motion.div
                    key={k}
                    animate={{ y: [-4, 4, -4] }}
                    transition={{ duration: 2.5 + i * 0.4, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <OfudaIcon text={k} />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom inner strip: Horizontal scrolling Japanese text */}
          <div className="border-t border-red-900/20 px-6 py-3 overflow-hidden relative">
            <motion.div
              className="flex gap-12 whitespace-nowrap text-xs text-gray-700 tracking-widest uppercase font-mono"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            >
              {Array(4).fill(null).map((_, i) => (
                <span key={i}>
                  ✦ GOKURAKUGAI ✦ 極楽街 ✦ FELIZ CUMPLEAÑOS VALENTINA ✦ 誕生日おめでとう ✦ KAKURIYO DISTRICT ✦ 鬼滅の極 ✦ HAPPY BIRTHDAY ✦
                </span>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* ── BOTTOM DETAIL ROW ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 1 }}
          className="flex items-center gap-2 sm:gap-4 md:gap-6 mt-6 sm:mt-8 flex-wrap justify-center"
        >
          <div className="text-red-500/40 hidden sm:block" style={{ width: 32, height: 32 }}>
            <DemonEyeIcon />
          </div>
          <div className="h-px w-6 sm:w-12 bg-red-800/40"></div>
          <span className="text-gray-600 text-[9px] sm:text-xs tracking-[0.15em] sm:tracking-[0.4em] uppercase text-center">El Submundo Celebra Tu Existencia</span>
          <div className="h-px w-6 sm:w-12 bg-blue-800/40"></div>
          <div className="text-blue-500/40 hidden sm:block" style={{ width: 32, height: 32 }}>
            <DemonEyeIcon />
          </div>
        </motion.div>

      </div>
    </div>
  );
}
