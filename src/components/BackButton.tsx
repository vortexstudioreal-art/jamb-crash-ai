import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface BackButtonProps {
  onClick?: () => void;
  className?: string;
}

export const BackButton = ({ onClick, className = '' }: BackButtonProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(-1);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      className={`fixed top-20 left-4 z-50 text-primary hover:text-primary/80 hover:bg-primary/10 font-medium ${className}`}
    >
      <ArrowLeft className="w-4 h-4 mr-1" />
      Back
    </Button>
  );
};
