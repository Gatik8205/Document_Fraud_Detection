import { useLocation, useNavigate } from "react-router-dom";
import type { FraudResult } from "../types/fraud";

const API = import.meta.env.VITE_API_URL; 

export default function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state?.result as FraudResult;

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen p-10 text-white bg-slate-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-300">No result found</h2>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 mt-6 font-semibold bg-indigo-600 hover:bg-indigo-700 rounded-xl"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const handleDownloadReport = async () => {
    try {
      const response = await fetch(`${API}/report`, {  
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to generate report");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "fraud_report.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Report download failed. Please try again.");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen px-4 py-8 text-white bg-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto space-y-8 max-w-7xl">

        {/* Header */}
        <div className="pb-6 mb-8 border-b border-slate-700">
          <h1 className="mb-3 text-4xl font-bold text-white sm:text-5xl">
            Analysis Results
          </h1>
          <p className="text-lg text-slate-300">Comprehensive fraud detection analysis</p>
        </div>

        {/* Summary Card */}
        <div className="p-8 mb-8 border shadow-2xl bg-slate-800 border-slate-700 rounded-2xl">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="text-center md:text-left">
              <p className="mb-1 text-sm font-medium tracking-wider uppercase text-slate-300">
                Fraud Score
              </p>
              <p className="mb-2 text-5xl font-bold text-indigo-400">
                {data.fraudScore}%
              </p>
              <p className="text-sm text-slate-200">
                Confidence:{" "}
                <span className="font-semibold text-indigo-300">
                  {data.confidence}
                </span>
              </p>
              {(data.totalPages ?? 0) > 1 && data.flaggedPage && (
                <p className="mt-2 text-sm text-yellow-400">
                  ⚠️ Most suspicious content on page {data.flaggedPage} of {data.totalPages}
                </p>
              )}
            </div>
            <div className="px-8 py-4 text-lg font-bold text-white bg-indigo-600 shadow-lg rounded-xl">
              {data.decision}
            </div>
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="mb-10">
          <h2 className="mb-6 text-2xl font-semibold text-white">
            Detailed Score Breakdown
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { label: "Image Analysis", value: data.breakdown.image, icon: "🖼️" },
              { label: "Text Analysis", value: data.breakdown.text, icon: "📝" },
              { label: "Metadata Analysis", value: data.breakdown.meta, icon: "🔍" },
            ].map((item) => (
              <div
                key={item.label}
                className="p-8 text-center transition-all duration-300 border shadow-lg bg-slate-800 border-slate-700 rounded-xl hover:shadow-indigo-500/20 hover:border-indigo-500/50"
              >
                <div className="mb-3 text-4xl">{item.icon}</div>
                <p className="mb-3 text-sm font-medium tracking-wider uppercase text-slate-300">
                  {item.label}
                </p>
                <p className="text-4xl font-bold text-indigo-400">
                  {item.value}%
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Forensic Heatmaps */}
        <div className="mb-10">
          <h2 className="mb-6 text-2xl font-semibold text-white">
            Forensic Analysis
          </h2>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-4">

            {data.breakdown.elaHeatmap && (
              <div className="flex flex-col overflow-hidden transition-all duration-300 border shadow-lg bg-slate-800 border-slate-700 rounded-xl hover:shadow-indigo-500/20">
                <h3 className="p-4 text-lg font-semibold text-center text-indigo-300 bg-slate-900">
                  ELA Heatmap
                </h3>
                <div className="flex items-center justify-center flex-1 p-4 bg-black">
                  <img
                    src={`${API}/${data.breakdown.elaHeatmap}`}  
                    className="object-contain w-full h-auto"
                    style={{ minHeight: "250px", maxHeight: "350px" }}
                    alt="ELA Heatmap"
                  />
                </div>
                <p className="p-3 text-xs text-center text-slate-400 bg-slate-900">
                  Compression inconsistencies
                </p>
              </div>
            )}

            {data.breakdown.edgeMap && (
              <div className="flex flex-col overflow-hidden transition-all duration-300 border shadow-lg bg-slate-800 border-slate-700 rounded-xl hover:shadow-indigo-500/20">
                <h3 className="p-4 text-lg font-semibold text-center text-indigo-300 bg-slate-900">
                  Edge Detection
                </h3>
                <div className="flex items-center justify-center flex-1 p-4 bg-black">
                  <img
                    src={`${API}/${data.breakdown.edgeMap}`} 
                    className="object-contain w-full h-auto"
                    style={{ minHeight: "250px", maxHeight: "350px" }}
                    alt="Edge Map"
                  />
                </div>
                <p className="p-3 text-xs text-center text-slate-400 bg-slate-900">
                  Structural inconsistencies
                </p>
              </div>
            )}

            {data.breakdown.cloneMap && (
              <div className="flex flex-col overflow-hidden transition-all duration-300 border shadow-lg bg-slate-800 border-slate-700 rounded-xl hover:shadow-indigo-500/20">
                <h3 className="p-4 text-lg font-semibold text-center text-indigo-300 bg-slate-900">
                  Clone Detection
                </h3>
                <div className="flex items-center justify-center flex-1 p-4 bg-black">
                  <img
                    src={`${API}/${data.breakdown.cloneMap}`} 
                    className="object-contain w-full h-auto"
                    style={{ minHeight: "250px", maxHeight: "350px" }}
                    alt="Clone Map"
                  />
                </div>
                <p className="p-3 text-xs text-center text-slate-400 bg-slate-900">
                  Duplicated regions
                </p>
              </div>
            )}

            {data.breakdown.gradcamMap && (
              <div className="flex flex-col overflow-hidden transition-all duration-300 border shadow-lg bg-slate-800 border-slate-700 rounded-xl hover:shadow-indigo-500/20">
                <h3 className="p-4 text-lg font-semibold text-center text-indigo-300 bg-slate-900">
                  Grad-CAM
                </h3>
                <div className="flex items-center justify-center flex-1 p-4 bg-black">
                  <img
                    src={`${API}/${data.breakdown.gradcamMap}`}  // ← CHANGED
                    className="object-contain w-full h-auto"
                    style={{ minHeight: "250px", maxHeight: "350px" }}
                    alt="Grad-CAM Heatmap"
                  />
                </div>
                <p className="p-3 text-xs text-center text-slate-400 bg-slate-900">
                  CNN attention regions
                </p>
              </div>
            )}

          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <button
            onClick={() => navigate("/")}
            className="flex-1 px-8 py-4 font-semibold text-white transition-all duration-300 shadow-lg bg-slate-700 hover:bg-slate-600 rounded-xl hover:shadow-xl"
          >
            ← Analyze Another Document
          </button>
          <button
            onClick={handleDownloadReport}
            className="flex-1 px-8 py-4 font-semibold text-white transition-all duration-300 bg-indigo-600 shadow-lg hover:bg-indigo-700 rounded-xl hover:shadow-xl hover:shadow-indigo-500/50"
          >
            Download Report ↓
          </button>
        </div>

      </div>
    </div>
  );
}