import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, FileText, Video, Download, ExternalLink, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface StudyMaterialsProps {
  subjects: string[];
}

const SUBJECT_MATERIALS: Record<string, { title: string; type: 'pdf' | 'video' | 'notes'; description: string }[]> = {
  english: [
    { title: 'Comprehension Techniques', type: 'notes', description: 'Master reading passages quickly' },
    { title: 'Common Idioms & Phrases', type: 'pdf', description: '500+ idioms for JAMB' },
    { title: 'Oral English Guide', type: 'notes', description: 'Vowels, consonants & stress patterns' },
  ],
  mathematics: [
    { title: 'Algebra Cheat Sheet', type: 'pdf', description: 'Quick formulas reference' },
    { title: 'Geometry Theorems', type: 'notes', description: 'All theorems in one place' },
    { title: 'Solving Quadratics', type: 'notes', description: 'Step-by-step methods' },
  ],
  physics: [
    { title: 'Physics Formulas', type: 'pdf', description: 'All JAMB physics formulas' },
    { title: 'Mechanics Explained', type: 'notes', description: 'Motion, forces, energy' },
    { title: 'Electricity Basics', type: 'notes', description: 'Current, voltage, resistance' },
  ],
  chemistry: [
    { title: 'Periodic Table Guide', type: 'pdf', description: 'Elements & properties' },
    { title: 'Organic Chemistry', type: 'notes', description: 'Hydrocarbons & reactions' },
    { title: 'Balancing Equations', type: 'notes', description: 'Quick balancing tricks' },
  ],
  biology: [
    { title: 'Cell Biology Summary', type: 'notes', description: 'Cell structure & functions' },
    { title: 'Genetics Made Easy', type: 'pdf', description: 'DNA, inheritance patterns' },
    { title: 'Ecology Concepts', type: 'notes', description: 'Ecosystems & food chains' },
  ],
  literature: [
    { title: 'Literary Terms', type: 'pdf', description: 'All terms you need to know' },
    { title: 'Prose Analysis', type: 'notes', description: 'How to analyze prose' },
    { title: 'Poetry Guide', type: 'notes', description: 'Understanding poems' },
  ],
  government: [
    { title: 'Nigerian Constitution', type: 'pdf', description: 'Key provisions summary' },
    { title: 'Political Systems', type: 'notes', description: 'Democracy, federalism' },
    { title: 'Government Organs', type: 'notes', description: 'Executive, legislative, judicial' },
  ],
  economics: [
    { title: 'Microeconomics Basics', type: 'notes', description: 'Demand, supply, elasticity' },
    { title: 'Macroeconomics', type: 'pdf', description: 'GDP, inflation, policies' },
    { title: 'Nigerian Economy', type: 'notes', description: 'Economic structures' },
  ],
};

export const StudyMaterials = ({ subjects }: StudyMaterialsProps) => {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(subjects[0] || null);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="w-4 h-4 text-red-500" />;
      case 'video': return <Video className="w-4 h-4 text-blue-500" />;
      default: return <BookOpen className="w-4 h-4 text-primary" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'pdf': return <Badge variant="outline" className="text-red-500 border-red-500/30">PDF</Badge>;
      case 'video': return <Badge variant="outline" className="text-blue-500 border-blue-500/30">Video</Badge>;
      default: return <Badge variant="outline" className="text-primary border-primary/30">Notes</Badge>;
    }
  };

  const materials = selectedSubject ? (SUBJECT_MATERIALS[selectedSubject] || []) : [];

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          Study Materials 📚
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Subject Tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          {subjects.map(subject => (
            <Button
              key={subject}
              variant={selectedSubject === subject ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedSubject(subject)}
              className="capitalize"
            >
              {subject.replace('_', ' ')}
            </Button>
          ))}
        </div>

        {/* Materials List */}
        {materials.length > 0 ? (
          <div className="space-y-3">
            {materials.map((material, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  {getTypeIcon(material.type)}
                  <div>
                    <p className="font-medium text-foreground">{material.title}</p>
                    <p className="text-sm text-muted-foreground">{material.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getTypeBadge(material.type)}
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No materials available for this subject yet</p>
            <p className="text-sm">Check back soon! 📖</p>
          </div>
        )}

        {/* Coming Soon Banner */}
        <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-primary/10 to-green-500/10 border border-primary/20">
          <p className="text-sm text-center text-muted-foreground">
            <span className="font-semibold text-primary">Coming Soon:</span> Video tutorials, downloadable PDFs, and past question compilations! 🚀
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
