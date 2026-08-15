import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, Camera, FileText, X, CheckCircle, Sparkles, Loader2, BookOpen, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useFeatureUsage } from '@/hooks/useFeatureUsage';
import { FeatureLimitReached } from '@/components/FeatureLimitReached';

interface ExtractedQuestion {
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation: string;
  year?: number;
  subject?: string;
}

interface UploadSectionProps {
  onUploadComplete: (files: File[]) => void;
  userSubjects?: string[];
}

export const UploadSection = ({ onUploadComplete, userSubjects = [] }: UploadSectionProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedQuestions, setExtractedQuestions] = useState<ExtractedQuestion[]>([]);
  const [aiMessage, setAiMessage] = useState('');
  const [showLimitReached, setShowLimitReached] = useState(false);
  
  // Feature usage limits
  const { canUseFeature, incrementUsage, getRemainingUses, refreshUsage } = useFeatureUsage();

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

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleBonusEarned = async () => {
    await refreshUsage();
    setShowLimitReached(false);
    toast.success('Bonus use earned! You can now upload 1 more file.');
  };

  const processWithAI = async () => {
    if (files.length === 0) return;
    
    // Check feature usage limit for each file
    const remaining = getRemainingUses('pdf_upload');
    if (remaining !== Infinity && files.length > remaining) {
      if (remaining === 0) {
        setShowLimitReached(true);
        return;
      }
      toast.error(`You can only upload ${remaining} more file(s) today. Upgrade to ACE for unlimited!`);
      return;
    }
    
    if (!canUseFeature('pdf_upload')) {
      setShowLimitReached(true);
      return;
    }

    setIsProcessing(true);
    setExtractedQuestions([]);
    
    try {
      const allQuestions: ExtractedQuestion[] = [];
      const defaultSubject = userSubjects[0] || 'english';

      for (const file of files) {
        // Convert file to base64
        const base64 = await fileToBase64(file);
        
        const { data, error } = await supabase.functions.invoke('process-upload', {
          body: {
            imageBase64: base64,
            fileType: file.type.includes('pdf') ? 'PDF' : 'image',
            subject: defaultSubject
          }
        });

        if (error) {
          console.error('Processing error:', error);
          toast.error(`Failed to process ${file.name}`);
          continue;
        }

        if (data.questions && data.questions.length > 0) {
          allQuestions.push(...data.questions);
        }
        
        if (data.message) {
          setAiMessage(data.message);
        }
      }

      setExtractedQuestions(allQuestions);
      
      if (allQuestions.length > 0) {
        toast.success(`🎉 Extracted ${allQuestions.length} questions! You're crushing it!`);
      } else {
        toast.info('No questions found. Try a clearer image! 📸');
      }

      // Track usage for each file processed
      for (let i = 0; i < files.length; i++) {
        await incrementUsage('pdf_upload');
      }

      // Don't redirect to study plan - just notify completion
      if (allQuestions.length > 0) {
        onUploadComplete(files);
      }
    } catch (err) {
      console.error('Error processing files:', err);
      toast.error('Oops! Something went wrong. Try again! 💪');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <section className="py-16 md:py-24">
      <div className="container max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            📚 Upload JAMB Past Questions
          </h2>
          <p className="text-lg text-muted-foreground">
            Upload PDFs or snap photos — our AI extracts & explains every question! ✨
          </p>
        </motion.div>

        {/* Show limit reached component if daily limit is hit */}
        {showLimitReached && (
          <FeatureLimitReached
            featureType="pdf_upload"
            onBonusEarned={handleBonusEarned}
            className="mb-8"
          />
        )}

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
              🎯 Drag & drop your files here
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Supports PDF and image files (JPG, PNG) — we'll do the magic! ✨
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="default" size="lg" asChild>
                <label className="cursor-pointer">
                  <FileText className="w-5 h-5 mr-2" />
                  Choose PDF
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </label>
              </Button>
              <Button variant="outline" size="lg" onClick={handleCameraCapture}>
                <Camera className="w-5 h-5 mr-2" />
                📸 Take Photo
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
              onClick={processWithAI}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  AI is working its magic... ✨
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  🚀 Process {files.length} File{files.length > 1 ? 's' : ''} with AI Magic!
                </>
              )}
            </Button>
          </motion.div>
        )}

        {/* AI Message */}
        {aiMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-6 p-4 rounded-xl bg-primary/10 border border-primary/20 text-center"
          >
            <p className="text-primary font-medium">{aiMessage}</p>
          </motion.div>
        )}

        {/* Extracted Questions */}
        {extractedQuestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                📝 Extracted Questions ({extractedQuestions.length})
              </h3>
              <Button variant="outline" size="sm">
                Quiz These Questions
              </Button>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {extractedQuestions.map((q, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 rounded-xl bg-card border border-border"
                >
                  <p className="font-medium text-foreground mb-3">
                    <span className="text-primary">Q{index + 1}.</span> {q.question}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                    {['A', 'B', 'C', 'D'].map((letter) => {
                      const optionKey = `option_${letter.toLowerCase()}` as keyof ExtractedQuestion;
                      const isCorrect = q.correct_answer === letter;
                      return (
                        <div
                          key={letter}
                          className={`p-2 rounded-lg text-sm ${
                            isCorrect 
                              ? 'bg-green-500/20 border border-green-500/50 text-green-700 dark:text-green-400 font-bold' 
                              : 'bg-muted/50'
                          }`}
                        >
                          <span className={`font-medium ${isCorrect ? 'underline' : ''}`}>
                            {letter}.
                          </span> {q[optionKey]}
                          {isCorrect && ' ✓'}
                        </div>
                      );
                    })}
                  </div>
                  <div className="p-3 rounded-lg bg-accent/50 text-sm">
                    <p className="text-muted-foreground">
                      <span className="font-medium text-foreground">💡 Why {q.correct_answer} is correct:</span>{' '}
                      {q.explanation}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};
