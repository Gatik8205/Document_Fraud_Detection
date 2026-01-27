import type { FraudBreakdown } from "../types/fraud";

export default function RiskBreakdown({ data }: { data: FraudBreakdown }) {
  return (
    <div className="p-6 bg-slate-800 rounded-xl">
      <h3 className="mb-4 text-lg">Risk Breakdown</h3>
      <ul className="space-y-2 text-gray-300">
        <li>🖼 Image Analysis: {data.image}%</li>
        <li>📝 Text Analysis: {data.text}%</li>
        <li>🧾 Metadata Analysis: {data.meta}%</li>
      </ul>
    </div>
  );
}
