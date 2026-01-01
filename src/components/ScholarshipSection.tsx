import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GraduationCap, ExternalLink, Calendar, DollarSign, ChevronRight, Award, CheckCircle2 } from 'lucide-react';

interface Scholarship {
  id: string;
  name: string;
  sponsor: string;
  description: string;
  eligibility: string[];
  deadline: string;
  coverage: string;
  link?: string;
  isOpen: boolean;
}

// Static scholarship data - In production, this would come from an API or database
const scholarshipsData: Scholarship[] = [
  {
    id: '1',
    name: 'Federal Government Scholarship',
    sponsor: 'Federal Ministry of Education',
    description: 'Full scholarship for outstanding Nigerian students pursuing undergraduate degrees in federal universities.',
    eligibility: ['Nigerian citizen', 'JAMB score of 250+', 'WAEC/NECO with 5 credits including English and Maths'],
    deadline: '2026-03-31',
    coverage: 'Full tuition + Monthly stipend',
    isOpen: true,
  },
  {
    id: '2',
    name: 'MTN Foundation Scholarship',
    sponsor: 'MTN Nigeria',
    description: 'Science and Technology scholarship for students in STEM fields across Nigerian universities.',
    eligibility: ['Nigerian student', 'Studying STEM courses', 'Minimum CGPA of 3.5'],
    deadline: '2026-02-28',
    coverage: 'N200,000 annual grant',
    isOpen: true,
  },
  {
    id: '3',
    name: 'Shell SPDC Scholarship',
    sponsor: 'Shell Nigeria',
    description: 'Merit-based scholarship for students from Niger Delta states pursuing degrees in engineering and sciences.',
    eligibility: ['From Niger Delta states', 'Engineering/Science student', 'Strong academic record'],
    deadline: '2026-04-15',
    coverage: 'Full tuition + Internship opportunity',
    isOpen: true,
  },
  {
    id: '4',
    name: 'Agbami Scholarship',
    sponsor: 'Agbami Partners',
    description: 'Prestigious scholarship for Nigerian undergraduates in Medicine, Engineering, Geosciences, and related fields.',
    eligibility: ['Nigerian undergraduate', 'Specific course requirements', '200-level and above'],
    deadline: '2026-01-31',
    coverage: 'Full tuition + Allowances',
    isOpen: true,
  },
  {
    id: '5',
    name: 'NNPC/Total Scholarship',
    sponsor: 'NNPC & Total Nigeria',
    description: 'Scholarship for Nigerian students in oil & gas related disciplines at Nigerian universities.',
    eligibility: ['Nigerian student', 'Oil & Gas related courses', 'Minimum of 2.5 CGPA'],
    deadline: '2026-05-30',
    coverage: 'N150,000 annual award',
    isOpen: false,
  },
];

export const ScholarshipSection = () => {
  const [showAll, setShowAll] = useState(false);
  const displayedScholarships = showAll ? scholarshipsData : scholarshipsData.slice(0, 3);

  const formatDeadline = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Expired';
    if (diffDays === 0) return 'Today!';
    if (diffDays <= 7) return `${diffDays} days left`;
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks left`;
    return date.toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const isDeadlineSoon = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 14;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="mb-8"
    >
      <Card className="border-green-500/20 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 pb-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            <GraduationCap className="w-5 h-5 text-green-500" />
            Scholarships & Opportunities 🎓
          </CardTitle>
          <p className="text-sm text-muted-foreground">Discover funding opportunities for your education</p>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-4">
            {displayedScholarships.map((scholarship, index) => (
              <motion.div
                key={scholarship.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                  scholarship.isOpen 
                    ? 'border-green-500/30 bg-green-500/5 hover:border-green-500/50' 
                    : 'border-border bg-muted/30 opacity-70'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <Badge 
                        variant={scholarship.isOpen ? "default" : "secondary"}
                        className={scholarship.isOpen ? "bg-green-500 hover:bg-green-600" : ""}
                      >
                        {scholarship.isOpen ? 'Open' : 'Closed'}
                      </Badge>
                      {scholarship.isOpen && isDeadlineSoon(scholarship.deadline) && (
                        <Badge variant="destructive" className="animate-pulse text-xs">
                          Deadline Soon!
                        </Badge>
                      )}
                    </div>
                    
                    <h4 className="font-semibold text-foreground mb-1">{scholarship.name}</h4>
                    <p className="text-sm text-primary font-medium mb-2">{scholarship.sponsor}</p>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{scholarship.description}</p>
                    
                    <div className="flex flex-wrap gap-3 text-xs">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDeadline(scholarship.deadline)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-green-600 font-medium">
                        <DollarSign className="w-3 h-3" />
                        <span>{scholarship.coverage}</span>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex flex-wrap gap-1">
                      {scholarship.eligibility.slice(0, 2).map((req, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-green-500" />
                          {req}
                        </span>
                      ))}
                      {scholarship.eligibility.length > 2 && (
                        <span className="text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground">
                          +{scholarship.eligibility.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {scholarship.link && scholarship.isOpen && (
                    <Button variant="outline" size="sm" className="shrink-0">
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Apply
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
          
          {scholarshipsData.length > 3 && (
            <Button
              variant="ghost"
              className="w-full mt-4 text-green-600 hover:text-green-700 hover:bg-green-500/10"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? 'Show Less' : `View All ${scholarshipsData.length} Scholarships`}
              <ChevronRight className={`w-4 h-4 ml-1 transition-transform ${showAll ? 'rotate-90' : ''}`} />
            </Button>
          )}
          
          <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30">
            <p className="text-sm text-foreground flex items-center gap-2">
              <Award className="w-4 h-4 text-yellow-500" />
              <span>
                <strong>Pro tip:</strong> Start your scholarship applications early and keep your documents ready!
              </span>
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
