import { useLocation, useNavigate } from "react-router-dom";
import type { FraudResult } from "../types/fraud";

const API = import.meta.env.VITE_API_URL;

function getRiskConfig(score: number, decision: string) {
  if (decision === "Inconclusive") return {
    color: '#8a8680',
    bg: 'rgba(138, 134, 128, 0.08)',
    border: 'rgba(138, 134, 128, 0.2)',
    label: 'INCONCLUSIVE',
    stampColor: 'rgba(138, 134, 128, 0.25)',
  };
  if (score < 30 || decision === "Low Risk") return {
    color: '#2a9d5c',
    bg: 'rgba(42, 157, 92, 0.06)',
    border: 'rgba(42, 157, 92, 0.2)',
    label: 'AUTHENTIC',
    stampColor: 'rgba(42, 157, 92, 0.2)',
  };
  if (score < 60 || decision === "Suspicious") return {
    color: '#d4880a',
    bg: 'rgba(212, 136, 10, 0.06)',
    border: 'rgba(212, 136, 10, 0.2)',
    label: 'SUSPICIOUS',
    stampColor: 'rgba(212, 136, 10, 0.2)',
  };
  return {
    color: '#d93025',
    bg: 'rgba(217, 48, 37, 0.06)',
    border: 'rgba(217, 48, 37, 0.2)',
    label: 'FRAUDULENT',
    stampColor: 'rgba(217, 48, 37, 0.2)',
  };
}

interface ScoreBarProps {
  label: string;
  icon: string;
  value: number;
  delay?: string;
}

function ScoreBar({ label, icon, value, delay = '0s' }: ScoreBarProps) {
  const color = value > 70 ? '#d93025' : value > 40 ? '#d4880a' : '#2a9d5c';
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span style={{ color: 'var(--amber-dim)' }}>{icon}</span>
          <span className="font-mono text-xs tracking-wider" style={{ color: 'var(--text-secondary)' }}>
            {label}
          </span>
        </div>
        <span className="font-mono text-sm font-semibold" style={{ color }}>
          {value}%
        </span>
      </div>
      <div className="w-full h-px overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
        <div
          className="h-full bar-fill"
          style={{ width: `${value}%`, background: color, animationDelay: delay, boxShadow: `0 0 6px ${color}40` }}
        />
      </div>
    </div>
  );
}

interface HeatmapCardProps {
  title: string;
  subtitle: string;
  src: string;
  alt: string;
  delay?: string;
}

function HeatmapCard({ title, subtitle, src, alt, delay = '0s' }: HeatmapCardProps) {
  return (
    <div
      className="flex flex-col overflow-hidden fade-up"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', animationDelay: delay }}
    >
      {/* Card header */}
      <div
        className="flex items-center justify-between px-4 py-2.5"
        style={{ borderBottom: '1px solid var(--border)', background: 'rgba(0,0,0,0.2)' }}
      >
        <span className="font-mono text-xs tracking-wider" style={{ color: 'var(--amber)' }}>
          ▸ {title}
        </span>
      </div>

      {/* Image */}
      <div className="flex items-center justify-center flex-1 bg-black" style={{ minHeight: '200px' }}>
        <img
          src={src}
          alt={alt}
          className="object-contain w-full h-auto"
          style={{ maxHeight: '260px' }}
        />
      </div>

      {/* Footer */}
      <div className="px-4 py-2" style={{ borderTop: '1px solid var(--border)' }}>
        <p className="font-mono text-xs" style={{ color: 'var(--text-muted)', fontSize: '10px' }}>
          {subtitle}
        </p>
      </div>
    </div>
  );
}

export default function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state?.result as FraudResult;
  const fileName = location.state?.fileName as string;

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center">
          <p className="mb-6 font-mono text-sm" style={{ color: 'var(--text-muted)' }}>NO ANALYSIS DATA FOUND</p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 font-mono text-xs transition-all"
            style={{ border: '1px solid rgba(212,136,10,0.3)', color: 'var(--amber)', background: 'rgba(212,136,10,0.05)' }}
          >
            ← RETURN TO UPLOAD
          </button>
        </div>
      </div>
    );
  }

  const risk = getRiskConfig(data.fraudScore, data.decision);

  const handleDownloadReport = async () => {
    try {
      const response = await fetch(`${API}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "fraud_report.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      alert("Report download failed.");
    }
  };

  const heatmaps = [
    data.breakdown.elaHeatmap && { title: "ELA HEATMAP", subtitle: "Compression anomaly map", src: `${API}/${data.breakdown.elaHeatmap}`, alt: "ELA" },
    data.breakdown.edgeMap && { title: "EDGE DETECTION", subtitle: "Canny structural integrity", src: `${API}/${data.breakdown.edgeMap}`, alt: "Edges" },
    data.breakdown.cloneMap && { title: "CLONE DETECTION", subtitle: "ORB feature matching", src: `${API}/${data.breakdown.cloneMap}`, alt: "Clone" },
    data.breakdown.gradcamMap && { title: "GRAD-CAM", subtitle: "CNN attention overlay", src: `${API}/${data.breakdown.gradcamMap}`, alt: "GradCAM" },
  ].filter(Boolean) as { title: string; subtitle: string; src: string; alt: string }[];

  return (
    <div
      className="relative min-h-screen"
      style={{ background: 'var(--bg-primary)', zIndex: 1 }}
    >
      <div className="relative z-10 max-w-5xl px-4 py-10 mx-auto sm:px-6">

        {/* Top bar */}
        <div
          className="flex items-center justify-between pb-4 mb-8 fade-up"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center font-mono text-xs w-7 h-7"
              style={{ background: 'rgba(212, 136, 10, 0.12)', border: '1px solid rgba(212,136,10,0.3)', color: 'var(--amber)' }}
            >
              FD
            </div>
            <span className="font-mono text-xs tracking-widest" style={{ color: 'var(--text-muted)' }}>
              ANALYSIS COMPLETE
            </span>
          </div>
          {fileName && (
            <span className="hidden max-w-xs font-mono text-xs truncate sm:block" style={{ color: 'var(--text-muted)' }}>
              {fileName.toUpperCase()}
            </span>
          )}
        </div>

        {/* Hero — Score + Stamp */}
        <div
          className="relative p-6 mb-6 overflow-hidden fade-up-1 sm:p-8"
          style={{ background: risk.bg, border: `1px solid ${risk.border}` }}
        >
          {/* Corner accents */}
          <span className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2" style={{ borderColor: risk.color }} />
          <span className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2" style={{ borderColor: risk.color }} />

          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            {/* Left: score */}
            <div>
              <p className="mb-1 font-mono text-xs tracking-widest" style={{ color: 'var(--text-muted)' }}>
                FRAUD PROBABILITY SCORE
              </p>
              <p
                className="font-mono font-semibold leading-none text-7xl"
                style={{ color: risk.color }}
              >
                {data.fraudScore}
                <span className="text-3xl" style={{ color: risk.color + '80' }}>%</span>
              </p>
              <div className="flex items-center gap-4 mt-3">
                <span className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>
                  CONFIDENCE:{' '}
                  <span style={{ color: 'var(--text-primary)' }}>{data.confidence.toUpperCase()}</span>
                </span>
                {(data.totalPages ?? 0) > 1 && data.flaggedPage && (
                  <span className="font-mono text-xs" style={{ color: 'var(--amber-dim)' }}>
                    ⚠ PAGE {data.flaggedPage}/{data.totalPages}
                  </span>
                )}
              </div>
            </div>

            {/* Right: stamp */}
            <div
              className="px-8 py-4 font-mono text-xl font-bold tracking-widest stamp"
              style={{
                border: `3px solid ${risk.color}`,
                color: risk.color,
                background: risk.stampColor,
                transform: 'rotate(-6deg)',
                textShadow: `0 0 20px ${risk.color}40`,
              }}
            >
              {risk.label}
            </div>
          </div>
        </div>

        {/* Score breakdown */}
        <div
          className="p-6 mb-6 fade-up-2"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <p className="mb-5 font-mono text-xs tracking-wider" style={{ color: 'var(--amber)' }}>
            ▸ SCORE BREAKDOWN
          </p>
          <div className="flex flex-col gap-5">
            <ScoreBar label="IMAGE FORENSICS" icon="◈" value={data.breakdown.image} delay="0.1s" />
            <ScoreBar label="TEXT INTEGRITY" icon="◉" value={data.breakdown.text} delay="0.2s" />
            <ScoreBar label="METADATA ANALYSIS" icon="◇" value={data.breakdown.meta} delay="0.3s" />
          </div>
        </div>

        {/* Heatmaps */}
        {heatmaps.length > 0 && (
          <div className="mb-8">
            <p className="mb-4 font-mono text-xs tracking-wider fade-up-3" style={{ color: 'var(--amber)' }}>
              ▸ FORENSIC VISUALIZATIONS
            </p>
            <div className={`grid gap-4 ${heatmaps.length >= 4 ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4' : heatmaps.length === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
              {heatmaps.map((h, i) => (
                <HeatmapCard
                  key={h.title}
                  title={h.title}
                  subtitle={h.subtitle}
                  src={h.src}
                  alt={h.alt}
                  delay={`${0.1 * i}s`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Action row */}
        <div className="flex flex-col gap-3 sm:flex-row fade-up-4">
          <button
            onClick={() => navigate("/")}
            className="flex-1 py-4 font-mono text-sm tracking-widest transition-all duration-200"
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
            }}
            onMouseEnter={e => { (e.target as HTMLElement).style.borderColor = 'rgba(232,228,217,0.15)'; (e.target as HTMLElement).style.color = 'var(--text-primary)'; }}
            onMouseLeave={e => { (e.target as HTMLElement).style.borderColor = 'var(--border)'; (e.target as HTMLElement).style.color = 'var(--text-secondary)'; }}
          >
            ← NEW ANALYSIS
          </button>

          <button
            onClick={handleDownloadReport}
            className="flex-1 py-4 font-mono text-sm tracking-widest transition-all duration-200"
            style={{
              background: 'rgba(212,136,10,0.08)',
              border: '1px solid rgba(212,136,10,0.35)',
              color: 'var(--amber-bright)',
            }}
            onMouseEnter={e => { (e.target as HTMLElement).style.background = 'rgba(212,136,10,0.14)'; }}
            onMouseLeave={e => { (e.target as HTMLElement).style.background = 'rgba(212,136,10,0.08)'; }}
          >
            ↓ EXPORT PDF REPORT
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center fade-up-5">
          <span className="font-mono" style={{ color: 'var(--text-muted)', fontSize: '10px' }}>
            RESNET-18 HYBRID PIPELINE · WEIGHTED FORENSIC SCORING · AI-ASSISTED ANALYSIS
          </span>
        </div>

      </div>
    </div>
  );
}