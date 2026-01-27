import { useState } from "react";
import { useNavigate } from "react-router-dom";
import FileUpload from "../components/FileUpload";
import { analyzeDocument } from "../services/api";
import Loader from "../components/Loader";

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAnalyze = async () => {
    if (!file) return;

    setLoading(true);

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
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900">
      <div className="w-full max-w-lg p-8 shadow-xl bg-slate-800 rounded-xl">
        <h1 className="mb-6 text-3xl font-bold text-center text-white">
          Document Fraud Detection
        </h1>

        <FileUpload onFileSelect={setFile} />

        {file && (
          <p className="mt-3 text-center text-green-400">
            Selected: {file.name}
          </p>
        )}

        {loading ? (
          <Loader />
        ) : (
          <button
            onClick={handleAnalyze}
            className="w-full py-2 mt-6 text-white transition bg-indigo-600 rounded hover:bg-indigo-700"
          >
            Analyze Document
          </button>
        )}
      </div>
    </div>
  );
}
