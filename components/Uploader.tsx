"use client";
import { useCallback, useState } from "react";
import { useDropzone, FileRejection } from "react-dropzone";
import ProgressBar from "./ProgressBar";

interface UploadingFile {
  file: File;
  progress: number;
  error?: string;
}

interface UploaderProps {
  onComplete: (files: File[]) => void;
}

export default function Uploader({ onComplete }: UploaderProps) {
  const [files, setFiles] = useState<UploadingFile[]>([]);
  const onDrop = useCallback((accepted: File[], _rejected: FileRejection[]) => {
    const newFiles: UploadingFile[] = [];
    accepted.forEach((file) => {
      if (file.size > 10 * 1024 * 1024) {
        newFiles.push({ file, progress: 0, error: "File exceeds 10MB limit" });
        return;
      }
      newFiles.push({ file, progress: 0 });
    });
    setFiles(newFiles);
    // Simulate upload progress
    newFiles.forEach((uf, idx) => {
      if (uf.error) return;
      const interval = setInterval(() => {
        setFiles((curr) => {
          const copy = [...curr];
          const f = copy[idx];
          if (f.progress >= 100) {
            clearInterval(interval);
            return curr;
          }
          f.progress += 10;
          if (f.progress >= 100) f.progress = 100;
          return copy;
        });
      }, 150);
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
  });

  const allUploaded =
    files.length > 0 && files.every((f) => f.progress === 100 || f.error);

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent ${
          isDragActive ? "bg-secondary-700/5" : "bg-white"
        }`}
        aria-label="File uploader"
      >
        <input {...getInputProps()} aria-label="Upload files" />
        <p className="font-semibold mb-2">
          Drag & drop files or click to select
        </p>
        <p className="text-sm text-text-secondary">Up to 10MB each</p>
      </div>
      {files.map((f, i) => (
        <div key={i} className="space-y-1" aria-live="polite">
          <div className="flex justify-between text-sm">
            <span>{f.file.name}</span>
            <span>{Math.round(f.file.size / 1024)} KB</span>
          </div>
          {f.error ? (
            <p className="text-red-600 text-sm">{f.error}</p>
          ) : (
            <ProgressBar value={f.progress} />
          )}
        </div>
      ))}
      {allUploaded && (
        <button
          className="mt-4 px-4 py-2 bg-accent text-white rounded-md"
          onClick={() =>
            onComplete(files.filter((f) => !f.error).map((f) => f.file))
          }
        >
          Start Analysis
        </button>
      )}
    </div>
  );
}
