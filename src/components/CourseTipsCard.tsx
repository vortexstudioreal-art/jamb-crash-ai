import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, 
  Target, 
  BookOpen, 
  Briefcase, 
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Edit2,
  Lightbulb
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getCourseTip, type CourseTip } from '@/data/courseTips';
import { JAMB_COURSE_REQUIREMENTS, type CourseRequirement } from '@/data/jambCourseRequirements';
import { CourseSelector } from './CourseSelector';
import { supabase } from '@/integrations/supabase/client';
import { errorLogger } from '@/services/errorLogger';
import { toast } from 'sonner';

interface CourseTipsCardProps {
  userEmail: string;
  userSubjects: string[];
}

export const CourseTipsCard = ({ userEmail, userSubjects }: CourseTipsCardProps) => {
  const [selectedCourse, setSelectedCourse] = useState<CourseRequirement | null>(null);
  const [courseTip, setCourseTip] = useState<CourseTip | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSelector, setShowSelector] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved course on mount
  useEffect(() => {
    const loadSavedCourse = async () => {
      try {
        const { data, error } = await supabase
          .from('user_study_preferences')
          .select('selected_course_id')
          .eq('email', userEmail)
          .maybeSingle();

        if (error) throw error;

        if (data?.selected_course_id) {
          const course = JAMB_COURSE_REQUIREMENTS.find(c => c.id === data.selected_course_id);
          if (course) {
            setSelectedCourse(course);
            setCourseTip(getCourseTip(course.course));
          }
        }
      } catch (error) {
        errorLogger.error(error, { component: 'CourseTipsCard', action: 'load course' });
      } finally {
        setIsLoading(false);
      }
    };

    if (userEmail) {
      loadSavedCourse();
    }
  }, [userEmail]);

  // Save course selection
  const handleSelectCourse = async (course: CourseRequirement) => {
    try {
      // Check if user has preferences record
      const { data: existing } = await supabase
        .from('user_study_preferences')
        .select('id')
        .eq('email', userEmail)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('user_study_preferences')
          .update({ selected_course_id: course.id })
          .eq('email', userEmail);
      } else {
        await supabase
          .from('user_study_preferences')
          .insert({ email: userEmail, selected_course_id: course.id });
      }

      setSelectedCourse(course);
      setCourseTip(getCourseTip(course.course));
      setShowSelector(false);
      toast.success(`Target course set to ${course.course}`);
    } catch (error) {
      errorLogger.error(error, { component: 'CourseTipsCard', action: 'save course' });
      toast.error('Failed to save course selection');
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-card/50 border-border/50 animate-pulse">
        <CardContent className="p-4">
          <div className="h-20 bg-muted/20 rounded" />
        </CardContent>
      </Card>
    );
  }

  // Show course selector modal
  if (showSelector) {
    return (
      <CourseSelector
        userSubjects={userSubjects}
        selectedCourse={selectedCourse}
        onSelectCourse={handleSelectCourse}
        onClose={() => setShowSelector(false)}
      />
    );
  }

  // No course selected - prompt to select
  if (!selectedCourse) {
    return (
      <Card className="bg-gradient-to-br from-primary/10 via-card to-card border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <GraduationCap className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm mb-1">Set Your Target Course</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Select your desired course to get personalized tips and score targets
              </p>
              <Button 
                size="sm" 
                onClick={() => setShowSelector(true)}
                className="h-8 text-xs"
              >
                Choose Course
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Course selected - show tips
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="bg-card border-border/50 overflow-hidden">
        <CardHeader className="pb-2 pt-3 px-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/20">
                <Lightbulb className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">Course Tips</CardTitle>
                <p className="text-xs text-muted-foreground">{selectedCourse.course}</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowSelector(true)}
              className="h-7 px-2 text-xs"
            >
              <Edit2 className="h-3 w-3 mr-1" />
              Change
            </Button>
          </div>
        </CardHeader>

        <CardContent className="px-4 pb-3 pt-0">
          {courseTip && (
            <div className="space-y-3">
              {/* Score Target */}
              <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/5 border border-primary/10">
                <Target className="h-4 w-4 text-primary" />
                <span className="text-xs">Target JAMB Score:</span>
                <Badge variant="secondary" className="bg-primary/20 text-primary font-bold">
                  {courseTip.targetScore}
                </Badge>
              </div>

              {/* Focus Subjects */}
              <div className="flex flex-wrap gap-1">
                <span className="text-xs text-muted-foreground mr-1">Focus on:</span>
                {courseTip.focusSubjects.map((subject, idx) => (
                  <Badge key={idx} variant="outline" className="text-[10px]">
                    {subject}
                  </Badge>
                ))}
              </div>

              {/* Quick Tip */}
              <p className="text-xs text-muted-foreground bg-muted/30 p-2 rounded-lg">
                💡 {courseTip.tips[0]}
              </p>

              {/* Expandable Details */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-3 pt-2 border-t border-border/50">
                      {/* All Tips */}
                      <div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <BookOpen className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs font-medium">Study Tips</span>
                        </div>
                        <ul className="space-y-1">
                          {courseTip.tips.slice(1).map((tip, idx) => (
                            <li key={idx} className="text-xs text-muted-foreground flex items-start gap-1.5">
                              <span className="text-primary">•</span>
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Career Prospects */}
                      <div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Briefcase className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs font-medium">Career Paths</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {courseTip.careerProspects.map((career, idx) => (
                            <Badge key={idx} variant="secondary" className="text-[10px]">
                              {career}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Backup Courses */}
                      <div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <GraduationCap className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs font-medium">Backup Options</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {courseTip.backupCourses.map((course, idx) => (
                            <Badge key={idx} variant="outline" className="text-[10px]">
                              {course}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Expand/Collapse Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full h-7 text-xs text-muted-foreground hover:text-foreground"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="h-3 w-3 mr-1" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3 w-3 mr-1" />
                    View More Tips
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
