import { motion } from 'framer-motion';
import { Check, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PricingCardProps {
  name: string;
  price: number;
  features: string[];
  popular?: boolean;
  onSelect: () => void;
  delay?: number;
}

export const PricingCard = ({ name, price, features, popular, onSelect, delay = 0 }: PricingCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      className={`relative card-elevated p-6 md:p-8 flex flex-col ${
        popular 
          ? 'border-2 border-primary shadow-[0_0_30px_rgba(34,197,94,0.3)] scale-105 z-10' 
          : ''
      }`}
    >
      {popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold bg-gradient-to-r from-primary to-green-400 text-primary-foreground shadow-lg">
            <Star className="w-4 h-4 fill-current" />
            Most Popular 🔥
          </span>
        </div>
      )}

      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-foreground mb-2">{name}</h3>
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-2xl font-medium text-muted-foreground">₦</span>
          <span className="price-tag">{price.toLocaleString()}</span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">One-time payment</p>
      </div>

      <ul className="space-y-3 mb-8 flex-grow">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <div className="mt-0.5 w-5 h-5 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
              <Check className="w-3 h-3 text-primary" />
            </div>
            <span className="text-sm text-foreground">{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        variant={popular ? 'price' : 'outline'}
        size="lg"
        onClick={onSelect}
        className="w-full"
      >
        Get Started
      </Button>
    </motion.div>
  );
};
