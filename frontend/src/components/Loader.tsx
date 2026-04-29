import { useEffect, useState } from "react";

interface Props {
  warmingUp?: boolean;
}

const MESSAGES = [
  "INITIALIZING FORENSIC PIPELINE...",
  "RUNNING ERROR LEVEL ANALYSIS...",
  "EXTRACTING METADATA SIGNATURES...",
  "COMPUTING CNN INFERENCE...",
  "GENERATING GRAD-CAM OVERLAY...",
  "ANALYZING EDGE INTEGRITY...",
  "RUNNING CLONE DETECTION...",
  "CROSS-REFERENCING OCR DATA...",
  "COMPUTING HYBRID FRAUD SCORE...",
  "FINALIZING ANALYSIS REPORT...",
];

export default function Loader({ warmingUp }: Props) {
  const [msgIdx, setMsgIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [dots, setDots] = useState("");

  useEffect(() => {
    const msgTimer = setInterval(() => {
      setMsgIdx((i) => (i + 1) % MESSAGES.length);
    }, 2200);
    return () => clearInterval(msgTimer);
  }, []);

  useEffect(() => {
    const progTimer = setInterval(() => {
      setProgress((p) => (p >= 95 ? 95 : p + Math.random() * 3));
    }, 400);
    return () => clearInterval(progTimer);
  }, []);

  useEffect(() => {
    const dotTimer = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "" : d + "."));
    }, 500);
    return () => clearInterval(dotTimer);
  }, []);

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      {/* Spinner */}
      <div className="relative w-16 h-16">
        <div
          className="absolute inset-0 border-2 animate-spin"
          style={{ borderColor: 'transparent', borderTopColor: 'var(--amber)', animationDuration: '0.8s' }}
        />
        <div
          className="absolute border inset-2 animate-spin"
          style={{ borderColor: 'transparent', borderTopColor: 'var(--amber-dim)', animationDuration: '1.5s', animationDirection: 'reverse' }}
        />
        <div
          className="absolute inset-0 flex items-center justify-center font-mono text-xs"
          style={{ color: 'var(--amber)' }}
        >
          AI
        </div>
      </div>

      {/* Message */}
      <div className="text-center">
        <p
          className="font-mono text-xs tracking-widest transition-all duration-300"
          style={{ color: 'var(--amber)' }}
        >
          {MESSAGES[msgIdx]}{dots}
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-xs">
        <div
          className="w-full h-px overflow-hidden"
          style={{ background: 'rgba(212, 136, 10, 0.15)' }}
        >
          <div
            className="h-full transition-all duration-500"
            style={{ width: `${progress}%`, background: 'var(--amber)' }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>0%</span>
          <span className="font-mono text-xs" style={{ color: 'var(--amber-dim)' }}>{Math.round(progress)}%</span>
          <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>100%</span>
        </div>
      </div>

      {/* Warming up notice */}
      {warmingUp && (
        <p className="font-mono text-xs text-center" style={{ color: 'var(--amber-dim)' }}>
          ⚠ SERVER COLD START — EST. 30s
        </p>
      )}
    </div>
  );
}