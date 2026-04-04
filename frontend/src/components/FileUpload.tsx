type Props = {
  onFileSelect: (file: File) => void;
};

export default function FileUpload({ onFileSelect }: Props) {
  return (
    <label className="flex flex-col items-center justify-center w-full h-48 transition border-2 border-dashed cursor-pointer border-slate-600 rounded-2xl bg-slate-900/60 hover:border-indigo-500 hover:bg-slate-900">
      
      {/* Icon */}
      <div className="mb-4 text-5xl">📄</div>

      {/* Text */}
      <p className="font-medium text-slate-300">
        Click to upload a document
      </p>
      <p className="mt-1 text-xs text-slate-500">
        JPG, PNG or PDF
      </p>

      {/* Hidden input */}
      <input
        type="file"
        className="hidden"
        accept=".jpg,.jpeg,.png,.pdf"
        onChange={(e) => {
          if (e.target.files?.[0]) {
            onFileSelect(e.target.files[0]);
          }
        }}
      />
    </label>
  );
}
