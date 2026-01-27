import { useLocation } from "react-router-dom";
import type{ FraudResult, DecisionType, ConfidenceType } from "../types/fraud";

export default function Result() {
  const location = useLocation();
  const data = location.state?.result as FraudResult;

  if (!data) return <div className="p-10 text-white">No data found</div>;

  const riskColorMap: Record<DecisionType, string> = {
    "Low Risk": "bg-green-600",
    "Suspicious": "bg-yellow-600",
    "High Risk": "bg-red-600",
    "Inconclusive": "bg-gray-600",
  };

  const confidenceColorMap: Record<ConfidenceType, string> = {
    High: "text-green-400",
    Medium: "text-yellow-400",
    Low: "text-red-400",
  };

  const riskColor = riskColorMap[data.decision];
  const confidenceColor = confidenceColorMap[data.confidence];

  return (
    <div className="min-h-screen p-8 text-white bg-gray-900">
      <h1 className="mb-6 text-3xl font-bold">🔍 Analysis Results</h1>

      <div className="p-6 bg-gray-800 border border-gray-700 shadow-xl rounded-xl">
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold">
            Fraud Score: <span className="text-blue-400">{data.fraudScore}%</span>
          </div>

          <div className={`px-3 py-1 rounded-md text-sm font-semibold ${riskColor}`}>
            {data.decision}
          </div>
        </div>

        <div className="mt-3 text-sm">
          Confidence Level:{" "}
          <span className={`font-semibold ${confidenceColor}`}>
            {data.confidence}
          </span>
        </div>
      </div>

      {/* Breakdown Section */}
      <h2 className="mt-8 mb-4 text-2xl font-bold">📊 Scores Breakdown</h2>

      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="p-4 bg-gray-800 border border-gray-700 rounded-lg">
          <div className="text-sm text-gray-400">Image Analysis</div>
          <div className="text-lg font-bold text-blue-400">{data.breakdown.image}%</div>
        </div>
        <div className="p-4 bg-gray-800 border border-gray-700 rounded-lg">
          <div className="text-sm text-gray-400">Text Analysis</div>
          <div className="text-lg font-bold text-blue-400">{data.breakdown.text}%</div>
        </div>
        <div className="p-4 bg-gray-800 border border-gray-700 rounded-lg">
          <div className="text-sm text-gray-400">Metadata Analysis</div>
          <div className="text-lg font-bold text-blue-400">{data.breakdown.meta}%</div>
        </div>
      </div>

      {/* Heatmap Section */}
      <h2 className="mt-10 mb-4 text-2xl font-bold">🖼 Forensic Heatmaps</h2>

      <div className="grid grid-cols-3 gap-6">
        {data.breakdown.elaHeatmap && (
          <div>
            <div className="mb-1 text-sm text-gray-400">ELA Heatmap</div>
            <img
              loading="lazy"
              src={`http://localhost:8000/${data.breakdown.elaHeatmap}`}
              className="transition-transform duration-200 border border-gray-700 rounded-lg shadow-lg hover:scale-105"
            />
          </div>
        )}
        {data.breakdown.edgeMap && (
          <div>
            <div className="mb-1 text-sm text-gray-400">Edge Detection</div>
            <img
              loading="lazy"
              src={`http://localhost:8000/${data.breakdown.edgeMap}`}
              className="transition-transform duration-200 border border-gray-700 rounded-lg shadow-lg hover:scale-105"
            />
          </div>
        )}
        {data.breakdown.cloneMap && (
          <div>
            <div className="mb-1 text-sm text-gray-400">Clone Detection</div>
            <img
              loading="lazy"
              src={`http://localhost:8000/${data.breakdown.cloneMap}`}
              className="transition-transform duration-200 border border-gray-700 rounded-lg shadow-lg hover:scale-105"
            />
          </div>
        )}
      </div>

      {/* Report Download Button */}
      <button onClick={async () => {const res = await fetch("http://localhost:8000/report", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data)
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "forensic_report.pdf";
      a.click();
    }}
    className="px-4 py-2 mt-10 font-medium transition bg-blue-600 rounded-lg hover:bg-blue-700">
      📄 Download Forensic Report (PDF)
      </button>
      </div>
  );
}