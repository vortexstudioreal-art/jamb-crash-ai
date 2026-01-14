import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { BookOpen, Calendar, TrendingUp, Loader2, AlertCircle } from 'lucide-react';
import { Constants } from '@/integrations/supabase/types';

interface QuestionWithCount {
  question: string;
  subject: string;
  year: number | null;
  correct_answer: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  explanation: string | null;
  count: number;
}

interface GroupedQuestions {
  [topic: string]: {
    [year: string]: QuestionWithCount[];
  };
}

const SUBJECT_LABELS: Record<string, string> = {
  english: 'English Language',
  mathematics: 'Mathematics',
  physics: 'Physics',
  chemistry: 'Chemistry',
  biology: 'Biology',
  literature: 'Literature',
  government: 'Government',
  economics: 'Economics',
  crs: 'Christian Religious Studies',
  irs: 'Islamic Religious Studies',
  geography: 'Geography',
  accounting: 'Accounting',
  commerce: 'Commerce',
  agricultural_science: 'Agricultural Science',
};

export const RepeatedQuestions = () => {
  const [selectedSubject, setSelectedSubject] = useState<string>('all');

  const { data: questions, isLoading, error } = useQuery({
    queryKey: ['repeated-questions', selectedSubject],
    queryFn: async () => {
      let query = supabase
        .from('jamb_questions')
        .select('*')
        .order('year', { ascending: false });

      if (selectedSubject !== 'all') {
        query = query.eq('subject', selectedSubject as typeof Constants.public.Enums.jamb_subject[number]);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Find repeated questions by comparing question text similarity
      const questionMap = new Map<string, QuestionWithCount[]>();
      
      data?.forEach((q) => {
        // Normalize question text for comparison
        const normalizedQ = q.question.toLowerCase().trim().replace(/\s+/g, ' ');
        const key = normalizedQ.substring(0, 100); // Use first 100 chars as key
        
        if (!questionMap.has(key)) {
          questionMap.set(key, []);
        }
        questionMap.get(key)!.push({
          ...q,
          count: 1,
        });
      });

      // Filter to only show questions that appear multiple times or across years
      const repeatedQuestions: QuestionWithCount[] = [];
      questionMap.forEach((questions, _key) => {
        if (questions.length > 1) {
          // Group by year
          const years = new Set(questions.map(q => q.year));
          questions.forEach(q => {
            repeatedQuestions.push({
              ...q,
              count: questions.length,
            });
          });
        }
      });

      return repeatedQuestions;
    },
  });

  // Group questions by topic (subject) and year
  const groupedQuestions: GroupedQuestions = {};
  
  questions?.forEach((q) => {
    const topic = q.subject;
    const year = q.year?.toString() || 'Unknown Year';
    
    if (!groupedQuestions[topic]) {
      groupedQuestions[topic] = {};
    }
    if (!groupedQuestions[topic][year]) {
      groupedQuestions[topic][year] = [];
    }
    groupedQuestions[topic][year].push(q);
  });

  // Get unique years for display
  const allYears = [...new Set(questions?.map(q => q.year).filter(Boolean))].sort((a, b) => (b || 0) - (a || 0));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading repeated questions...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <p>Failed to load questions. Please try again.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Frequently Repeated Questions
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Questions that appear multiple times across different years - high chance of appearing again!
              </p>
            </div>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {Constants.public.Enums.jamb_subject.map((subject) => (
                  <SelectItem key={subject} value={subject}>
                    {SUBJECT_LABELS[subject] || subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {Object.keys(groupedQuestions).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No repeated questions found for the selected criteria.</p>
              <p className="text-sm">This could mean all questions are unique!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="pt-4 pb-4">
                    <div className="text-2xl font-bold text-primary">{questions?.length || 0}</div>
                    <div className="text-xs text-muted-foreground">Total Repeated</div>
                  </CardContent>
                </Card>
                <Card className="bg-secondary/50">
                  <CardContent className="pt-4 pb-4">
                    <div className="text-2xl font-bold">{Object.keys(groupedQuestions).length}</div>
                    <div className="text-xs text-muted-foreground">Subjects</div>
                  </CardContent>
                </Card>
                <Card className="bg-accent/50">
                  <CardContent className="pt-4 pb-4">
                    <div className="text-2xl font-bold">{allYears.length}</div>
                    <div className="text-xs text-muted-foreground">Years Covered</div>
                  </CardContent>
                </Card>
                <Card className="bg-muted">
                  <CardContent className="pt-4 pb-4">
                    <div className="text-2xl font-bold">
                      {allYears[0] || 'N/A'}
                    </div>
                    <div className="text-xs text-muted-foreground">Latest Year</div>
                  </CardContent>
                </Card>
              </div>

              {/* Questions by Subject and Year */}
              <Accordion type="multiple" className="space-y-2">
                {Object.entries(groupedQuestions).map(([topic, yearGroups]) => (
                  <AccordionItem key={topic} value={topic} className="border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3">
                        <BookOpen className="h-4 w-4 text-primary" />
                        <span className="font-semibold">{SUBJECT_LABELS[topic] || topic}</span>
                        <Badge variant="secondary">
                          {Object.values(yearGroups).flat().length} questions
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pt-2">
                        {Object.entries(yearGroups)
                          .sort(([a], [b]) => parseInt(b) - parseInt(a))
                          .map(([year, yearQuestions]) => (
                            <div key={year} className="border-l-2 border-primary/30 pl-4">
                              <div className="flex items-center gap-2 mb-3">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium text-sm">{year}</span>
                                <Badge variant="outline" className="text-xs">
                                  {yearQuestions.length} question{yearQuestions.length > 1 ? 's' : ''}
                                </Badge>
                              </div>
                              <div className="space-y-3">
                                {yearQuestions.slice(0, 5).map((q, idx) => (
                                  <Card key={idx} className="bg-muted/30">
                                    <CardContent className="pt-4 pb-4">
                                      <div className="flex items-start justify-between gap-2 mb-2">
                                        <p className="text-sm font-medium leading-relaxed">
                                          {q.question}
                                        </p>
                                        {q.count > 1 && (
                                          <Badge className="shrink-0 bg-amber-500 text-white">
                                            ×{q.count}
                                          </Badge>
                                        )}
                                      </div>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3 text-sm">
                                        <div className={`p-2 rounded ${q.correct_answer === 'A' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' : 'bg-muted'}`}>
                                          A. {q.option_a}
                                        </div>
                                        <div className={`p-2 rounded ${q.correct_answer === 'B' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' : 'bg-muted'}`}>
                                          B. {q.option_b}
                                        </div>
                                        <div className={`p-2 rounded ${q.correct_answer === 'C' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' : 'bg-muted'}`}>
                                          C. {q.option_c}
                                        </div>
                                        <div className={`p-2 rounded ${q.correct_answer === 'D' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' : 'bg-muted'}`}>
                                          D. {q.option_d}
                                        </div>
                                      </div>
                                      {q.explanation && (
                                        <p className="text-xs text-muted-foreground mt-3 p-2 bg-background rounded">
                                          💡 {q.explanation}
                                        </p>
                                      )}
                                    </CardContent>
                                  </Card>
                                ))}
                                {yearQuestions.length > 5 && (
                                  <p className="text-xs text-muted-foreground text-center py-2">
                                    +{yearQuestions.length - 5} more questions...
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RepeatedQuestions;
