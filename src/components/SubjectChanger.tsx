import { SubjectSelector } from './SubjectSelector';

interface SubjectChangerProps {
  userEmail: string;
  currentSubjects: string[];
  onComplete: (subjects: string[]) => void;
  onClose: () => void;
  isBypassUser?: boolean;
}

export const SubjectChanger = ({ 
  userEmail, 
  currentSubjects, 
  onComplete, 
  onClose,
  isBypassUser = false 
}: SubjectChangerProps) => {
  return (
    <SubjectSelector
      userEmail={userEmail}
      onComplete={onComplete}
      isBypassUser={isBypassUser}
      initialSubjects={currentSubjects}
      onCancel={onClose}
      isChangingSubjects={true}
    />
  );
};
