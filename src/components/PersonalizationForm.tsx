import { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Clock, BookOpen, Calendar, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FormData {
  targetScore: string;
  hoursPerDay: string;
  weakestSubject: string;
  examDate: string;
}

interface PersonalizationFormProps {
  onSubmit: (data: FormData) => void;
}

const subjects = [
  'English Language',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Economics',
  'Government',
  'Literature',
  'Commerce',
  'Accounting',
  'Geography',
  'CRS/IRS',
];

export const PersonalizationForm = ({ onSubmit }: PersonalizationFormProps) => {
  const [formData, setFormData] = useState<FormData>({
    targetScore: '',
    hoursPerDay: '',
    weakestSubject: '',
    examDate: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const formFields = [
    {
      id: 'targetScore',
      label: 'What score are you targeting?',
      icon: Target,
      type: 'select',
      options: ['250+', '280+', '300+', '320+', '350+'],
      placeholder: 'Select target score',
    },
    {
      id: 'hoursPerDay',
      label: 'Hours you can study daily?',
      icon: Clock,
      type: 'select',
      options: ['1-2 hours', '2-4 hours', '4-6 hours', '6+ hours'],
      placeholder: 'Select study hours',
    },
    {
      id: 'weakestSubject',
      label: 'Your weakest subject?',
      icon: BookOpen,
      type: 'select',
      options: subjects,
      placeholder: 'Select subject',
    },
    {
      id: 'examDate',
      label: 'Your exam date',
      icon: Calendar,
      type: 'date',
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-secondary/30">
      <div className="container max-w-xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Personalize Your Plan
          </h2>
          <p className="text-lg text-muted-foreground">
            Help us create the perfect study schedule for you
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="card-elevated space-y-6"
        >
          {formFields.map((field, index) => (
            <motion.div
              key={field.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
            >
              <Label htmlFor={field.id} className="flex items-center gap-2 mb-3 text-base">
                <field.icon className="w-5 h-5 text-primary" />
                {field.label}
              </Label>
              
              {field.type === 'select' ? (
                <Select
                  value={formData[field.id as keyof FormData]}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, [field.id]: value }))}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder={field.placeholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id={field.id}
                  type="date"
                  className="h-12"
                  value={formData[field.id as keyof FormData]}
                  onChange={(e) => setFormData(prev => ({ ...prev, [field.id]: e.target.value }))}
                />
              )}
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Button type="submit" variant="hero" size="xl" className="w-full mt-4">
              Generate My Study Plan
              <ArrowRight className="w-5 h-5" />
            </Button>
          </motion.div>
        </motion.form>
      </div>
    </section>
  );
};
