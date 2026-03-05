import { motion } from 'framer-motion';
import { Download, Smartphone, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

// UPDATE THIS URL when you have the APK hosted
// Recommended: Upload APK to GitHub Releases or Google Drive and paste the direct download link here
const APK_DOWNLOAD_URL = 'https://drive.google.com/file/d/YOUR_FILE_ID/view?usp=sharing';
const APK_VERSION = '1.0.0';

export const ApkDownloadCard = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-green-500/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
              <Smartphone className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground text-lg mb-1">📱 Download Android App</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Get the full Jamb Crash AI experience as a native app. Faster, smoother, works offline!
              </p>
              <div className="flex flex-wrap gap-2">
                <Button asChild className="gap-2">
                  <a href={APK_DOWNLOAD_URL} target="_blank" rel="noopener noreferrer">
                    <Download className="w-4 h-4" />
                    Download APK (v{APK_VERSION})
                  </a>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                💡 After downloading, open the APK file to install. You may need to enable "Install from unknown sources" in your phone settings.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
