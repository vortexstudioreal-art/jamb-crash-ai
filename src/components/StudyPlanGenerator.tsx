import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Calendar, Clock, BookOpen, CheckCircle, Star, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StudyPlanGeneratorProps {
  userEmail: string;
  subjects: string[];
  targetScore?: number;
  hoursPerDay?: number;
  weakestSubject?: string;
  examDate?: string;
  onBack: () => void;
}

interface DayPlan {
  day: number;
  date: string;
  subjects: {
    name: string;
    topics: string[];
    duration: string;
    priority: 'high' | 'medium' | 'low';
  }[];
  quizGoal: number;
  focusArea: string;
}

const SUBJECT_TOPICS: Record<string, string[]> = {
  english: ['Comprehension', 'Vocabulary', 'Grammar', 'Idioms & Phrases', 'Sentence Construction', 'Essay Writing', 'Summary', 'Oral English'],
  mathematics: ['Algebra', 'Geometry', 'Trigonometry', 'Statistics', 'Probability', 'Calculus', 'Indices & Logarithms', 'Sets'],
  physics: ['Mechanics', 'Waves', 'Electricity', 'Magnetism', 'Heat', 'Optics', 'Modern Physics', 'Measurements'],
  chemistry: ['Organic Chemistry', 'Inorganic Chemistry', 'Physical Chemistry', 'Electrochemistry', 'Acids & Bases', 'Chemical Bonding'],
  biology: ['Cell Biology', 'Genetics', 'Ecology', 'Plant Biology', 'Animal Biology', 'Reproduction', 'Evolution', 'Health'],
  literature: ['Prose', 'Poetry', 'Drama', 'African Literature', 'Literary Terms', 'Themes & Styles', 'Character Analysis'],
  government: ['Constitution', 'Federalism', 'Democracy', 'Political Parties', 'Nigerian Government', 'International Relations'],
  economics: ['Microeconomics', 'Macroeconomics', 'Trade', 'Money & Banking', 'National Income', 'Economic Development'],
  geography: ['Physical Geography', 'Human Geography', 'Map Reading', 'Climate', 'Population', 'Resources'],
  accounting: ['Financial Statements', 'Double Entry', 'Trial Balance', 'Depreciation', 'Partnership', 'Company Accounts'],
  commerce: ['Trade', 'Banking', 'Insurance', 'Transport', 'Business Organizations', 'Marketing'],
  crs: ['Old Testament', 'New Testament', 'Christian Ethics', 'Church History', 'Parables', 'Epistles'],
  irs: ['Quran Studies', 'Hadith', 'Fiqh', 'Islamic History', 'Tawheed', 'Islamic Ethics', 'Pillars of Islam'],
  agricultural_science: ['Soil Science', 'Crop Production', 'Animal Husbandry', 'Farm Management', 'Pests & Diseases'],
};

interface QuizPerformance {
  subject: string;
  accuracy: number;
}

export const StudyPlanGenerator = ({
  userEmail,
  subjects,
  targetScore = 300,
  hoursPerDay = 4,
  weakestSubject,
  examDate,
  onBack,
  quizPerformance = []
}: StudyPlanGeneratorProps & { quizPerformance?: QuizPerformance[] }) => {
  const [isGenerating, setIsGenerating] = useState(true);
  const [progress, setProgress] = useState(0);
  const [plan, setPlan] = useState<DayPlan[]>([]);
  const [currentDay, setCurrentDay] = useState(1);

  // Generate study plan
  useEffect(() => {
    const generatePlan = async () => {
      // Simulate AI generation with progress
      for (let i = 0; i <= 100; i += 5) {
        await new Promise(r => setTimeout(r, 100));
        setProgress(i);
      }

      // Generate 48-72 hour plan (3 days intensive)
      const generatedPlan: DayPlan[] = [];
      const daysCount = targetScore >= 300 ? 3 : 2; // 72hrs for 300+, 48hrs otherwise
      
      for (let day = 1; day <= daysCount; day++) {
        const date = new Date();
        date.setDate(date.getDate() + day - 1);
        
        const dayPlan: DayPlan = {
          day,
          date: date.toLocaleDateString('en-NG', { weekday: 'long', month: 'short', day: 'numeric' }),
          subjects: [],
          quizGoal: day === 1 ? 40 : day === 2 ? 60 : 80,
          focusArea: day === 1 ? 'Foundation Building' : day === 2 ? 'Practice & Review' : 'Final Push & Confidence',
        };

        // Distribute subjects across the day
        const hoursPerSubject = hoursPerDay / subjects.length;
        
        subjects.forEach((subject, idx) => {
          const topics = SUBJECT_TOPICS[subject] || ['General Topics'];
          const isWeak = subject === weakestSubject;
          
          // Select topics for this day
          const startIdx = (day - 1) * 3 % topics.length;
          const selectedTopics = topics.slice(startIdx, startIdx + 3);
          if (selectedTopics.length < 3) {
            selectedTopics.push(...topics.slice(0, 3 - selectedTopics.length));
          }
          
          dayPlan.subjects.push({
            name: subject,
            topics: selectedTopics,
            duration: `${Math.round(hoursPerSubject * (isWeak ? 1.5 : 1))} hours`,
            priority: isWeak ? 'high' : idx === 0 ? 'medium' : 'low',
          });
        });

        generatedPlan.push(dayPlan);
      }

      setPlan(generatedPlan);
      setIsGenerating(false);
    };

    generatePlan();
  }, [subjects, targetScore, hoursPerDay, weakestSubject]);

  const handleDownloadPDF = () => {
    // Create downloadable content
    const content = `
JAMB 48-Hour Crash Study Plan
Generated for: ${userEmail}
Target Score: ${targetScore}+
Date Generated: ${new Date().toLocaleDateString('en-NG')}

═══════════════════════════════════════════════════════

${plan.map(day => `
📅 DAY ${day.day} - ${day.date}
Focus: ${day.focusArea}
Quiz Goal: ${day.quizGoal} questions

${day.subjects.map(s => `
📚 ${s.name.toUpperCase()} (${s.duration})
   Priority: ${s.priority.toUpperCase()}
   Topics: ${s.topics.join(', ')}
`).join('\n')}

───────────────────────────────────────────────────────
`).join('\n')}

═══════════════════════════════════════════════════════

💡 STUDY TIPS:
• Take 10-min breaks every hour
• Use practice quizzes after each topic
• Focus extra time on your weak subject${weakestSubject ? ` (${weakestSubject})` : ''}
• Stay hydrated and get 7-8 hours sleep
• Review wrong answers immediately

🎯 You've got this, future uni star! That ${targetScore}+ is yours! 💪
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `JAMB_Study_Plan_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isGenerating) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-card rounded-3xl p-8 border border-border shadow-2xl text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="w-20 h-20 rounded-full bg-gradient-to-r from-primary to-green-500 mx-auto mb-6 flex items-center justify-center"
          >
            <Sparkles className="w-10 h-10 text-white" />
          </motion.div>
          
          <h2 className="text-2xl font-bold mb-4 text-foreground">
            Creating Your Personalized Plan ✨
          </h2>
          
          <p className="text-muted-foreground mb-6">
            Our AI is crafting the perfect {targetScore >= 300 ? '72' : '48'}-hour study schedule just for you...
          </p>
          
          <Progress value={progress} className="h-3 mb-4" />
          <p className="text-sm text-primary font-medium">{progress}% complete</p>
          
          <div className="mt-6 space-y-2 text-sm text-muted-foreground">
            {progress >= 20 && <p className="animate-fade-in">✓ Analyzing your subjects...</p>}
            {progress >= 40 && <p className="animate-fade-in">✓ Optimizing topic sequence...</p>}
            {progress >= 60 && <p className="animate-fade-in">✓ Prioritizing weak areas...</p>}
            {progress >= 80 && <p className="animate-fade-in">✓ Generating quiz milestones...</p>}
            {progress >= 100 && <p className="animate-fade-in">✓ Finalizing your plan!</p>}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="w-20 h-20 rounded-full bg-green-500 mx-auto mb-4 flex items-center justify-center"
          >
            <CheckCircle className="w-12 h-12 text-white" />
          </motion.div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Your Study Plan is Ready! 🎉
          </h1>
          <p className="text-muted-foreground text-lg">
            {plan.length * 24}-hour personalized crash course to score {targetScore}+
          </p>
        </motion.div>

        {/* Download Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center mb-8"
        >
          <Button
            onClick={handleDownloadPDF}
            size="lg"
            className="bg-gradient-to-r from-primary to-green-500 hover:opacity-90 text-white px-8 py-6 text-lg rounded-2xl shadow-lg"
          >
            <Download className="w-6 h-6 mr-2" />
            Download Study Plan
          </Button>
        </motion.div>

        {/* Plan Overview */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-3 gap-4 mb-8"
        >
          <Card className="bg-primary/10 border-primary/30 text-center">
            <CardContent className="p-4">
              <Calendar className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-primary">{plan.length}</p>
              <p className="text-sm text-muted-foreground">Days</p>
            </CardContent>
          </Card>
          <Card className="bg-green-500/10 border-green-500/30 text-center">
            <CardContent className="p-4">
              <Clock className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600">{plan.length * hoursPerDay}</p>
              <p className="text-sm text-muted-foreground">Study Hours</p>
            </CardContent>
          </Card>
          <Card className="bg-yellow-500/10 border-yellow-500/30 text-center">
            <CardContent className="p-4">
              <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-yellow-600">{targetScore}+</p>
              <p className="text-sm text-muted-foreground">Target Score</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Day Tabs */}
        <div className="flex gap-2 mb-6 justify-center">
          {plan.map((day) => (
            <Button
              key={day.day}
              variant={currentDay === day.day ? "default" : "outline"}
              onClick={() => setCurrentDay(day.day)}
              className={`rounded-full ${currentDay === day.day ? 'bg-primary' : ''}`}
            >
              Day {day.day}
            </Button>
          ))}
        </div>

        {/* Current Day Plan */}
        {plan.filter(d => d.day === currentDay).map((dayPlan) => (
          <motion.div
            key={dayPlan.day}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card className="mb-6 border-2 border-primary/30">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-green-500/10">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    {dayPlan.date}
                  </span>
                  <span className="text-sm font-normal text-muted-foreground">
                    {dayPlan.focusArea}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {dayPlan.subjects.map((subject, idx) => (
                    <motion.div
                      key={subject.name}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className={`p-4 rounded-xl border-2 ${
                        subject.priority === 'high' 
                          ? 'border-red-500/50 bg-red-500/5' 
                          : subject.priority === 'medium'
                          ? 'border-yellow-500/50 bg-yellow-500/5'
                          : 'border-border bg-card'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <BookOpen className={`w-5 h-5 ${
                            subject.priority === 'high' ? 'text-red-500' : 'text-primary'
                          }`} />
                          <span className="font-bold capitalize text-foreground">
                            {subject.name.replace('_', ' ')}
                          </span>
                          {subject.priority === 'high' && (
                            <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                              PRIORITY
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {subject.duration}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {subject.topics.map((topic) => (
                          <span
                            key={topic}
                            className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Daily Quiz Goal */}
                <div className="mt-6 p-4 bg-gradient-to-r from-primary/20 to-green-500/20 rounded-xl border border-primary/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-foreground">Daily Quiz Goal</p>
                      <p className="text-sm text-muted-foreground">Complete {dayPlan.quizGoal} practice questions</p>
                    </div>
                    <div className="text-3xl font-bold text-primary">
                      {dayPlan.quizGoal}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {/* Study Tips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-card rounded-2xl p-6 border border-border mb-8"
        >
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            💡 Pro Study Tips
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              "Take 10-min breaks every hour",
              "Use practice quizzes after each topic",
              "Focus extra time on weak subjects",
              "Stay hydrated and get 7-8 hours sleep",
              "Review wrong answers immediately",
              "Study during your peak focus hours",
            ].map((tip, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                <ArrowRight className="w-4 h-4 text-primary" />
                {tip}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Back Button */}
        <div className="flex justify-center">
          <Button variant="outline" onClick={onBack} size="lg">
            Back to Dashboard
          </Button>
        </div>

        {/* Motivational Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-lg text-muted-foreground mt-8 italic"
        >
          "You've got this, future uni star! That {targetScore}+ is yours!" 💪🎯
        </motion.p>
      </div>
    </div>
  );
};
