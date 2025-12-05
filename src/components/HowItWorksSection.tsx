import { motion } from 'framer-motion';
import { Upload, BookOpen, CheckCircle, Calendar, Trophy, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HowItWorksSectionProps {
  onStartTrial: () => void;
}

const steps = [
  {
    icon: Upload,
    title: 'Upload PDF/Photo',
    description: 'Upload your JAMB past questions — our AI extracts every question instantly',
    mockup: '📄 → 🤖 → ✨',
    color: 'from-green-500 to-emerald-600',
  },
  {
    icon: BookOpen,
    title: 'Pick Your Subjects',
    description: 'Select your 4 JAMB subjects and get a full 60-question timed quiz',
    mockup: '📚 English • Maths • Physics • Chemistry',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    icon: CheckCircle,
    title: 'Instant Results',
    description: 'See your answers with green ✓ for correct and red ✗ for wrong + explanations',
    mockup: '✅ A) Lagos  ❌ B) Abuja',
    color: 'from-teal-500 to-cyan-600',
  },
  {
    icon: Calendar,
    title: 'Personal Study Plan',
    description: 'Get your 48–72 hour crash timetable based on your weak areas',
    mockup: '📅 Day 1: Physics 2hrs • Maths 3hrs',
    color: 'from-cyan-500 to-blue-600',
  },
  {
    icon: Trophy,
    title: 'Predicted Score',
    description: 'See your predicted JAMB score and share your progress card on socials',
    mockup: '🎯 Predicted: 285-310',
    color: 'from-blue-500 to-primary',
  },
];

export const HowItWorksSection = ({ onStartTrial }: HowItWorksSectionProps) => {
  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-green-500 rounded-full blur-3xl" />
      </div>

      <div className="container relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-4">
            ✨ Super Easy Process
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            See How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From upload to predicted score in 5 simple steps. No stress, just results! 🚀
          </p>
        </motion.div>

        {/* Steps Timeline */}
        <div className="relative max-w-4xl mx-auto">
          {/* Connecting Line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-green-500 to-emerald-600 rounded-full hidden md:block" />
          
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: index * 0.15, duration: 0.5 }}
              className={`relative flex items-center gap-6 mb-12 ${
                index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
              }`}
            >
              {/* Step Number Circle */}
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 + 0.2, type: "spring" }}
                className={`hidden md:flex absolute left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-gradient-to-br ${step.color} items-center justify-center text-white font-bold text-xl shadow-lg z-10`}
              >
                {index + 1}
              </motion.div>

              {/* Content Card */}
              <div className={`flex-1 ${index % 2 === 0 ? 'md:pr-20' : 'md:pl-20'}`}>
                <motion.div
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="bg-card border border-border rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {/* Mobile Step Number */}
                  <div className={`md:hidden w-10 h-10 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center text-white font-bold mb-4`}>
                    {index + 1}
                  </div>

                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center flex-shrink-0`}>
                      <step.icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-foreground mb-2">
                        {step.title}
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {step.description}
                      </p>
                      
                      {/* Phone Mockup Preview */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.15 + 0.3 }}
                        className="bg-background/50 border border-border/50 rounded-xl p-4 text-center"
                      >
                        <div className="text-sm font-mono text-primary">
                          {step.mockup}
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Spacer for opposite side */}
              <div className="hidden md:block flex-1" />
            </motion.div>
          ))}
        </div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-16"
        >
          <div className="inline-flex flex-col items-center gap-4 p-8 rounded-3xl bg-gradient-to-br from-primary/10 to-green-500/10 border border-primary/20">
            <div className="text-4xl">🎯</div>
            <h3 className="text-2xl font-bold text-foreground">
              Ready to Score 300+?
            </h3>
            <p className="text-muted-foreground max-w-md">
              Try it free with 20 real JAMB questions. No payment needed!
            </p>
            <Button 
              variant="hero" 
              size="xl" 
              onClick={onStartTrial}
              className="mt-2"
            >
              Start Free Trial Now
              <ArrowRight className="w-5 h-5" />
            </Button>
            <p className="text-xs text-muted-foreground">
              ✓ 20 real questions ✓ 30 min timer ✓ Instant results
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
