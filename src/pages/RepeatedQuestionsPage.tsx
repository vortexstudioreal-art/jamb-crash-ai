import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Flame } from 'lucide-react';
import HighYieldQuestions from '@/components/HighYieldQuestions';
import { useSeo } from '@/hooks/useSeo';

const RepeatedQuestionsPage = () => {
  const navigate = useNavigate();

  useSeo({
    title: 'Repeated JAMB Questions | High-Yield Past Questions (2000-2024)',
    description: 'Practice the JAMB questions that appear most often across past exams from 2000-2024. High-yield questions with explanations to help you score 300+.',
    path: '/repeated-questions',
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-orange-500/15 flex items-center justify-center">
            <Flame className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-foreground">
              Repeated JAMB Questions
            </h1>
            <p className="text-sm text-muted-foreground">
              The high-yield questions JAMB keeps reusing across exams — with explanations
            </p>
          </div>
        </div>

        <HighYieldQuestions />
      </div>
    </div>
  );
};

export default RepeatedQuestionsPage;
