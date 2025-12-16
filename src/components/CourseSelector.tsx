import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Check, AlertTriangle, GraduationCap, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { JAMB_COURSE_REQUIREMENTS, type CourseRequirement } from '@/data/jambCourseRequirements';

interface CourseSelectorProps {
  userSubjects: string[];
  selectedCourse: CourseRequirement | null;
  onSelectCourse: (course: CourseRequirement) => void;
  onClose?: () => void;
  embedded?: boolean;
}

export const CourseSelector = ({
  userSubjects,
  selectedCourse,
  onSelectCourse,
  onClose,
  embedded = false
}: CourseSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyMatching, setShowOnlyMatching] = useState(false);

  // Prevent background scroll when modal is open (not embedded)
  useEffect(() => {
    if (!embedded) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [embedded]);

  // Normalize subject names for comparison
  const normalizeSubject = (subject: string): string => {
    return subject.toLowerCase()
      .replace('use of english', 'english')
      .replace('english language', 'english')
      .replace('literature in english', 'literature')
      .replace('christian religious studies', 'crs')
      .replace('islamic religious studies', 'irs')
      .replace('agric science', 'agricultural_science')
      .replace('agric', 'agricultural_science')
      .replace(/ /g, '_');
  };

  const userSubjectsNormalized = userSubjects.map(normalizeSubject);

  // Check if course matches user's subjects
  const checkCourseMatch = (course: CourseRequirement) => {
    const requiredNormalized = course.subjects.map(normalizeSubject);
    const matchingCount = requiredNormalized.filter(req => 
      userSubjectsNormalized.some(user => user.includes(req) || req.includes(user))
    ).length;
    const missingSubjects = course.subjects.filter(req => 
      !userSubjectsNormalized.some(user => {
        const norm = normalizeSubject(req);
        return user.includes(norm) || norm.includes(user);
      })
    );
    return {
      isFullMatch: matchingCount === 4,
      matchingCount,
      missingSubjects
    };
  };

  // Filter and sort courses
  const filteredCourses = useMemo(() => {
    let courses = JAMB_COURSE_REQUIREMENTS;

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      courses = courses.filter(c => 
        c.course.toLowerCase().includes(query) ||
        c.faculty.toLowerCase().includes(query)
      );
    }

    // Add match info
    const coursesWithMatch = courses.map(course => ({
      ...course,
      matchInfo: checkCourseMatch(course)
    }));

    // Filter by matching only
    if (showOnlyMatching) {
      return coursesWithMatch.filter(c => c.matchInfo.isFullMatch);
    }

    // Sort: full matches first, then by matching count
    return coursesWithMatch.sort((a, b) => {
      if (a.matchInfo.isFullMatch && !b.matchInfo.isFullMatch) return -1;
      if (!a.matchInfo.isFullMatch && b.matchInfo.isFullMatch) return 1;
      return b.matchInfo.matchingCount - a.matchInfo.matchingCount;
    });
  }, [searchQuery, showOnlyMatching, userSubjectsNormalized]);

  const matchingCount = filteredCourses.filter(c => c.matchInfo.isFullMatch).length;

  return (
    <div className={`${embedded ? '' : 'fixed inset-0 z-50 bg-background/95 backdrop-blur-sm'}`}>
      <div className={`${embedded ? '' : 'container mx-auto max-w-2xl h-full flex flex-col p-4'}`}>
        {!embedded && (
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-bold">Select Your Target Course</h2>
            </div>
            {onClose && (
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>
        )}

        {/* Search and Filter */}
        <div className="space-y-3 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search course or faculty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Button
              variant={showOnlyMatching ? "default" : "outline"}
              size="sm"
              onClick={() => setShowOnlyMatching(!showOnlyMatching)}
              className="text-xs"
            >
              <Check className="h-3 w-3 mr-1" />
              Show only matching ({matchingCount})
            </Button>
            <span className="text-xs text-muted-foreground">
              {filteredCourses.length} courses
            </span>
          </div>
        </div>

        {/* Course List */}
        <ScrollArea className={`flex-1 ${embedded ? 'h-[400px]' : ''}`}>
          <div className="space-y-2 pr-4">
            <AnimatePresence mode="popLayout">
              {filteredCourses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.02 }}
                >
                  <button
                    onClick={() => onSelectCourse(course)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      selectedCourse?.id === course.id
                        ? 'border-primary bg-primary/10'
                        : course.matchInfo.isFullMatch
                          ? 'border-green-500/30 bg-green-500/5 hover:bg-green-500/10'
                          : 'border-border hover:border-muted-foreground/30 hover:bg-muted/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-sm truncate">{course.course}</h3>
                          {course.matchInfo.isFullMatch && (
                            <Badge variant="secondary" className="bg-green-500/20 text-green-400 text-[10px] shrink-0">
                              <Check className="h-2.5 w-2.5 mr-0.5" />
                              Match
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{course.faculty}</p>
                      </div>
                      {selectedCourse?.id === course.id && (
                        <Check className="h-4 w-4 text-primary shrink-0" />
                      )}
                    </div>

                    {/* Missing subjects warning */}
                    {!course.matchInfo.isFullMatch && course.matchInfo.missingSubjects.length > 0 && (
                      <div className="mt-2 flex items-start gap-1.5 text-xs text-yellow-500">
                        <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5" />
                        <span>Missing: {course.matchInfo.missingSubjects.join(', ')}</span>
                      </div>
                    )}

                    {/* Required subjects */}
                    <div className="mt-2 flex flex-wrap gap-1">
                      {course.subjects.map((subject, idx) => {
                        const isMatched = userSubjectsNormalized.some(user => {
                          const norm = normalizeSubject(subject);
                          return user.includes(norm) || norm.includes(user);
                        });
                        return (
                          <Badge
                            key={idx}
                            variant="outline"
                            className={`text-[10px] ${
                              isMatched 
                                ? 'border-green-500/30 text-green-400' 
                                : 'border-red-500/30 text-red-400'
                            }`}
                          >
                            {subject}
                          </Badge>
                        );
                      })}
                    </div>
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredCourses.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <GraduationCap className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No courses found</p>
                <p className="text-xs mt-1">Try a different search term</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
