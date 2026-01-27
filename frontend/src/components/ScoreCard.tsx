interface Props{
    score: number;
}

export default function ScoreCard({score}:Props) {
    const color= score>70 ? "text-red-500" : score>40 ? "text-yellow-400" : "text-green-400";

    return(
        <div className="p-6 shadow-lg bg-slate-800 rounded-xl ">
            <h2 className="mb-2 text-lg text-gray-300">Fraud Probability</h2>
            <p className={`text-5xl font-bold ${color}`}>
                {score}%
            </p>
        </div>
    );
}