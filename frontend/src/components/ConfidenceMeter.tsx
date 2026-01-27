interface Props{
    score:number;
}

export default function ConfidenceMeter({score}:Props){
    let color= "bg-green-500";
    let label="Low Risk";

    if(score>40 && score<=70){
        color="bg-yellow-400";
        label="Medium Risk";
    }

    if(score>70){
        color="bg-red-500";
        label="High Risk";
    }

    return (
        <div className="mt-6">
            <p className="mb-2 text-gray-300">Confidence Level</p>
            <div className="w-full h-4 bg-gray-700 rounded-full">
                <div className= {`${color} h-4 rounded-full transition-all`}
                style={{width: `{score}%`}}>
                </div>
            </div>
            <p className="mt-2 text-sm text-gray-400">{label}</p>
        </div>
    );
}