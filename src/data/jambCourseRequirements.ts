// Official JAMB 2026 Subject Combinations for Nigerian Universities
export interface CourseRequirement {
  id: string;
  course: string;
  faculty: string;
  subjects: string[]; // Array of 4 required subjects (lowercase IDs)
  notes?: string;
}

export const JAMB_COURSE_REQUIREMENTS: CourseRequirement[] = [
  // MEDICINE & HEALTH SCIENCES
  { id: 'med-1', course: 'Medicine and Surgery', faculty: 'Medicine', subjects: ['english', 'physics', 'chemistry', 'biology'], notes: 'Very competitive. Requires high JAMB score (280+)' },
  { id: 'med-2', course: 'Dentistry', faculty: 'Medicine', subjects: ['english', 'physics', 'chemistry', 'biology'] },
  { id: 'med-3', course: 'Pharmacy', faculty: 'Pharmacy', subjects: ['english', 'physics', 'chemistry', 'biology'] },
  { id: 'med-4', course: 'Nursing Science', faculty: 'Health Sciences', subjects: ['english', 'physics', 'chemistry', 'biology'] },
  { id: 'med-5', course: 'Medical Laboratory Science', faculty: 'Health Sciences', subjects: ['english', 'physics', 'chemistry', 'biology'] },
  { id: 'med-6', course: 'Physiotherapy', faculty: 'Health Sciences', subjects: ['english', 'physics', 'chemistry', 'biology'] },
  { id: 'med-7', course: 'Radiography', faculty: 'Health Sciences', subjects: ['english', 'physics', 'chemistry', 'biology'] },
  { id: 'med-8', course: 'Optometry', faculty: 'Health Sciences', subjects: ['english', 'physics', 'chemistry', 'biology'] },
  { id: 'med-9', course: 'Anatomy', faculty: 'Basic Medical Sciences', subjects: ['english', 'physics', 'chemistry', 'biology'] },
  { id: 'med-10', course: 'Physiology', faculty: 'Basic Medical Sciences', subjects: ['english', 'physics', 'chemistry', 'biology'] },
  { id: 'med-11', course: 'Biochemistry', faculty: 'Science', subjects: ['english', 'chemistry', 'biology', 'physics'] },
  { id: 'med-12', course: 'Microbiology', faculty: 'Science', subjects: ['english', 'chemistry', 'biology', 'physics'] },
  { id: 'med-13', course: 'Public Health', faculty: 'Health Sciences', subjects: ['english', 'chemistry', 'biology', 'physics'] },
  { id: 'med-14', course: 'Health Education', faculty: 'Education', subjects: ['english', 'chemistry', 'biology', 'physics'] },
  { id: 'med-15', course: 'Veterinary Medicine', faculty: 'Veterinary Medicine', subjects: ['english', 'physics', 'chemistry', 'biology'] },

  // ENGINEERING
  { id: 'eng-1', course: 'Electrical/Electronics Engineering', faculty: 'Engineering', subjects: ['english', 'mathematics', 'physics', 'chemistry'] },
  { id: 'eng-2', course: 'Mechanical Engineering', faculty: 'Engineering', subjects: ['english', 'mathematics', 'physics', 'chemistry'] },
  { id: 'eng-3', course: 'Civil Engineering', faculty: 'Engineering', subjects: ['english', 'mathematics', 'physics', 'chemistry'] },
  { id: 'eng-4', course: 'Chemical Engineering', faculty: 'Engineering', subjects: ['english', 'mathematics', 'physics', 'chemistry'] },
  { id: 'eng-5', course: 'Petroleum Engineering', faculty: 'Engineering', subjects: ['english', 'mathematics', 'physics', 'chemistry'] },
  { id: 'eng-6', course: 'Computer Engineering', faculty: 'Engineering', subjects: ['english', 'mathematics', 'physics', 'chemistry'] },
  { id: 'eng-7', course: 'Aerospace Engineering', faculty: 'Engineering', subjects: ['english', 'mathematics', 'physics', 'chemistry'] },
  { id: 'eng-8', course: 'Agricultural Engineering', faculty: 'Engineering', subjects: ['english', 'mathematics', 'physics', 'chemistry'] },
  { id: 'eng-9', course: 'Metallurgical Engineering', faculty: 'Engineering', subjects: ['english', 'mathematics', 'physics', 'chemistry'] },
  { id: 'eng-10', course: 'Mechatronics Engineering', faculty: 'Engineering', subjects: ['english', 'mathematics', 'physics', 'chemistry'] },
  { id: 'eng-11', course: 'Biomedical Engineering', faculty: 'Engineering', subjects: ['english', 'mathematics', 'physics', 'chemistry'] },
  { id: 'eng-12', course: 'Marine Engineering', faculty: 'Engineering', subjects: ['english', 'mathematics', 'physics', 'chemistry'] },
  { id: 'eng-13', course: 'Systems Engineering', faculty: 'Engineering', subjects: ['english', 'mathematics', 'physics', 'chemistry'] },
  { id: 'eng-14', course: 'Polymer Engineering', faculty: 'Engineering', subjects: ['english', 'mathematics', 'physics', 'chemistry'] },
  { id: 'eng-15', course: 'Food Science and Technology', faculty: 'Engineering', subjects: ['english', 'mathematics', 'physics', 'chemistry'] },

  // SCIENCES
  { id: 'sci-1', course: 'Computer Science', faculty: 'Science', subjects: ['english', 'mathematics', 'physics', 'chemistry'] },
  { id: 'sci-2', course: 'Mathematics', faculty: 'Science', subjects: ['english', 'mathematics', 'physics', 'chemistry'] },
  { id: 'sci-3', course: 'Physics', faculty: 'Science', subjects: ['english', 'mathematics', 'physics', 'chemistry'] },
  { id: 'sci-4', course: 'Chemistry', faculty: 'Science', subjects: ['english', 'mathematics', 'physics', 'chemistry'] },
  { id: 'sci-5', course: 'Statistics', faculty: 'Science', subjects: ['english', 'mathematics', 'physics', 'chemistry'] },
  { id: 'sci-6', course: 'Industrial Chemistry', faculty: 'Science', subjects: ['english', 'mathematics', 'physics', 'chemistry'] },
  { id: 'sci-7', course: 'Geology', faculty: 'Science', subjects: ['english', 'mathematics', 'physics', 'chemistry'] },
  { id: 'sci-8', course: 'Geophysics', faculty: 'Science', subjects: ['english', 'mathematics', 'physics', 'chemistry'] },
  { id: 'sci-9', course: 'Applied Mathematics', faculty: 'Science', subjects: ['english', 'mathematics', 'physics', 'chemistry'] },
  { id: 'sci-10', course: 'Biology', faculty: 'Science', subjects: ['english', 'chemistry', 'biology', 'physics'] },
  { id: 'sci-11', course: 'Botany', faculty: 'Science', subjects: ['english', 'chemistry', 'biology', 'physics'] },
  { id: 'sci-12', course: 'Zoology', faculty: 'Science', subjects: ['english', 'chemistry', 'biology', 'physics'] },
  { id: 'sci-13', course: 'Genetics', faculty: 'Science', subjects: ['english', 'chemistry', 'biology', 'physics'] },
  { id: 'sci-14', course: 'Cell Biology', faculty: 'Science', subjects: ['english', 'chemistry', 'biology', 'physics'] },
  { id: 'sci-15', course: 'Marine Biology', faculty: 'Science', subjects: ['english', 'chemistry', 'biology', 'physics'] },
  { id: 'sci-16', course: 'Industrial Physics', faculty: 'Science', subjects: ['english', 'mathematics', 'physics', 'chemistry'] },

  // LAW
  { id: 'law-1', course: 'Law', faculty: 'Law', subjects: ['english', 'literature', 'government', 'economics'], notes: 'Requires high JAMB score. Some schools accept CRS/IRS instead of Economics' },
  { id: 'law-2', course: 'Common Law', faculty: 'Law', subjects: ['english', 'literature', 'government', 'economics'] },
  { id: 'law-3', course: 'Civil Law', faculty: 'Law', subjects: ['english', 'literature', 'government', 'economics'] },
  { id: 'law-4', course: 'Islamic Law (Sharia)', faculty: 'Law', subjects: ['english', 'irs', 'government', 'economics'] },
  
  // SOCIAL SCIENCES
  { id: 'soc-1', course: 'Economics', faculty: 'Social Sciences', subjects: ['english', 'mathematics', 'economics', 'government'] },
  { id: 'soc-2', course: 'Political Science', faculty: 'Social Sciences', subjects: ['english', 'government', 'economics', 'literature'] },
  { id: 'soc-3', course: 'Sociology', faculty: 'Social Sciences', subjects: ['english', 'government', 'economics', 'literature'] },
  { id: 'soc-4', course: 'Psychology', faculty: 'Social Sciences', subjects: ['english', 'biology', 'chemistry', 'physics'] },
  { id: 'soc-5', course: 'Mass Communication', faculty: 'Social Sciences', subjects: ['english', 'literature', 'government', 'economics'] },
  { id: 'soc-6', course: 'International Relations', faculty: 'Social Sciences', subjects: ['english', 'government', 'economics', 'literature'] },
  { id: 'soc-7', course: 'Public Administration', faculty: 'Social Sciences', subjects: ['english', 'government', 'economics', 'mathematics'] },
  { id: 'soc-8', course: 'Geography', faculty: 'Social Sciences', subjects: ['english', 'geography', 'mathematics', 'economics'] },
  { id: 'soc-9', course: 'Criminology', faculty: 'Social Sciences', subjects: ['english', 'government', 'economics', 'literature'] },
  { id: 'soc-10', course: 'Demography', faculty: 'Social Sciences', subjects: ['english', 'mathematics', 'economics', 'geography'] },
  { id: 'soc-11', course: 'Social Work', faculty: 'Social Sciences', subjects: ['english', 'government', 'economics', 'literature'] },

  // ARTS & HUMANITIES
  { id: 'art-1', course: 'English Language', faculty: 'Arts', subjects: ['english', 'literature', 'government', 'economics'] },
  { id: 'art-2', course: 'History', faculty: 'Arts', subjects: ['english', 'government', 'literature', 'economics'] },
  { id: 'art-3', course: 'Philosophy', faculty: 'Arts', subjects: ['english', 'literature', 'government', 'crs'] },
  { id: 'art-4', course: 'Religious Studies', faculty: 'Arts', subjects: ['english', 'crs', 'government', 'literature'] },
  { id: 'art-5', course: 'Islamic Studies', faculty: 'Arts', subjects: ['english', 'irs', 'government', 'literature'] },
  { id: 'art-6', course: 'Linguistics', faculty: 'Arts', subjects: ['english', 'literature', 'government', 'economics'] },
  { id: 'art-7', course: 'Theatre Arts', faculty: 'Arts', subjects: ['english', 'literature', 'government', 'economics'] },
  { id: 'art-8', course: 'Music', faculty: 'Arts', subjects: ['english', 'literature', 'government', 'economics'] },
  { id: 'art-9', course: 'Fine Arts', faculty: 'Arts', subjects: ['english', 'literature', 'government', 'economics'] },
  { id: 'art-10', course: 'Creative Arts', faculty: 'Arts', subjects: ['english', 'literature', 'government', 'economics'] },
  { id: 'art-11', course: 'French', faculty: 'Arts', subjects: ['english', 'literature', 'government', 'economics'] },
  { id: 'art-12', course: 'Arabic', faculty: 'Arts', subjects: ['english', 'irs', 'government', 'literature'] },
  { id: 'art-13', course: 'Yoruba', faculty: 'Arts', subjects: ['english', 'literature', 'government', 'economics'] },
  { id: 'art-14', course: 'Igbo', faculty: 'Arts', subjects: ['english', 'literature', 'government', 'economics'] },
  { id: 'art-15', course: 'Hausa', faculty: 'Arts', subjects: ['english', 'literature', 'government', 'economics'] },

  // MANAGEMENT SCIENCES / BUSINESS
  { id: 'bus-1', course: 'Accounting', faculty: 'Management Sciences', subjects: ['english', 'mathematics', 'economics', 'accounting'] },
  { id: 'bus-2', course: 'Business Administration', faculty: 'Management Sciences', subjects: ['english', 'mathematics', 'economics', 'accounting'] },
  { id: 'bus-3', course: 'Banking and Finance', faculty: 'Management Sciences', subjects: ['english', 'mathematics', 'economics', 'accounting'] },
  { id: 'bus-4', course: 'Marketing', faculty: 'Management Sciences', subjects: ['english', 'mathematics', 'economics', 'commerce'] },
  { id: 'bus-5', course: 'Insurance', faculty: 'Management Sciences', subjects: ['english', 'mathematics', 'economics', 'accounting'] },
  { id: 'bus-6', course: 'Actuarial Science', faculty: 'Management Sciences', subjects: ['english', 'mathematics', 'economics', 'accounting'] },
  { id: 'bus-7', course: 'Entrepreneurship', faculty: 'Management Sciences', subjects: ['english', 'mathematics', 'economics', 'commerce'] },
  { id: 'bus-8', course: 'Human Resource Management', faculty: 'Management Sciences', subjects: ['english', 'mathematics', 'economics', 'government'] },
  { id: 'bus-9', course: 'Office Management', faculty: 'Management Sciences', subjects: ['english', 'mathematics', 'economics', 'commerce'] },
  { id: 'bus-10', course: 'Hospitality Management', faculty: 'Management Sciences', subjects: ['english', 'mathematics', 'economics', 'commerce'] },
  { id: 'bus-11', course: 'Tourism Management', faculty: 'Management Sciences', subjects: ['english', 'mathematics', 'economics', 'geography'] },

  // AGRICULTURE
  { id: 'agr-1', course: 'Agricultural Science', faculty: 'Agriculture', subjects: ['english', 'chemistry', 'biology', 'agricultural_science'] },
  { id: 'agr-2', course: 'Agricultural Economics', faculty: 'Agriculture', subjects: ['english', 'mathematics', 'economics', 'agricultural_science'] },
  { id: 'agr-3', course: 'Animal Science', faculty: 'Agriculture', subjects: ['english', 'chemistry', 'biology', 'agricultural_science'] },
  { id: 'agr-4', course: 'Crop Science', faculty: 'Agriculture', subjects: ['english', 'chemistry', 'biology', 'agricultural_science'] },
  { id: 'agr-5', course: 'Soil Science', faculty: 'Agriculture', subjects: ['english', 'chemistry', 'biology', 'agricultural_science'] },
  { id: 'agr-6', course: 'Forestry', faculty: 'Agriculture', subjects: ['english', 'chemistry', 'biology', 'agricultural_science'] },
  { id: 'agr-7', course: 'Fisheries', faculty: 'Agriculture', subjects: ['english', 'chemistry', 'biology', 'agricultural_science'] },
  { id: 'agr-8', course: 'Agricultural Extension', faculty: 'Agriculture', subjects: ['english', 'chemistry', 'biology', 'agricultural_science'] },
  { id: 'agr-9', course: 'Home Economics', faculty: 'Agriculture', subjects: ['english', 'chemistry', 'biology', 'economics'] },
  { id: 'agr-10', course: 'Food and Nutrition', faculty: 'Agriculture', subjects: ['english', 'chemistry', 'biology', 'physics'] },

  // EDUCATION
  { id: 'edu-1', course: 'Education (Science)', faculty: 'Education', subjects: ['english', 'mathematics', 'physics', 'chemistry'] },
  { id: 'edu-2', course: 'Education (Arts)', faculty: 'Education', subjects: ['english', 'literature', 'government', 'economics'] },
  { id: 'edu-3', course: 'Education English', faculty: 'Education', subjects: ['english', 'literature', 'government', 'economics'] },
  { id: 'edu-4', course: 'Education Mathematics', faculty: 'Education', subjects: ['english', 'mathematics', 'physics', 'chemistry'] },
  { id: 'edu-5', course: 'Education Biology', faculty: 'Education', subjects: ['english', 'biology', 'chemistry', 'physics'] },
  { id: 'edu-6', course: 'Education Chemistry', faculty: 'Education', subjects: ['english', 'chemistry', 'biology', 'physics'] },
  { id: 'edu-7', course: 'Education Physics', faculty: 'Education', subjects: ['english', 'physics', 'mathematics', 'chemistry'] },
  { id: 'edu-8', course: 'Education Economics', faculty: 'Education', subjects: ['english', 'economics', 'mathematics', 'government'] },
  { id: 'edu-9', course: 'Education Government', faculty: 'Education', subjects: ['english', 'government', 'economics', 'literature'] },
  { id: 'edu-10', course: 'Guidance and Counselling', faculty: 'Education', subjects: ['english', 'government', 'economics', 'biology'] },
  { id: 'edu-11', course: 'Library Science', faculty: 'Education', subjects: ['english', 'literature', 'government', 'economics'] },
  { id: 'edu-12', course: 'Educational Management', faculty: 'Education', subjects: ['english', 'economics', 'government', 'mathematics'] },
  { id: 'edu-13', course: 'Special Education', faculty: 'Education', subjects: ['english', 'biology', 'government', 'economics'] },
  { id: 'edu-14', course: 'Early Childhood Education', faculty: 'Education', subjects: ['english', 'biology', 'government', 'economics'] },

  // ENVIRONMENTAL SCIENCES
  { id: 'env-1', course: 'Architecture', faculty: 'Environmental Sciences', subjects: ['english', 'mathematics', 'physics', 'chemistry'] },
  { id: 'env-2', course: 'Building Technology', faculty: 'Environmental Sciences', subjects: ['english', 'mathematics', 'physics', 'chemistry'] },
  { id: 'env-3', course: 'Estate Management', faculty: 'Environmental Sciences', subjects: ['english', 'mathematics', 'economics', 'geography'] },
  { id: 'env-4', course: 'Quantity Surveying', faculty: 'Environmental Sciences', subjects: ['english', 'mathematics', 'physics', 'chemistry'] },
  { id: 'env-5', course: 'Urban and Regional Planning', faculty: 'Environmental Sciences', subjects: ['english', 'mathematics', 'geography', 'economics'] },
  { id: 'env-6', course: 'Surveying and Geoinformatics', faculty: 'Environmental Sciences', subjects: ['english', 'mathematics', 'physics', 'geography'] },
  { id: 'env-7', course: 'Environmental Management', faculty: 'Environmental Sciences', subjects: ['english', 'biology', 'chemistry', 'geography'] },
  { id: 'env-8', course: 'Landscape Architecture', faculty: 'Environmental Sciences', subjects: ['english', 'mathematics', 'physics', 'chemistry'] },

  // INFORMATION TECHNOLOGY
  { id: 'it-1', course: 'Information Technology', faculty: 'Computing', subjects: ['english', 'mathematics', 'physics', 'chemistry'] },
  { id: 'it-2', course: 'Software Engineering', faculty: 'Computing', subjects: ['english', 'mathematics', 'physics', 'chemistry'] },
  { id: 'it-3', course: 'Cyber Security', faculty: 'Computing', subjects: ['english', 'mathematics', 'physics', 'chemistry'] },
  { id: 'it-4', course: 'Data Science', faculty: 'Computing', subjects: ['english', 'mathematics', 'physics', 'chemistry'] },
  { id: 'it-5', course: 'Information Systems', faculty: 'Computing', subjects: ['english', 'mathematics', 'physics', 'economics'] },
];

// Get all unique faculties
export const FACULTIES = [...new Set(JAMB_COURSE_REQUIREMENTS.map(c => c.faculty))].sort();

// Helper function to check if user's subjects match a course requirement
export const checkSubjectMatch = (userSubjects: string[], courseSubjects: string[]): {
  matches: boolean;
  matchedSubjects: string[];
  missingSubjects: string[];
  matchPercentage: number;
} => {
  const normalizedUserSubjects = userSubjects.map(s => s.toLowerCase());
  const normalizedCourseSubjects = courseSubjects.map(s => s.toLowerCase());
  
  const matchedSubjects = normalizedCourseSubjects.filter(s => normalizedUserSubjects.includes(s));
  const missingSubjects = normalizedCourseSubjects.filter(s => !normalizedUserSubjects.includes(s));
  const matchPercentage = (matchedSubjects.length / normalizedCourseSubjects.length) * 100;
  
  return {
    matches: missingSubjects.length === 0,
    matchedSubjects,
    missingSubjects,
    matchPercentage,
  };
};

// Get courses that match user's subjects
export const getMatchingCourses = (userSubjects: string[]): CourseRequirement[] => {
  return JAMB_COURSE_REQUIREMENTS.filter(course => {
    const { matches } = checkSubjectMatch(userSubjects, course.subjects);
    return matches;
  });
};

// Get partially matching courses (sorted by match percentage)
export const getPartiallyMatchingCourses = (userSubjects: string[]): Array<CourseRequirement & { matchPercentage: number; missingSubjects: string[] }> => {
  return JAMB_COURSE_REQUIREMENTS
    .map(course => {
      const { matchPercentage, missingSubjects, matches } = checkSubjectMatch(userSubjects, course.subjects);
      return { ...course, matchPercentage, missingSubjects, matches };
    })
    .filter(c => !c.matches && c.matchPercentage > 0)
    .sort((a, b) => b.matchPercentage - a.matchPercentage);
};

// Subject ID to display name mapping
export const SUBJECT_DISPLAY_NAMES: Record<string, string> = {
  english: 'English',
  mathematics: 'Mathematics',
  physics: 'Physics',
  chemistry: 'Chemistry',
  biology: 'Biology',
  literature: 'Literature',
  government: 'Government',
  economics: 'Economics',
  crs: 'CRS',
  irs: 'IRS',
  geography: 'Geography',
  accounting: 'Accounting',
  commerce: 'Commerce',
  agricultural_science: 'Agric Science',
};
