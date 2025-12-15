export interface CourseTip {
  category: string;
  targetScore: string;
  focusSubjects: string[];
  tips: string[];
  careerProspects: string[];
  backupCourses: string[];
}

export const courseTips: Record<string, CourseTip> = {
  // Medical Sciences
  medicine: {
    category: "Medical Sciences",
    targetScore: "280+",
    focusSubjects: ["Biology", "Chemistry", "Physics"],
    tips: [
      "JAMB cutoff is typically 280+, aim for 300+ to be competitive",
      "POST-UTME is highly competitive - prepare extensively",
      "Strong Biology and Chemistry foundation is essential",
      "Consider private universities if federal is too competitive"
    ],
    careerProspects: ["Doctor", "Surgeon", "Medical Researcher", "Healthcare Administrator"],
    backupCourses: ["Nursing", "Medical Laboratory Science", "Pharmacy", "Anatomy"]
  },
  
  pharmacy: {
    category: "Medical Sciences",
    targetScore: "270+",
    focusSubjects: ["Chemistry", "Biology", "Physics/Mathematics"],
    tips: [
      "Chemistry is the most important subject - master it",
      "Understand drug interactions and pharmaceutical calculations",
      "Consider industrial pharmacy as a career path"
    ],
    careerProspects: ["Community Pharmacist", "Hospital Pharmacist", "Pharmaceutical Industry", "Drug Regulation"],
    backupCourses: ["Biochemistry", "Microbiology", "Chemistry"]
  },

  nursing: {
    category: "Medical Sciences", 
    targetScore: "220+",
    focusSubjects: ["Biology", "Chemistry", "English"],
    tips: [
      "Focus on Biology and Chemistry equally",
      "Good communication skills are essential",
      "Consider specializations like midwifery or mental health nursing"
    ],
    careerProspects: ["Clinical Nurse", "Nurse Educator", "Nurse Administrator", "Specialized Nurse"],
    backupCourses: ["Medical Laboratory Science", "Health Education", "Public Health"]
  },

  // Engineering
  engineering: {
    category: "Engineering",
    targetScore: "250+",
    focusSubjects: ["Mathematics", "Physics", "Chemistry"],
    tips: [
      "Mathematics and Physics are crucial - practice extensively",
      "Strong analytical skills required for POST-UTME",
      "Computer skills are increasingly important",
      "Consider which engineering branch matches your interests"
    ],
    careerProspects: ["Civil Engineer", "Mechanical Engineer", "Electrical Engineer", "Software Engineer"],
    backupCourses: ["Physics", "Mathematics", "Computer Science", "Architecture"]
  },

  computerScience: {
    category: "Technology",
    targetScore: "240+",
    focusSubjects: ["Mathematics", "Physics"],
    tips: [
      "Strong Mathematics foundation is essential",
      "Start learning programming basics early",
      "Logic and problem-solving skills are key",
      "Consider certifications alongside your degree"
    ],
    careerProspects: ["Software Developer", "Data Scientist", "System Analyst", "IT Consultant"],
    backupCourses: ["Information Technology", "Statistics", "Mathematics"]
  },

  // Law
  law: {
    category: "Law",
    targetScore: "270+",
    focusSubjects: ["English", "Government", "Literature/CRS"],
    tips: [
      "Excellent English proficiency is non-negotiable",
      "Read widely - newspapers, journals, literature",
      "Strong Government knowledge helps in constitutional law",
      "Prepare for highly competitive POST-UTME"
    ],
    careerProspects: ["Lawyer", "Judge", "Legal Consultant", "Corporate Counsel"],
    backupCourses: ["Political Science", "Public Administration", "International Relations"]
  },

  // Business & Management
  accounting: {
    category: "Business",
    targetScore: "220+",
    focusSubjects: ["Mathematics", "Economics", "Commerce"],
    tips: [
      "Mathematics accuracy is crucial",
      "Understand basic accounting principles early",
      "Consider professional certifications (ICAN, ACCA)",
      "Strong analytical skills needed"
    ],
    careerProspects: ["Chartered Accountant", "Auditor", "Financial Analyst", "Tax Consultant"],
    backupCourses: ["Banking & Finance", "Business Administration", "Economics"]
  },

  economics: {
    category: "Social Sciences",
    targetScore: "230+",
    focusSubjects: ["Mathematics", "Economics", "Government"],
    tips: [
      "Mathematics is essential for economic analysis",
      "Understand current economic trends and policies",
      "Statistics knowledge is beneficial"
    ],
    careerProspects: ["Economist", "Financial Analyst", "Policy Analyst", "Researcher"],
    backupCourses: ["Statistics", "Banking & Finance", "Business Administration"]
  },

  // Sciences
  sciences: {
    category: "Pure Sciences",
    targetScore: "230+",
    focusSubjects: ["Mathematics", "Physics", "Chemistry", "Biology"],
    tips: [
      "Focus on practical understanding, not just theory",
      "Laboratory skills are important",
      "Consider research as a career path",
      "Postgraduate studies often required for specialization"
    ],
    careerProspects: ["Scientist", "Researcher", "Laboratory Technologist", "Lecturer"],
    backupCourses: ["Related science courses", "Education (Science)"]
  },

  // Arts & Humanities
  arts: {
    category: "Arts & Humanities",
    targetScore: "200+",
    focusSubjects: ["English", "Literature", "Government/CRS/History"],
    tips: [
      "Strong reading and writing skills essential",
      "Develop critical thinking abilities",
      "Consider teaching as a career option",
      "Creative industries offer opportunities"
    ],
    careerProspects: ["Writer", "Journalist", "Teacher", "Content Creator", "Public Relations"],
    backupCourses: ["Mass Communication", "Education", "Theatre Arts"]
  },

  // Default for unmatched courses
  default: {
    category: "General",
    targetScore: "200+",
    focusSubjects: ["All your selected subjects"],
    tips: [
      "Aim for the highest possible JAMB score",
      "Research your course's specific requirements",
      "Prepare well for POST-UTME",
      "Consider backup options early"
    ],
    careerProspects: ["Various career paths available"],
    backupCourses: ["Research related courses in your field"]
  }
};

// Map course names to tip categories
export const getCourseCategory = (courseName: string): string => {
  const name = courseName.toLowerCase();
  
  if (name.includes('medicine') || name.includes('surgery') || name.includes('dental')) return 'medicine';
  if (name.includes('pharmacy')) return 'pharmacy';
  if (name.includes('nursing') || name.includes('midwifery')) return 'nursing';
  if (name.includes('engineering')) return 'engineering';
  if (name.includes('computer') || name.includes('software')) return 'computerScience';
  if (name.includes('law')) return 'law';
  if (name.includes('accounting')) return 'accounting';
  if (name.includes('economics')) return 'economics';
  if (name.includes('physics') || name.includes('chemistry') || name.includes('biology') || 
      name.includes('mathematics') || name.includes('biochemistry') || name.includes('microbiology')) return 'sciences';
  if (name.includes('english') || name.includes('literature') || name.includes('history') || 
      name.includes('philosophy') || name.includes('linguistics') || name.includes('theatre')) return 'arts';
  
  return 'default';
};

export const getCourseTip = (courseName: string): CourseTip => {
  const category = getCourseCategory(courseName);
  return courseTips[category] || courseTips.default;
};
