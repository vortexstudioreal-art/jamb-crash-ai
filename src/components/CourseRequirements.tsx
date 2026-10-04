import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, GraduationCap, CheckCircle2, XCircle, AlertTriangle, ArrowLeft, BookOpen, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  JAMB_COURSE_REQUIREMENTS, 
  FACULTIES, 
  checkSubjectMatch, 
  getMatchingCourses,
  
  SUBJECT_DISPLAY_NAMES,
  CourseRequirement 
} from '@/data/jambCourseRequirements';

interface CourseRequirementsProps {
  userSubjects?: string[];
  onBack?: () => void;
  isEmbedded?: boolean; // For StudyMaterials tab
}

export const CourseRequirements = ({ userSubjects = [], onBack, isEmbedded = false }: CourseRequirementsProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState<string>('all');
  const [showOnlyMatching, setShowOnlyMatching] = useState(false);
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);

  const hasUserSubjects = userSubjects.length > 0;
  const matchingCourses = useMemo(() => getMatchingCourses(userSubjects), [userSubjects]);
  const filteredCourses = useMemo(() => {
    let courses = JAMB_COURSE_REQUIREMENTS;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      courses = courses.filter(c => 
        c.course.toLowerCase().includes(query) ||
        c.faculty.toLowerCase().includes(query)
      );
    }

    // Filter by faculty
    if (selectedFaculty !== 'all') {
      courses = courses.filter(c => c.faculty === selectedFaculty);
    }

    // Filter by matching subjects
    if (showOnlyMatching && hasUserSubjects) {
      courses = courses.filter(c => {
        const { matches } = checkSubjectMatch(userSubjects, c.subjects);
        return matches;
      });
    }

    return courses;
  }, [searchQuery, selectedFaculty, showOnlyMatching, userSubjects, hasUserSubjects]);

  const renderSubjectBadge = (subject: string, isMatched: boolean, isMissing: boolean) => {
    const displayName = SUBJECT_DISPLAY_NAMES[subject] || subject;
    
    if (!hasUserSubjects) {
      return (
        <Badge key={subject} variant="secondary" className="text-xs">
          {displayName}
        </Badge>
      );
    }

    if (isMatched) {
      return (
        <Badge key={subject} className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          {displayName}
        </Badge>
      );
    }

    if (isMissing) {
      return (
        <Badge key={subject} variant="destructive" className="text-xs">
          <XCircle className="w-3 h-3 mr-1" />
          {displayName}
        </Badge>
      );
    }

    return (
      <Badge key={subject} variant="secondary" className="text-xs">
        {displayName}
      </Badge>
    );
  };

  const renderCourseCard = (course: CourseRequirement) => {
    const { matches, matchedSubjects, missingSubjects, matchPercentage } = checkSubjectMatch(userSubjects, course.subjects);
    const isExpanded = expandedCourse === course.id;

    return (
      <motion.div
        key={course.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-3"
      >
        <Card 
          className={`cursor-pointer transition-all hover:border-primary/50 ${
            matches && hasUserSubjects ? 'border-green-500/50 bg-green-500/5' : ''
          }`}
          onClick={() => setExpandedCourse(isExpanded ? null : course.id)}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-foreground truncate">{course.course}</h3>
                  {hasUserSubjects && (
                    matches ? (
                      <Badge className="bg-green-500 text-white text-xs shrink-0">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Eligible
                      </Badge>
                    ) : matchPercentage >= 50 ? (
                      <Badge variant="outline" className="border-yellow-500/50 text-yellow-400 text-xs shrink-0">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        {Math.round(matchPercentage)}% Match
                      </Badge>
                    ) : null
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{course.faculty}</p>
                
                {/* Required Subjects */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {course.subjects.map(subject => 
                    renderSubjectBadge(
                      subject, 
                      matchedSubjects.includes(subject),
                      missingSubjects.includes(subject)
                    )
                  )}
                </div>

                {/* Missing subjects warning */}
                {hasUserSubjects && missingSubjects.length > 0 && (
                  <div className="mt-3 p-2 bg-destructive/10 rounded-lg border border-destructive/20">
                    <p className="text-sm text-destructive flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>
                        Missing: {missingSubjects.map(s => SUBJECT_DISPLAY_NAMES[s] || s).join(', ')}
                      </span>
                    </p>
                  </div>
                )}

                {/* Notes */}
                {isExpanded && course.notes && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3 p-3 bg-muted/50 rounded-lg"
                  >
                    <p className="text-sm text-muted-foreground">
                      <BookOpen className="w-4 h-4 inline mr-2" />
                      {course.notes}
                    </p>
                  </motion.div>
                )}
              </div>
              
              <Button variant="ghost" size="icon" className="shrink-0">
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const content = (
    <div className={isEmbedded ? '' : 'min-h-screen bg-background p-4 pt-6'}>
      {!isEmbedded && onBack && (
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      )}

      <div className={isEmbedded ? '' : 'max-w-4xl mx-auto'}>
        {/* Header */}
        {!isEmbedded && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <GraduationCap className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              JAMB Course Requirements 2026
            </h1>
            <p className="text-muted-foreground">
              Find the right subject combination for your dream course
            </p>
          </motion.div>
        )}

        {/* User subjects summary */}
        {hasUserSubjects && (
          <Card className="mb-4 border-primary/30 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Your Selected Subjects:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {userSubjects.map(s => (
                      <Badge key={s} variant="secondary" className="text-xs">
                        {SUBJECT_DISPLAY_NAMES[s] || s}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">{matchingCourses.length}</p>
                  <p className="text-xs text-muted-foreground">Eligible Courses</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search and filters */}
        <div className="space-y-3 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search courses (e.g., Medicine, Law, Engineering...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Select value={selectedFaculty} onValueChange={setSelectedFaculty}>
              <SelectTrigger className="w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Faculty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Faculties</SelectItem>
                {FACULTIES.map(faculty => (
                  <SelectItem key={faculty} value={faculty}>{faculty}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasUserSubjects && (
              <Button
                variant={showOnlyMatching ? "default" : "outline"}
                onClick={() => setShowOnlyMatching(!showOnlyMatching)}
                size="sm"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Show Only Eligible ({matchingCourses.length})
              </Button>
            )}
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-muted-foreground mb-3">
          Showing {filteredCourses.length} of {JAMB_COURSE_REQUIREMENTS.length} courses
        </p>

        {/* Course list */}
        <ScrollArea className={isEmbedded ? 'h-[400px]' : 'h-[calc(100vh-400px)]'}>
          <AnimatePresence>
            {filteredCourses.length > 0 ? (
              filteredCourses.map(renderCourseCard)
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <GraduationCap className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No courses found matching your search.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </ScrollArea>
      </div>
    </div>
  );

  return content;
};
