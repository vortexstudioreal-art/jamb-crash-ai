import { BookOpen, Mail } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="py-12 bg-foreground text-background">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="max-w-xs">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg">Jamb Crash AI</span>
            </div>
            <p className="text-sm text-background/70">
              AI-powered JAMB preparation to help you score 300+ in just 48 hours of focused study.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-8">
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-background/70">
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  support@jambcrash.ai
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-background/70">
                <li><a href="#" className="hover:text-background transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-background transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-background transition-colors">Refund Policy</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-background/20 text-center text-sm text-background/50">
          © 2025 Jamb Crash AI. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
