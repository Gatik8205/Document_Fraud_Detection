import { useState, useRef } from "react";

type Props = {
  onFileSelect: (file: File) => void;
};

export default function FileUpload({ onFileSelect }: Props) {
  const [dragging, setDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setSelectedFile(file.name);
    onFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div
      className="relative cursor-pointer group"
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      {/* Corner brackets */}
      <div
        className="relative p-8 transition-all duration-300 border"
        style={{
          background: dragging
            ? 'rgba(212, 136, 10, 0.05)'
            : 'rgba(20, 20, 22, 0.8)',
          borderColor: dragging
            ? 'rgba(212, 136, 10, 0.5)'
            : selectedFile
              ? 'rgba(212, 136, 10, 0.25)'
              : 'rgba(232, 228, 217, 0.08)',
          minHeight: '180px',
        }}
      >
        {/* TL corner */}
        <span className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2" style={{ borderColor: 'var(--amber)' }} />
        {/* TR corner */}
        <span className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2" style={{ borderColor: 'var(--amber)' }} />
        {/* BL corner */}
        <span className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2" style={{ borderColor: 'var(--amber)' }} />
        {/* BR corner */}
        <span className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2" style={{ borderColor: 'var(--amber)' }} />

        <div className="flex flex-col items-center justify-center gap-4 text-center">
          {/* Icon */}
          <div
            className="flex items-center justify-center transition-all duration-300 w-14 h-14"
            style={{
              background: dragging ? 'rgba(212, 136, 10, 0.12)' : 'rgba(212, 136, 10, 0.06)',
              border: '1px solid',
              borderColor: dragging ? 'rgba(212, 136, 10, 0.5)' : 'rgba(212, 136, 10, 0.2)',
            }}
          >
            {selectedFile ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#d4880a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" stroke="#d4880a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>

          {selectedFile ? (
            <div>
              <p className="font-mono text-sm" style={{ color: 'var(--amber-bright)' }}>
                FILE LOADED
              </p>
              <p className="max-w-xs mt-1 text-sm truncate" style={{ color: 'var(--text-secondary)' }}>
                {selectedFile}
              </p>
              <p className="mt-2 font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                CLICK TO REPLACE
              </p>
            </div>
          ) : (
            <div>
              <p className="font-mono text-sm" style={{ color: 'var(--text-primary)' }}>
                DROP FILE OR CLICK TO BROWSE
              </p>
              <p className="mt-1 font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                ACCEPTED: JPG · PNG · PDF
              </p>
            </div>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept=".jpg,.jpeg,.png,.pdf"
        onChange={(e) => {
          if (e.target.files?.[0]) handleFile(e.target.files[0]);
        }}
      />
    </div>
  );
}