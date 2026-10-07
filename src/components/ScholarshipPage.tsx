import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, GraduationCap, Clock, ExternalLink, Star, Bell, Trophy, CheckCircle2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { errorLogger } from '@/services/errorLogger';
import jambCrashLogo from '@/assets/jamb_crash_ai_logo.jpg';

interface ScholarshipPageProps {
  onBack: () => void;
  userEmail?: string;
  userId?: string | null;
  onPracticeQuiz?: () => void;
}

const QUALIFYING_RANK = 100;

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
    description: "We're sponsoring 3 outstanding students from our app! Selected students will receive full admission support for their chosen federal or state university. This isn't about premium access—it's about helping you achieve your dreams of higher education in Nigeria.",
    deadline: null,
    amount: 'Full Admission Sponsorship (3 Students)',
    link: null,
    status: 'coming-soon',
    featured: true,
    logo: jambCrashLogo,
  },
  {
    id: 'shell-scholarship',
    title: 'Shell Nigeria Scholarship',
    provider: 'Shell Petroleum Development Company',
    description: 'Annual scholarship program for Nigerian undergraduates in federal and state universities. Provides financial support for tuition, accommodation, and living expenses.',
    deadline: 'Usually opens in October',
    amount: 'Up to ₦600,000/year',
    link: 'https://www.shell.com.ng/sustainability/communities/education.html',
    status: 'open',
    featured: false,
  },
  {
    id: 'chevron-scholarship',
    title: 'Chevron Nigeria Scholarship',
    provider: 'Chevron Nigeria Limited',
    description: 'For students studying Engineering, Geology, Geophysics, and Environmental Sciences at accredited Nigerian universities. Must have minimum 2.5 CGPA.',
    deadline: 'Annual - Check official website',
    amount: 'Full Tuition + Allowance',
    link: 'https://nigeria.chevron.com/our-businesses/policies-scholarships',
    status: 'open',
    featured: false,
  },
  {
    id: 'ptdf-scholarship',
    title: 'PTDF Scholarship',
    provider: 'Petroleum Technology Development Fund',
    description: 'Federal Government scholarship for undergraduate and postgraduate studies in engineering, geosciences, and related fields both in Nigeria and overseas.',
    deadline: 'Varies by program',
    amount: 'Full Scholarship',
    link: 'https://ptdf.gov.ng',
    status: 'open',
    featured: false,
  },
  {
    id: 'agbami-scholarship',
    title: 'Agbami Medical & Engineering Scholarship',
    provider: 'Agbami Parties',
    description: 'For Nigerian students in accredited medical and engineering programs. Open to 200-level students and above with minimum CGPA of 3.0.',
    deadline: 'Usually May-June',
    amount: 'Up to ₦500,000/year',
    link: 'https://agbami.ng',
    status: 'open',
    featured: false,
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
    id: 'nlng-scholarship',
    title: 'NLNG Scholarship',
    provider: 'Nigeria LNG Limited',
    description: 'For Nigerian undergraduates in Engineering, Sciences, Social Sciences, and Humanities at accredited universities. Must have completed first year.',
    deadline: 'Usually September-October',
    amount: 'Comprehensive Package',
    link: 'https://www.nlng.com/Community/Scholarships.aspx',
    status: 'open',
    featured: false,
  },
  {
    id: 'bea-scholarship',
    title: 'Federal Government BEA Scholarship',
    provider: 'Federal Ministry of Education',
    description: 'Bilateral Education Agreement scholarships for Nigerian students to study in countries with educational agreements with Nigeria (Russia, China, Morocco, etc.).',
    deadline: 'Annual - Check FMOE website',
    amount: 'Full Scholarship (Overseas)',
    link: 'https://education.gov.ng',
    status: 'open',
    featured: false,
  },
];

export const ScholarshipPage = ({ onBack, userEmail, userId, onPracticeQuiz }: ScholarshipPageProps) => {
  const [onWaitlist, setOnWaitlist] = useState(false);
  const [joining, setJoining] = useState(false);
  const [rank, setRank] = useState<number | null>(null);
  const [totalPlayers, setTotalPlayers] = useState<number | null>(null);

  useEffect(() => {
    if (!userEmail) return;
    const emailKey = userEmail.toLowerCase();
    supabase
      .from('scholarship_interest')
      .select('id')
      .eq('email', emailKey)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setOnWaitlist(true);
      });

    // Merit rank: position on the leaderboard by total score
    const loadRank = async () => {
      try {
        if (!userId) {
          setRank(null);
          return;
        }
        const { data: me } = await supabase
          .from('leaderboard_scores')
          .select('total_score')
          .eq('user_id', userId)
          .maybeSingle();
        if (!me) {
          setRank(null);
          return;
        }
        const [{ count: ahead }, { count: total }] = await Promise.all([
          supabase
            .from('leaderboard_scores')
            .select('*', { count: 'exact', head: true })
            .gt('total_score', me.total_score),
          supabase
            .from('leaderboard_scores')
            .select('*', { count: 'exact', head: true }),
        ]);
        setRank((ahead || 0) + 1);
        setTotalPlayers(total || null);
      } catch (err) {
        errorLogger.error(err, { component: 'ScholarshipPage', action: 'load rank' });
      }
    };
    void loadRank();
  }, [userEmail, userId]);

  const joinWaitlist = async () => {
    if (!userEmail) return;
    setJoining(true);
    try {
      const { error } = await supabase.from('scholarship_interest').insert({
        email: userEmail.toLowerCase(),
      });
      if (error) throw error;
      setOnWaitlist(true);
      toast.success("You're on the list! We'll notify you the moment applications open 🎓");
    } catch (err) {
      errorLogger.error(err, { component: 'ScholarshipPage', action: 'join waitlist' });
      toast.error('Could not join. Try again.');
    } finally {
      setJoining(false);
    }
  };

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
              <div className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
                  {/* Logo */}
                  <div className="shrink-0">
                    <img
                      src={jambCrashLogo}
                      alt="JAMB Crash AI Logo"
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border-2 border-primary/30 shadow-lg"
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-center sm:justify-start gap-2 mb-2 flex-wrap">
                      <Badge className="bg-primary text-primary-foreground">
                        <Star className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                      <Badge variant="secondary" className="bg-amber-500/20 text-amber-600 border-amber-500/30">
                        <Clock className="w-3 h-3 mr-1" />
                        Coming Soon
                      </Badge>
                    </div>

                    <h2 className="text-lg sm:text-xl font-bold text-foreground mb-1">
                      JAMB Crash AI Scholarship
                    </h2>
                    <p className="text-sm text-primary font-medium mb-2">
                      By JAMB Crash AI
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      We're sponsoring 3 outstanding students from our app! Selected students will receive full admission support for their chosen federal or state university. This isn't about premium access—it's about helping you achieve your dreams of higher education in Nigeria.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 flex-wrap">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-foreground">
                          3 Full Admission Sponsorships
                        </span>
                      </div>
                      {onWaitlist ? (
                        <span className="flex items-center gap-1.5 text-sm font-medium text-green-600">
                          <CheckCircle2 className="w-4 h-4" />
                          You're on the list ✅
                        </span>
                      ) : (
                        <Button variant="outline" size="sm" onClick={joinWaitlist} disabled={joining || !userEmail} className="gap-2">
                          <Bell className="w-4 h-4" />
                          {joining ? 'Joining…' : 'Notify Me When Available'}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Coming Soon Banner */}
              <div className="bg-primary/10 px-6 py-3 border-t border-primary/20">
                <p className="text-sm text-center text-primary font-medium">
                  🎓 We're selecting 3 students for full admission sponsorship! Stay tuned for application details.
                </p>
              </div>
            </Card>
          </motion.div>

          {/* Merit qualification — top-100 leaderboard rank */}
          {userEmail && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mb-8"
            >
              <Card className="p-5 border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-transparent">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  <h2 className="font-bold text-foreground">Earn Your Spot</h2>
                  <Badge variant="secondary" className="ml-auto">Top {QUALIFYING_RANK} qualify</Badge>
                </div>
                {rank === null ? (
                  <div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Finalists are picked from the leaderboard top {QUALIFYING_RANK}. Take a quiz to enter the ranking.
                    </p>
                    {onPracticeQuiz && (
                      <Button size="sm" onClick={onPracticeQuiz} className="gap-2">
                        <Play className="w-4 h-4" />
                        Take a Quiz
                      </Button>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="flex items-baseline justify-between mb-2">
                      <p className="text-sm text-muted-foreground">
                        Your rank{' '}
                        <span className="text-xl font-extrabold text-foreground">#{rank}</span>
                        {totalPlayers ? <span> of {totalPlayers}</span> : null}
                      </p>
                      {rank <= QUALIFYING_RANK ? (
                        <Badge className="bg-green-500/20 text-green-600 border-green-500/30">Qualified 🎉</Badge>
                      ) : (
                        <Badge variant="outline">{rank - QUALIFYING_RANK} spots to climb</Badge>
                      )}
                    </div>
                    <Progress value={Math.min(100, (QUALIFYING_RANK / Math.max(rank, 1)) * 100)} className="h-2 mb-3" />
                    {rank > QUALIFYING_RANK && onPracticeQuiz && (
                      <Button size="sm" onClick={onPracticeQuiz} className="gap-2">
                        <Play className="w-4 h-4" />
                        Climb the Rank
                      </Button>
                    )}
                  </div>
                )}
              </Card>
            </motion.div>
          )}

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
