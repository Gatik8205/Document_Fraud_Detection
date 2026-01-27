interface Props{
    onFileSelect: (file: File) => void;
}

export default function FileUpload({ onFileSelect}: Props) {
    return (
        <div className="border-2 border-dashed border-gray-400 rounded-lg p-8 text-center">
        <input
        type="file"
        accept=".png,.jpg,.jpeg,.pdf"
        id="fileUpload"
        className="hidden"
        onChange={(e)=>{
            if(e.target.files){
                onFileSelect(e.target.files[0]);
            }
        }}
        />
        <label
        htmlFor="fileUpload"
        className="cursor-pointer text-blue-400 font-semibold"
        >
            Click to upload a document
        </label>
        </div>
    );
}