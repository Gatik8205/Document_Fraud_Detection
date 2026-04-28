import { useState } from "react";
import { useNavigate } from "react-router-dom";
import FileUpload from "../components/FileUpload";
import { analyzeDocument } from "../services/api";
import Loader from "../components/Loader";

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [warmingUp, setWarmingUp] = useState(false);  // ← NEW
  const navigate = useNavigate();

  const handleAnalyze = async () => {
    if (!file) return;

    setLoading(true);

    // ← NEW: show warming up message if server takes > 5s
    const warmTimer = setTimeout(() => setWarmingUp(true), 5000);

    try {
      const result = await analyzeDocument(file);
      navigate("/result", {
        state: {
          fileName: file.name,
          result,
        },
      });
    } catch (err) {
      console.error(err);
      alert("Failed to analyze document");
    } finally {
      clearTimeout(warmTimer);
      setLoading(false);
      setWarmingUp(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-gradient-to-br from-slate-900 via-slate-800 to-black">
      <div className="w-full max-w-2xl p-10 border shadow-2xl bg-slate-800/80 backdrop-blur-xl rounded-3xl border-slate-700">

        {/* Title */}
        <h1 className="mb-3 text-4xl font-extrabold text-center text-white">
          Document Fraud Detection
        </h1>

        {/* Subtitle */}
        <p className="mb-10 text-sm text-center text-slate-400">
          Upload an identity document to analyze forgery, tampering, and authenticity
        </p>

        {/* Upload box */}
        <FileUpload onFileSelect={setFile} />

        {/* Selected file */}
        {file && (
          <p className="mt-4 text-sm text-center text-emerald-400">
            Selected file: <span className="font-medium">{file.name}</span>
          </p>
        )}

        {/* Action */}
        <div className="mt-10">
          {loading ? (
            <>
              <Loader />
              {/* ← NEW: warming up message for Render cold starts */}
              {warmingUp && (
                <p className="mt-4 text-sm text-center text-yellow-400">
                  ⏳ Server is waking up, please wait ~30 seconds...
                </p>
              )}
            </>
          ) : (
            <button
              onClick={handleAnalyze}
              disabled={!file}
              className={`w-full mt-8 py-8 rounded-2xl text-lg font-bold transition-all ${
                file
                  ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-indigo-500/40"
                  : "bg-slate-700 text-slate-300 border border-slate-500 cursor-not-allowed"
              }`}
            >
              {file ? "Analyze Document" : "Upload a document to analyze"}
            </button>
          )}
        </div>

        {/* Footer */}
        <p className="mt-6 text-xs text-center text-slate-500">
          Supported formats: JPG, PNG, PDF
        </p>
      </div>
    </div>
  );
}