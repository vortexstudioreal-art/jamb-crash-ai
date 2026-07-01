import { BookOpen, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SocialFollowLinks } from './SocialFollowBanner';

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
            <p className="text-sm text-background/70 mb-4">
              AI-powered JAMB preparation to help you score 300+ in just 48 hours of focused study.
            </p>
            <SocialFollowLinks />
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
              <h4 className="font-semibold mb-4">Follow Us</h4>
              <ul className="space-y-2 text-sm text-background/70">
                <li>
                  <a href="https://www.tiktok.com/@jamb.crash.ai" target="_blank" rel="noopener noreferrer" className="hover:text-background transition-colors">
                    🎵 TikTok
                  </a>
                </li>
                <li>
                  <a href="https://whatsapp.com/channel/0029VbBXiJs1nozBfLioDZ1X" target="_blank" rel="noopener noreferrer" className="hover:text-background transition-colors">
                    💬 WhatsApp Channel
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-background/70">
                <li><Link to="/privacy" className="hover:text-background transition-colors">Privacy Policy</Link></li>
                <li><Link to="/privacy#terms" className="hover:text-background transition-colors">Terms of Service</Link></li>
                <li><Link to="/privacy#refund" className="hover:text-background transition-colors">Refund Policy</Link></li>
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
