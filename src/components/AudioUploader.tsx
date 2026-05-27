import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileAudio } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AudioUploaderProps {
  onFileSelect: (file: File) => void;
  className?: string;
}

export function AudioUploader({ onFileSelect, className }: AudioUploaderProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.m4a']
    },
    multiple: false,
  } as any);

  return (
    <div
      {...getRootProps()}
      className={cn(
        "flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200",
        isDragActive ? "border-primary bg-primary/5 scale-[0.99]" : "border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/50",
        className
      )}
    >
      <input {...getInputProps()} />
      <div className="p-4 bg-primary/5 rounded-none mb-6">
        <Upload className="h-10 w-10 text-primary" />
      </div>
      <h3 className="label-caps px-0 text-xl text-foreground mb-2">Upload Audio Session</h3>
      <p className="text-sm text-muted-foreground text-center max-w-xs font-light italic">
        Drag and drop your audio session here, or browse local files (MP3, WAV, M4A)
      </p>
    </div>
  );
}
