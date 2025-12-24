import { motion } from 'framer-motion';
import { Book, Clock, Lock, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface NovelCardProps {
  id: string;
  title: string;
  author: string;
  description?: string;
  coverImageUrl?: string;
  category: string;
  totalChapters: number;
  year?: number;
  isPremium: boolean;
  progress?: number;
  isLocked?: boolean;
  onClick: () => void;
}

const categoryColors: Record<string, string> = {
  general_reading: 'bg-primary/10 text-primary border-primary/30',
  african_prose: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30',
  non_african_prose: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
  african_drama: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30',
  non_african_drama: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/30',
  african_poetry: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30',
  non_african_poetry: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30',
};

const categoryLabels: Record<string, string> = {
  general_reading: 'General Reading',
  african_prose: 'African Prose',
  non_african_prose: 'Non-African Prose',
  african_drama: 'African Drama',
  non_african_drama: 'Non-African Drama',
  african_poetry: 'African Poetry',
  non_african_poetry: 'Non-African Poetry',
};

export const NovelCard = ({
  title,
  author,
  coverImageUrl,
  category,
  totalChapters,
  year,
  isPremium,
  progress = 0,
  isLocked = false,
  onClick,
}: NovelCardProps) => {
  const isNew = year === 2025;
  
  return (
    <motion.div
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative rounded-xl border bg-card overflow-hidden cursor-pointer transition-shadow hover:shadow-soft ${
        isLocked ? 'opacity-75' : ''
      }`}
    >
      {/* Cover Image / Placeholder */}
      <div className="relative h-40 bg-gradient-to-br from-primary/20 to-accent overflow-hidden">
        {coverImageUrl ? (
          <img 
            src={coverImageUrl} 
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Book className="w-16 h-16 text-primary/40" />
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-1.5 flex-wrap">
          {isNew && (
            <Badge className="bg-primary text-primary-foreground text-xs font-bold">
              NEW 2025
            </Badge>
          )}
          {isPremium && (
            <Badge variant="secondary" className="text-xs">
              <Star className="w-3 h-3 mr-1" /> Premium
            </Badge>
          )}
        </div>
        
        {/* Lock overlay */}
        {isLocked && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center">
            <Lock className="w-8 h-8 text-muted-foreground" />
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-4">
        <Badge 
          variant="outline" 
          className={`text-xs mb-2 ${categoryColors[category] || 'bg-muted text-muted-foreground'}`}
        >
          {categoryLabels[category] || category}
        </Badge>
        
        <h3 className="font-bold text-foreground line-clamp-2 mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground mb-3">{author}</p>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Book className="w-3 h-3" />
            {totalChapters} {totalChapters === 1 ? 'chapter' : 'chapters'}
          </span>
          {year && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              JAMB {year}
            </span>
          )}
        </div>
        
        {/* Progress bar */}
        {progress > 0 && (
          <div className="mt-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Progress</span>
              <span className="text-primary font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        )}
      </div>
    </motion.div>
  );
};
