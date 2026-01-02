import { motion } from 'framer-motion';
import { ArrowLeft, GraduationCap, Clock, ExternalLink, Star, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import jambCrashLogo from '@/assets/jamb_crash_ai_logo.jpg';

interface ScholarshipPageProps {
  onBack: () => void;
}

interface Scholarship {
  id: string;
  title: string;
  provider: string;
  description: string;
  deadline: string | null;
  amount: string | null;
  link: string | null;
  status: 'coming-soon' | 'open' | 'closed';
  featured: boolean;
  logo?: string;
}

const SCHOLARSHIPS: Scholarship[] = [
  {
    id: 'jamb-crash-ai',
    title: 'JAMB Crash AI Scholarship',
    provider: 'JAMB Crash AI',
    description: 'Get free premium access to JAMB Crash AI study materials, practice questions, and AI-powered study plans. We\'re committed to helping Nigerian students achieve their dreams!',
    deadline: null,
    amount: 'Free Premium Access',
    link: null,
    status: 'coming-soon',
    featured: true,
    logo: jambCrashLogo,
  },
  {
    id: 'agip-scholarship',
    title: 'AGIP/NAOC Scholarship',
    provider: 'Nigerian Agip Oil Company',
    description: 'Annual scholarship for Nigerian undergraduates in tertiary institutions. Covers tuition and provides stipends for successful applicants.',
    deadline: 'Check official website',
    amount: 'Full Tuition + Stipend',
    link: 'https://www.nnpcgroup.com/NNPC-Business/Upstream-Ventures/Pages/NAOC.aspx',
    status: 'open',
    featured: false,
  },
  {
    id: 'mtn-scholarship',
    title: 'MTN Foundation Scholarship',
    provider: 'MTN Nigeria',
    description: 'Scholarship for students in Science & Technology fields. Open to 200-level students and above with excellent academic records.',
    deadline: 'Annual - Check MTN Foundation',
    amount: 'Varies',
    link: 'https://www.mtnonline.com/foundation',
    status: 'open',
    featured: false,
  },
  {
    id: 'nnpc-scholarship',
    title: 'NNPC/Total Scholarship',
    provider: 'NNPC & TotalEnergies',
    description: 'Scholarship for Nigerian undergraduates studying Engineering, Geosciences, and related fields.',
    deadline: 'Annual application',
    amount: 'Tuition Coverage',
    link: 'https://scholarships.totalenergies.com',
    status: 'open',
    featured: false,
  },
];

export const ScholarshipPage = ({ onBack }: ScholarshipPageProps) => {
  return (
    <div className="min-h-screen bg-background">
      <div className="pt-20 pb-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Button
              variant="ghost"
              onClick={onBack}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  Scholarships & Opportunities
                </h1>
                <p className="text-muted-foreground text-sm">
                  Financial aid for Nigerian students
                </p>
              </div>
            </div>
          </motion.div>

          {/* Featured Scholarship - JAMB Crash AI */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <Card className="overflow-hidden border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
              <div className="p-6">
                <div className="flex items-start gap-4">
                  {/* Logo */}
                  <div className="shrink-0">
                    <img
                      src={jambCrashLogo}
                      alt="JAMB Crash AI Logo"
                      className="w-20 h-20 rounded-xl object-cover border-2 border-primary/30 shadow-lg"
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <Badge className="bg-primary text-primary-foreground">
                        <Star className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                      <Badge variant="secondary" className="bg-amber-500/20 text-amber-600 border-amber-500/30">
                        <Clock className="w-3 h-3 mr-1" />
                        Coming Soon
                      </Badge>
                    </div>

                    <h2 className="text-xl font-bold text-foreground mb-1">
                      JAMB Crash AI Scholarship
                    </h2>
                    <p className="text-sm text-primary font-medium mb-2">
                      By JAMB Crash AI
                    </p>
                    <p className="text-muted-foreground mb-4">
                      Get free premium access to JAMB Crash AI study materials, practice questions, and AI-powered study plans. We're committed to helping Nigerian students achieve their dreams!
                    </p>

                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-foreground">
                          Free Premium Access
                        </span>
                      </div>
                      <Button variant="outline" size="sm" disabled className="gap-2">
                        <Bell className="w-4 h-4" />
                        Notify Me When Available
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Coming Soon Banner */}
              <div className="bg-primary/10 px-6 py-3 border-t border-primary/20">
                <p className="text-sm text-center text-primary font-medium">
                  🚀 We're working hard to bring this scholarship to you! Stay tuned for updates.
                </p>
              </div>
            </Card>
          </motion.div>

          {/* Other Scholarships */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-lg font-bold text-foreground mb-4">
              Other Scholarships for Nigerian Students
            </h2>

            <div className="space-y-4">
              {SCHOLARSHIPS.filter(s => !s.featured).map((scholarship, index) => (
                <motion.div
                  key={scholarship.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                >
                  <Card className="p-4 hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-foreground">
                            {scholarship.title}
                          </h3>
                          <Badge 
                            variant="outline" 
                            className={
                              scholarship.status === 'open' 
                                ? 'text-green-600 border-green-500/30 bg-green-500/10' 
                                : 'text-muted-foreground'
                            }
                          >
                            {scholarship.status === 'open' ? 'Open' : 'Check Status'}
                          </Badge>
                        </div>
                        <p className="text-sm text-primary font-medium mb-1">
                          {scholarship.provider}
                        </p>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {scholarship.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                          {scholarship.amount && (
                            <span className="flex items-center gap-1">
                              <GraduationCap className="w-3 h-3" />
                              {scholarship.amount}
                            </span>
                          )}
                          {scholarship.deadline && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {scholarship.deadline}
                            </span>
                          )}
                        </div>
                      </div>
                      {scholarship.link && (
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="shrink-0"
                        >
                          <a href={scholarship.link} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Apply
                          </a>
                        </Button>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Tips Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8"
          >
            <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
              <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                💡 Scholarship Application Tips
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Start applications early - many scholarships have strict deadlines</li>
                <li>• Prepare required documents: transcripts, recommendation letters, essays</li>
                <li>• Focus on your unique story and achievements</li>
                <li>• Apply to multiple scholarships to increase your chances</li>
                <li>• Beware of scholarship scams - never pay to apply</li>
              </ul>
            </Card>
          </motion.div>

          {/* Disclaimer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-xs text-muted-foreground text-center mt-8"
          >
            Scholarship information is provided for reference. Always verify details on official websites before applying.
          </motion.p>
        </div>
      </div>
    </div>
  );
};
