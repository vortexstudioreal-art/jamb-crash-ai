import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, Camera, FileText, X, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UploadSectionProps {
  onUploadComplete: (files: File[]) => void;
}

export const UploadSection = ({ onUploadComplete }: UploadSectionProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      file => file.type === 'application/pdf' || file.type.startsWith('image/')
    );
    setFiles(prev => [...prev, ...droppedFiles]);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...selectedFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleCameraCapture = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files) {
        setFiles(prev => [...prev, ...Array.from(target.files!)]);
      }
    };
    input.click();
  };

  return (
    <section className="py-16 md:py-24">
      <div className="container max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Upload Your Past Questions
          </h2>
          <p className="text-lg text-muted-foreground">
            Upload PDFs or take photos of your JAMB past question papers
          </p>
        </motion.div>

        {/* Upload area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`relative border-2 border-dashed rounded-2xl p-8 md:p-12 text-center transition-all ${
            isDragging ? 'border-primary bg-accent/50' : 'border-border hover:border-primary/50'
          }`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mb-4">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            <p className="text-lg font-medium text-foreground mb-2">
              Drag & drop your files here
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Supports PDF and image files (JPG, PNG)
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="default" size="lg" asChild>
                <label className="cursor-pointer">
                  <FileText className="w-5 h-5 mr-2" />
                  Choose PDF
                  <input
                    type="file"
                    accept=".pdf"
                    multiple
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </label>
              </Button>
              <Button variant="outline" size="lg" onClick={handleCameraCapture}>
                <Camera className="w-5 h-5 mr-2" />
                Take Photo
              </Button>
            </div>
          </div>
        </motion.div>

        {/* File list */}
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-6 space-y-3"
          >
            {files.map((file, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border"
              >
                <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
                  {file.type === 'application/pdf' ? (
                    <FileText className="w-5 h-5 text-primary" />
                  ) : (
                    <Camera className="w-5 h-5 text-primary" />
                  )}
                </div>
                <div className="flex-grow min-w-0">
                  <p className="font-medium text-foreground truncate">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </motion.div>
            ))}

            <Button
              variant="hero"
              size="xl"
              className="w-full mt-6"
              onClick={() => onUploadComplete(files)}
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              Process {files.length} File{files.length > 1 ? 's' : ''} with AI
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  );
};
