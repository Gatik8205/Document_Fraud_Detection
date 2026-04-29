import { useState } from "react";
import { useNavigate } from "react-router-dom";
import FileUpload from "../components/FileUpload";
import { analyzeDocument } from "../services/api";
import Loader from "../components/Loader";

const FEATURES = [
  { icon: "◈", label: "Error Level Analysis" },
  { icon: "◉", label: "CNN + Grad-CAM" },
  { icon: "◇", label: "Metadata Forensics" },
  { icon: "◎", label: "Clone Detection" },
  { icon: "⬡", label: "OCR Text Scan" },
  { icon: "◐", label: "Multi-Page PDF" },
];

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [warmingUp, setWarmingUp] = useState(false);
  const navigate = useNavigate();

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    const warmTimer = setTimeout(() => setWarmingUp(true), 5000);
    try {
      const result = await analyzeDocument(file);
      navigate("/result", { state: { fileName: file.name, result } });
    } catch (err) {
      console.error(err);
      alert("Analysis failed. Please try again.");
    } finally {
      clearTimeout(warmTimer);
      setLoading(false);
      setWarmingUp(false);
    }
  };

  return (
    <div
      className="relative flex items-center justify-center min-h-screen px-4 py-12"
      style={{ background: 'var(--bg-primary)', zIndex: 1 }}
    >
      <div className="relative z-10 w-full max-w-lg">

        {/* Header */}
        <div className="mb-10 fade-up">
          <div className="flex items-center gap-3 mb-6">
            <div
              className="flex items-center justify-center w-8 h-8 font-mono text-xs"
              style={{ background: 'rgba(212, 136, 10, 0.12)', border: '1px solid rgba(212, 136, 10, 0.3)', color: 'var(--amber)' }}
            >
              FD
            </div>
            <span className="font-mono text-xs tracking-widest" style={{ color: 'var(--text-muted)' }}>
              FORENSIC DOCUMENT ANALYSIS SYSTEM v2.1
            </span>
          </div>

          <h1
            className="font-mono text-3xl font-semibold leading-tight tracking-tight"
            style={{ color: 'var(--text-primary)' }}
          >
            DOCUMENT<br />
            <span style={{ color: 'var(--amber)' }}>FRAUD</span> DETECTION
          </h1>

          <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Hybrid AI + classical forensics pipeline. Upload a document to detect tampering, forgery, and manipulation.
          </p>
        </div>

        {/* Upload card */}
        <div
          className="relative p-6 mb-6 fade-up-1"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          {/* Card header */}
          <div className="flex items-center justify-between mb-5">
            <span className="font-mono text-xs tracking-wider" style={{ color: 'var(--amber)' }}>
              ▸ INPUT FILE
            </span>
            <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
              JPG · PNG · PDF
            </span>
          </div>

          {loading ? (
            <Loader warmingUp={warmingUp} />
          ) : (
            <>
              <FileUpload onFileSelect={setFile} />

              <button
                onClick={handleAnalyze}
                disabled={!file}
                className="relative w-full py-4 mt-5 overflow-hidden font-mono text-sm tracking-widest transition-all duration-200 group"
                style={{
                  background: file ? 'rgba(212, 136, 10, 0.1)' : 'rgba(255,255,255,0.02)',
                  border: '1px solid',
                  borderColor: file ? 'rgba(212, 136, 10, 0.5)' : 'rgba(232, 228, 217, 0.06)',
                  color: file ? 'var(--amber-bright)' : 'var(--text-muted)',
                  cursor: file ? 'pointer' : 'not-allowed',
                }}
              >
                {/* Hover fill effect */}
                {file && (
                  <span
                    className="absolute inset-0 transition-all duration-300 opacity-0 group-hover:opacity-100"
                    style={{ background: 'rgba(212, 136, 10, 0.08)' }}
                  />
                )}
                <span className="relative">
                  {file ? '▶  RUN ANALYSIS' : 'SELECT A FILE TO BEGIN'}
                </span>
              </button>
            </>
          )}
        </div>

        {/* Feature list */}
        <div className="grid grid-cols-3 gap-2 fade-up-2">
          {FEATURES.map((f) => (
            <div
              key={f.label}
              className="flex flex-col items-center gap-1.5 px-2 py-3 text-center"
              style={{ background: 'rgba(20, 20, 22, 0.6)', border: '1px solid var(--border)' }}
            >
              <span className="text-base" style={{ color: 'var(--amber-dim)' }}>{f.icon}</span>
              <span className="font-mono text-xs leading-tight" style={{ color: 'var(--text-muted)', fontSize: '10px' }}>
                {f.label.toUpperCase()}
              </span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center fade-up-3">
          <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
            RESNET-18 · CASIA 2.0 · COMOFOD · CG-1050
          </span>
        </div>

      </div>
    </div>
  );
}