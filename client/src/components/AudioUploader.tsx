import { useState, useRef } from "react";
import { Mic, UploadCloud, Loader2, CheckCircle2 } from "lucide-react";
import { useTranscribeAudio } from "@/hooks/use-cases";
import { useToast } from "@/hooks/use-toast";

interface AudioUploaderProps {
  onTranscribed: (text: string) => void;
}

export function AudioUploader({ onTranscribed }: AudioUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mutate: transcribe, isPending } = useTranscribeAudio();
  const { toast } = useToast();

  const handleFile = (file: File) => {
    if (!file.type.startsWith("audio/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an audio file (MP3, WAV, M4A)",
        variant: "destructive",
      });
      return;
    }

    transcribe(file, {
      onSuccess: (data) => {
        onTranscribed(data.text);
        toast({
          title: "Transcription Complete",
          description: "Audio has been successfully converted to text.",
          className: "bg-green-50 border-green-200 text-green-900",
        });
      },
      onError: (error) => {
        toast({
          title: "Transcription Failed",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div
      onClick={() => fileInputRef.current?.click()}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`
        relative overflow-hidden group cursor-pointer
        border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300
        flex flex-col items-center justify-center gap-4 bg-slate-50
        ${isDragging 
          ? "border-primary bg-blue-50 scale-[0.99]" 
          : "border-slate-200 hover:border-primary/50 hover:bg-white"}
      `}
    >
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="audio/*"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />

      {isPending ? (
        <div className="flex flex-col items-center gap-3 animate-in fade-in zoom-in duration-300">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
            <Loader2 className="w-12 h-12 text-primary animate-spin relative z-10" />
          </div>
          <p className="text-sm font-medium text-primary">Transcribing audio...</p>
        </div>
      ) : (
        <>
          <div className={`
            w-16 h-16 rounded-full flex items-center justify-center mb-2 transition-all duration-300
            ${isDragging ? "bg-primary text-white scale-110" : "bg-white text-primary shadow-sm group-hover:shadow-md group-hover:scale-105"}
          `}>
            <Mic size={28} />
          </div>
          <div className="space-y-1">
            <h3 className="font-display font-semibold text-slate-900">
              Upload Patient Audio
            </h3>
            <p className="text-sm text-slate-500">
              Drag & drop or click to upload audio file
            </p>
          </div>
          <div className="text-xs font-medium text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-100">
            Supports MP3, WAV, M4A
          </div>
        </>
      )}
    </div>
  );
}
