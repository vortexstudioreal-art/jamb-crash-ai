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

  cyberSecurity: {
    category: "Technology",
    targetScore: "250+",
    focusSubjects: ["Mathematics", "Physics", "Computer Science"],
    tips: [
      "Strong Mathematics and logical thinking are essential",
      "Learn networking fundamentals and security concepts",
      "Get certified: CompTIA Security+, CEH, CISSP are valuable",
      "Practice ethical hacking and penetration testing",
      "Stay updated with latest cyber threats and defenses"
    ],
    careerProspects: ["Security Analyst", "Penetration Tester", "Security Engineer", "CISO", "Forensic Analyst"],
    backupCourses: ["Computer Science", "Information Technology", "Software Engineering"]
  },

  softwareEngineering: {
    category: "Technology",
    targetScore: "250+",
    focusSubjects: ["Mathematics", "Physics"],
    tips: [
      "Master data structures and algorithms",
      "Start coding projects early - GitHub portfolio matters",
      "Learn software development methodologies (Agile, DevOps)",
      "Build real-world applications for experience"
    ],
    careerProspects: ["Software Engineer", "Full Stack Developer", "Mobile Developer", "DevOps Engineer"],
    backupCourses: ["Computer Science", "Information Technology", "Mathematics"]
  },

  informationTechnology: {
    category: "Technology",
    targetScore: "230+",
    focusSubjects: ["Mathematics", "Physics"],
    tips: [
      "Broad understanding of IT systems is essential",
      "Focus on practical IT skills and certifications",
      "Cloud computing knowledge is increasingly valuable",
      "Consider specializing in networking, databases, or systems"
    ],
    careerProspects: ["IT Manager", "Network Administrator", "Database Admin", "Cloud Architect"],
    backupCourses: ["Computer Science", "Software Engineering", "Statistics"]
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

  // Mass Communication / Journalism
  massCommunication: {
    category: "Media & Communication",
    targetScore: "220+",
    focusSubjects: ["English", "Government", "Literature/CRS"],
    tips: [
      "Excellent communication skills are essential",
      "Stay updated with current affairs",
      "Practice writing regularly",
      "Build a portfolio of written work"
    ],
    careerProspects: ["Journalist", "Broadcaster", "Public Relations Officer", "Social Media Manager", "Content Creator"],
    backupCourses: ["English", "Theatre Arts", "Political Science"]
  },

  // Political Science / International Relations
  politicalScience: {
    category: "Social Sciences",
    targetScore: "230+",
    focusSubjects: ["Government", "English", "Economics/History"],
    tips: [
      "Strong Government foundation is crucial",
      "Understand Nigerian and world politics",
      "Good analytical skills required",
      "Consider diplomatic service as career"
    ],
    careerProspects: ["Politician", "Diplomat", "Policy Analyst", "Civil Servant", "Political Consultant"],
    backupCourses: ["Public Administration", "International Relations", "History"]
  },

  // Public Administration
  publicAdministration: {
    category: "Social Sciences",
    targetScore: "220+",
    focusSubjects: ["Government", "Economics", "English"],
    tips: [
      "Understanding of government systems essential",
      "Strong organizational skills needed",
      "Consider civil service career path",
      "Good communication skills important"
    ],
    careerProspects: ["Civil Servant", "Administrator", "Policy Maker", "Local Government Official"],
    backupCourses: ["Political Science", "Sociology", "Business Administration"]
  },

  // Banking & Finance
  bankingFinance: {
    category: "Business",
    targetScore: "230+",
    focusSubjects: ["Mathematics", "Economics", "Commerce"],
    tips: [
      "Strong Mathematics foundation essential",
      "Understand financial markets and instruments",
      "Consider professional certifications (CFA, CIBN)",
      "Internships in banks are valuable"
    ],
    careerProspects: ["Banker", "Financial Analyst", "Investment Advisor", "Treasury Manager"],
    backupCourses: ["Accounting", "Economics", "Business Administration"]
  },

  // Business Administration
  businessAdmin: {
    category: "Business",
    targetScore: "220+",
    focusSubjects: ["Economics", "Commerce", "Mathematics"],
    tips: [
      "Broad business knowledge required",
      "Leadership and management skills are key",
      "Consider MBA for career advancement",
      "Entrepreneurship is a viable path"
    ],
    careerProspects: ["Business Manager", "Entrepreneur", "HR Manager", "Operations Manager", "Consultant"],
    backupCourses: ["Economics", "Accounting", "Marketing"]
  },

  // Architecture
  architecture: {
    category: "Environmental Sciences",
    targetScore: "250+",
    focusSubjects: ["Mathematics", "Physics", "Art/Technical Drawing"],
    tips: [
      "Strong drawing and creative skills essential",
      "Mathematics proficiency is crucial",
      "Build a portfolio of designs",
      "Consider internships at architectural firms"
    ],
    careerProspects: ["Architect", "Urban Planner", "Interior Designer", "Construction Manager"],
    backupCourses: ["Building Technology", "Estate Management", "Quantity Surveying"]
  },

  // Estate Management
  estateManagement: {
    category: "Environmental Sciences",
    targetScore: "220+",
    focusSubjects: ["Mathematics", "Geography", "Economics"],
    tips: [
      "Understanding of property markets essential",
      "Good negotiation skills needed",
      "Legal knowledge is beneficial",
      "Consider NIESV certification"
    ],
    careerProspects: ["Estate Surveyor", "Property Manager", "Real Estate Developer", "Valuer"],
    backupCourses: ["Urban Planning", "Geography", "Business Administration"]
  },

  // Agriculture / Agricultural Science
  agriculture: {
    category: "Agriculture",
    targetScore: "200+",
    focusSubjects: ["Biology", "Chemistry", "Agriculture"],
    tips: [
      "Practical knowledge of farming important",
      "Understanding of soil science and crops",
      "Consider agribusiness as career path",
      "Government programs offer opportunities"
    ],
    careerProspects: ["Agricultural Officer", "Farm Manager", "Agribusiness Owner", "Agricultural Researcher"],
    backupCourses: ["Animal Science", "Crop Science", "Fisheries"]
  },

  // Statistics
  statistics: {
    category: "Pure Sciences",
    targetScore: "230+",
    focusSubjects: ["Mathematics", "Economics", "Physics"],
    tips: [
      "Strong Mathematics foundation is essential",
      "Learn statistical software early",
      "Data analysis skills are highly valued",
      "Consider data science as career path"
    ],
    careerProspects: ["Statistician", "Data Analyst", "Actuary", "Research Scientist"],
    backupCourses: ["Mathematics", "Computer Science", "Economics"]
  },

  // Medical Laboratory Science
  medLabScience: {
    category: "Medical Sciences",
    targetScore: "240+",
    focusSubjects: ["Biology", "Chemistry", "Physics"],
    tips: [
      "Strong Biology and Chemistry foundation essential",
      "Practical lab skills are crucial",
      "Consider specialization areas early",
      "Continuous learning is important in this field"
    ],
    careerProspects: ["Medical Lab Scientist", "Lab Manager", "Research Scientist", "Quality Control Officer"],
    backupCourses: ["Biochemistry", "Microbiology", "Nursing"]
  },

  // Biochemistry
  biochemistry: {
    category: "Pure Sciences",
    targetScore: "240+",
    focusSubjects: ["Biology", "Chemistry", "Physics/Mathematics"],
    tips: [
      "Strong foundation in both Biology and Chemistry",
      "Good lab skills essential",
      "Research-oriented field",
      "Consider postgraduate studies"
    ],
    careerProspects: ["Biochemist", "Research Scientist", "Pharmaceutical Scientist", "Lecturer"],
    backupCourses: ["Microbiology", "Chemistry", "Medical Laboratory Science"]
  },

  // Microbiology
  microbiology: {
    category: "Pure Sciences",
    targetScore: "230+",
    focusSubjects: ["Biology", "Chemistry", "Physics/Mathematics"],
    tips: [
      "Strong Biology foundation essential",
      "Lab work is a major component",
      "Food and pharmaceutical industries need microbiologists",
      "Research skills are valuable"
    ],
    careerProspects: ["Microbiologist", "Quality Control Officer", "Research Scientist", "Lab Manager"],
    backupCourses: ["Biochemistry", "Biology", "Medical Laboratory Science"]
  },

  // Psychology
  psychology: {
    category: "Social Sciences",
    targetScore: "220+",
    focusSubjects: ["English", "Biology", "Government"],
    tips: [
      "Good understanding of human behavior essential",
      "Strong communication skills needed",
      "Consider clinical vs industrial paths",
      "Postgraduate study often required for practice"
    ],
    careerProspects: ["Psychologist", "Counselor", "HR Specialist", "Therapist"],
    backupCourses: ["Sociology", "Social Work", "Philosophy"]
  },

  // Sociology
  sociology: {
    category: "Social Sciences",
    targetScore: "200+",
    focusSubjects: ["Government", "Economics", "English"],
    tips: [
      "Understanding of social structures important",
      "Research skills are valuable",
      "Consider NGO and development sector",
      "Combine with practical skills"
    ],
    careerProspects: ["Social Worker", "Researcher", "HR Officer", "Community Development Officer"],
    backupCourses: ["Psychology", "Social Work", "Public Administration"]
  },

  // Theatre Arts
  theatreArts: {
    category: "Arts & Humanities",
    targetScore: "200+",
    focusSubjects: ["English", "Literature", "CRS/Government"],
    tips: [
      "Creative and performance skills essential",
      "Build a portfolio of work",
      "Network in the entertainment industry",
      "Consider film production as career path"
    ],
    careerProspects: ["Actor", "Director", "Producer", "Scriptwriter", "Theatre Manager"],
    backupCourses: ["Mass Communication", "English", "Creative Arts"]
  },

  // Geology
  geology: {
    category: "Pure Sciences",
    targetScore: "230+",
    focusSubjects: ["Physics", "Chemistry", "Geography"],
    tips: [
      "Strong science foundation essential",
      "Field work is a major component",
      "Oil and gas industry offers opportunities",
      "Consider environmental consulting"
    ],
    careerProspects: ["Geologist", "Petroleum Geologist", "Mining Geologist", "Environmental Consultant"],
    backupCourses: ["Geography", "Physics", "Environmental Science"]
  },

  // Quantity Surveying
  quantitySurveying: {
    category: "Environmental Sciences",
    targetScore: "230+",
    focusSubjects: ["Mathematics", "Physics", "Economics"],
    tips: [
      "Strong Mathematics skills essential",
      "Understanding of construction industry",
      "Attention to detail is crucial",
      "Consider NIQS membership"
    ],
    careerProspects: ["Quantity Surveyor", "Cost Consultant", "Project Manager", "Construction Estimator"],
    backupCourses: ["Building Technology", "Architecture", "Civil Engineering"]
  },

  // Education courses
  education: {
    category: "Education",
    targetScore: "200+",
    focusSubjects: ["Your teaching subject", "English", "Mathematics"],
    tips: [
      "Passion for teaching essential",
      "Strong knowledge in your subject area",
      "Good communication skills required",
      "Consider private school or tutoring"
    ],
    careerProspects: ["Teacher", "School Administrator", "Education Consultant", "Curriculum Developer"],
    backupCourses: ["Any related pure course", "Educational Psychology"]
  },

  // International Relations
  internationalRelations: {
    category: "Social Sciences",
    targetScore: "240+",
    focusSubjects: ["Government", "History", "Economics"],
    tips: [
      "Strong knowledge of world affairs essential",
      "Foreign language skills are valuable",
      "Consider diplomatic service career",
      "Research skills are important"
    ],
    careerProspects: ["Diplomat", "Foreign Affairs Officer", "International Organization Staff", "Policy Analyst"],
    backupCourses: ["Political Science", "Economics", "History"]
  },

  // History
  history: {
    category: "Arts & Humanities",
    targetScore: "200+",
    focusSubjects: ["English", "Government", "CRS/Literature"],
    tips: [
      "Strong reading and analytical skills essential",
      "Good memory and attention to detail",
      "Research and writing skills important",
      "Consider archival work or academia"
    ],
    careerProspects: ["Historian", "Archivist", "Museum Curator", "Researcher", "Teacher"],
    backupCourses: ["Political Science", "International Relations", "Archaeology"]
  },

  // Philosophy
  philosophy: {
    category: "Arts & Humanities",
    targetScore: "200+",
    focusSubjects: ["English", "CRS/IRS", "Government"],
    tips: [
      "Strong critical thinking skills essential",
      "Good reading and writing abilities",
      "Consider law or academia as career",
      "Ethics and logic are key areas"
    ],
    careerProspects: ["Academic", "Ethicist", "Writer", "Consultant"],
    backupCourses: ["Religious Studies", "English", "Law"]
  },

  // Dentistry / Dental Surgery
  dentistry: {
    category: "Medical Sciences",
    targetScore: "280+",
    focusSubjects: ["Biology", "Chemistry", "Physics"],
    tips: [
      "Very competitive - aim for 290+",
      "Strong science foundation essential",
      "Good manual dexterity required",
      "Consider private practice as career"
    ],
    careerProspects: ["Dentist", "Oral Surgeon", "Orthodontist", "Dental Consultant"],
    backupCourses: ["Medicine", "Pharmacy", "Anatomy"]
  },

  // Physiotherapy
  physiotherapy: {
    category: "Medical Sciences",
    targetScore: "250+",
    focusSubjects: ["Biology", "Chemistry", "Physics"],
    tips: [
      "Strong Biology foundation essential",
      "Good physical fitness required",
      "Understanding of human anatomy crucial",
      "Sports medicine is a growing field"
    ],
    careerProspects: ["Physiotherapist", "Sports Therapist", "Rehabilitation Specialist", "Private Practitioner"],
    backupCourses: ["Nursing", "Medical Rehabilitation", "Anatomy"]
  },

  // Radiography
  radiography: {
    category: "Medical Sciences",
    targetScore: "240+",
    focusSubjects: ["Physics", "Biology", "Chemistry"],
    tips: [
      "Strong Physics foundation essential",
      "Understanding of medical imaging technology",
      "Attention to detail is crucial",
      "Hospital and diagnostic centers offer jobs"
    ],
    careerProspects: ["Radiographer", "Medical Imaging Specialist", "CT/MRI Technologist", "Ultrasound Technician"],
    backupCourses: ["Medical Laboratory Science", "Nursing", "Physics"]
  },

  // Anatomy
  anatomy: {
    category: "Medical Sciences",
    targetScore: "250+",
    focusSubjects: ["Biology", "Chemistry", "Physics"],
    tips: [
      "Strong Biology foundation essential",
      "Good for medicine aspirants",
      "Research and academia are common paths",
      "Consider postgraduate studies"
    ],
    careerProspects: ["Anatomist", "Medical Researcher", "Lecturer", "Forensic Expert"],
    backupCourses: ["Physiology", "Medical Laboratory Science", "Biology"]
  },

  // Urban & Regional Planning
  urbanPlanning: {
    category: "Environmental Sciences",
    targetScore: "220+",
    focusSubjects: ["Geography", "Mathematics", "Economics"],
    tips: [
      "Understanding of urban development essential",
      "GIS and mapping skills valuable",
      "Government agencies are major employers",
      "Consider NITP membership"
    ],
    careerProspects: ["Urban Planner", "Town Planner", "Development Consultant", "GIS Specialist"],
    backupCourses: ["Geography", "Estate Management", "Architecture"]
  },

  // Veterinary Medicine
  veterinaryMedicine: {
    category: "Medical Sciences",
    targetScore: "270+",
    focusSubjects: ["Biology", "Chemistry", "Physics"],
    tips: [
      "Strong Biology and Chemistry foundation essential",
      "Love for animals is a must",
      "Consider large animal or small animal specialization",
      "Rural practice opportunities are significant"
    ],
    careerProspects: ["Veterinarian", "Animal Health Officer", "Livestock Specialist", "Zoo Vet"],
    backupCourses: ["Animal Science", "Agriculture", "Biology"]
  },

  // Optometry
  optometry: {
    category: "Medical Sciences",
    targetScore: "250+",
    focusSubjects: ["Biology", "Physics", "Chemistry"],
    tips: [
      "Strong Physics and Biology knowledge required",
      "Understanding of optics essential",
      "Private practice is a common career path",
      "Eye care demand is growing"
    ],
    careerProspects: ["Optometrist", "Eye Care Specialist", "Vision Therapist", "Optical Business Owner"],
    backupCourses: ["Physics", "Medical Laboratory Science", "Biology"]
  },

  // Food Science & Technology
  foodScience: {
    category: "Applied Sciences",
    targetScore: "220+",
    focusSubjects: ["Chemistry", "Biology", "Mathematics"],
    tips: [
      "Understanding of food chemistry and microbiology",
      "Quality control skills are valuable",
      "Food industry offers many opportunities",
      "Consider NAFDAC or food manufacturing careers"
    ],
    careerProspects: ["Food Scientist", "Quality Control Manager", "Food Safety Officer", "Product Developer"],
    backupCourses: ["Microbiology", "Biochemistry", "Chemistry"]
  },

  // Petroleum Engineering
  petroleumEngineering: {
    category: "Engineering",
    targetScore: "280+",
    focusSubjects: ["Mathematics", "Physics", "Chemistry"],
    tips: [
      "Very competitive - aim high",
      "Oil and gas industry offers high salaries",
      "Field work is a major component",
      "Consider international opportunities"
    ],
    careerProspects: ["Petroleum Engineer", "Reservoir Engineer", "Drilling Engineer", "Production Engineer"],
    backupCourses: ["Chemical Engineering", "Geology", "Mechanical Engineering"]
  },

  // Chemical Engineering
  chemicalEngineering: {
    category: "Engineering",
    targetScore: "260+",
    focusSubjects: ["Chemistry", "Mathematics", "Physics"],
    tips: [
      "Strong Chemistry and Mathematics required",
      "Process industries offer opportunities",
      "Consider oil & gas or manufacturing sectors"
    ],
    careerProspects: ["Chemical Engineer", "Process Engineer", "Plant Manager", "Quality Engineer"],
    backupCourses: ["Chemistry", "Petroleum Engineering", "Industrial Chemistry"]
  },

  // Electrical Engineering
  electricalEngineering: {
    category: "Engineering",
    targetScore: "260+",
    focusSubjects: ["Mathematics", "Physics", "Further Mathematics"],
    tips: [
      "Strong Mathematics and Physics essential",
      "Power sector offers many opportunities",
      "Consider renewable energy specialization"
    ],
    careerProspects: ["Electrical Engineer", "Power Systems Engineer", "Control Engineer", "Telecom Engineer"],
    backupCourses: ["Physics", "Computer Engineering", "Mechanical Engineering"]
  },

  // Mechanical Engineering
  mechanicalEngineering: {
    category: "Engineering",
    targetScore: "260+",
    focusSubjects: ["Mathematics", "Physics", "Further Mathematics"],
    tips: [
      "Strong foundation in mechanics and thermodynamics",
      "CAD skills are increasingly important",
      "Manufacturing and automotive sectors offer jobs"
    ],
    careerProspects: ["Mechanical Engineer", "Design Engineer", "Manufacturing Engineer", "Automotive Engineer"],
    backupCourses: ["Physics", "Industrial Design", "Civil Engineering"]
  },

  // Civil Engineering
  civilEngineering: {
    category: "Engineering",
    targetScore: "260+",
    focusSubjects: ["Mathematics", "Physics", "Further Mathematics"],
    tips: [
      "Strong structural analysis skills needed",
      "Construction industry offers many opportunities",
      "Consider specializing in roads, bridges, or buildings"
    ],
    careerProspects: ["Civil Engineer", "Structural Engineer", "Site Engineer", "Project Manager"],
    backupCourses: ["Architecture", "Building Technology", "Quantity Surveying"]
  },

  // Marine Engineering
  marineEngineering: {
    category: "Engineering",
    targetScore: "250+",
    focusSubjects: ["Mathematics", "Physics", "Chemistry"],
    tips: [
      "Maritime industry offers global opportunities",
      "Sea-going career requires physical fitness",
      "Consider maritime certifications"
    ],
    careerProspects: ["Marine Engineer", "Ship Surveyor", "Port Engineer", "Maritime Consultant"],
    backupCourses: ["Mechanical Engineering", "Naval Architecture", "Physics"]
  },

  // Computer Engineering
  computerEngineering: {
    category: "Technology",
    targetScore: "260+",
    focusSubjects: ["Mathematics", "Physics", "Further Mathematics"],
    tips: [
      "Combines hardware and software knowledge",
      "Strong programming skills essential",
      "Embedded systems is a growing field"
    ],
    careerProspects: ["Computer Engineer", "Embedded Systems Developer", "Hardware Designer", "IoT Specialist"],
    backupCourses: ["Computer Science", "Electrical Engineering", "Software Engineering"]
  },

  // Marketing
  marketing: {
    category: "Business",
    targetScore: "200+",
    focusSubjects: ["Economics", "Commerce", "English"],
    tips: [
      "Strong communication and creativity needed",
      "Digital marketing skills are essential today",
      "Build a portfolio of campaigns",
      "Consider certifications like Google Ads"
    ],
    careerProspects: ["Marketing Manager", "Brand Manager", "Digital Marketer", "Advertising Executive"],
    backupCourses: ["Business Administration", "Mass Communication", "Economics"]
  },

  // Insurance
  insurance: {
    category: "Business",
    targetScore: "200+",
    focusSubjects: ["Mathematics", "Economics", "Commerce"],
    tips: [
      "Understanding of risk management important",
      "Actuarial skills are valuable",
      "Consider CIIN certification",
      "Insurance industry is growing"
    ],
    careerProspects: ["Insurance Broker", "Underwriter", "Claims Analyst", "Risk Manager"],
    backupCourses: ["Accounting", "Banking & Finance", "Economics"]
  },

  // Hospitality Management
  hospitalityManagement: {
    category: "Business",
    targetScore: "200+",
    focusSubjects: ["Economics", "Commerce", "English"],
    tips: [
      "Customer service skills essential",
      "Consider international hotel chains",
      "Language skills are valuable",
      "Internships at hotels are important"
    ],
    careerProspects: ["Hotel Manager", "Restaurant Manager", "Event Planner", "Tourism Officer"],
    backupCourses: ["Business Administration", "Tourism", "Mass Communication"]
  },

  // Tourism
  tourism: {
    category: "Business",
    targetScore: "200+",
    focusSubjects: ["Geography", "Economics", "English"],
    tips: [
      "Understanding of Nigerian tourism potential",
      "Language skills add value",
      "Consider tour operations or travel agencies"
    ],
    careerProspects: ["Tourism Officer", "Travel Consultant", "Tour Guide", "Destination Manager"],
    backupCourses: ["Hospitality Management", "Geography", "Mass Communication"]
  },

  // Geography
  geography: {
    category: "Social Sciences",
    targetScore: "200+",
    focusSubjects: ["Geography", "Mathematics", "Economics"],
    tips: [
      "GIS and mapping skills are highly valuable",
      "Consider environmental consulting",
      "Government agencies are major employers"
    ],
    careerProspects: ["Geographer", "GIS Analyst", "Environmental Consultant", "Urban Planner"],
    backupCourses: ["Urban Planning", "Environmental Science", "Geology"]
  },

  // Environmental Science
  environmentalScience: {
    category: "Pure Sciences",
    targetScore: "220+",
    focusSubjects: ["Biology", "Chemistry", "Geography"],
    tips: [
      "Growing field due to climate concerns",
      "Consider environmental consulting",
      "NGOs and government agencies offer jobs"
    ],
    careerProspects: ["Environmental Scientist", "Sustainability Officer", "Environmental Consultant", "Climate Analyst"],
    backupCourses: ["Geography", "Biology", "Geology"]
  },

  // Library Science
  libraryScience: {
    category: "Arts & Humanities",
    targetScore: "180+",
    focusSubjects: ["English", "Government", "Literature"],
    tips: [
      "Digital library skills are essential",
      "Information management is growing",
      "Academic and corporate libraries offer jobs"
    ],
    careerProspects: ["Librarian", "Information Manager", "Archivist", "Digital Resource Manager"],
    backupCourses: ["Mass Communication", "Computer Science", "English"]
  },

  // Fine Arts
  fineArts: {
    category: "Arts & Humanities",
    targetScore: "180+",
    focusSubjects: ["English", "Fine Art", "Literature"],
    tips: [
      "Build a strong portfolio of work",
      "Network in the art community",
      "Consider graphic design or advertising",
      "Digital art skills are valuable"
    ],
    careerProspects: ["Artist", "Graphic Designer", "Art Director", "Art Teacher", "Curator"],
    backupCourses: ["Theatre Arts", "Mass Communication", "Architecture"]
  },

  // Music
  music: {
    category: "Arts & Humanities",
    targetScore: "180+",
    focusSubjects: ["English", "Music", "Literature"],
    tips: [
      "Strong musical training essential",
      "Consider music production and sound engineering",
      "Entertainment industry offers opportunities"
    ],
    careerProspects: ["Musician", "Music Producer", "Sound Engineer", "Music Teacher", "Composer"],
    backupCourses: ["Theatre Arts", "Mass Communication", "Fine Arts"]
  },

  // Religious Studies / CRS / IRS
  religiousStudies: {
    category: "Arts & Humanities",
    targetScore: "180+",
    focusSubjects: ["CRS/IRS", "English", "Government"],
    tips: [
      "Strong foundation in religious texts",
      "Consider teaching or religious leadership",
      "Counseling skills are valuable"
    ],
    careerProspects: ["Religious Leader", "Teacher", "Counselor", "Chaplain"],
    backupCourses: ["Philosophy", "Education", "Sociology"]
  },

  // Physics
  physics: {
    category: "Pure Sciences",
    targetScore: "240+",
    focusSubjects: ["Physics", "Mathematics", "Further Mathematics"],
    tips: [
      "Strong Mathematics foundation essential",
      "Research and academia are common paths",
      "Consider applied physics fields"
    ],
    careerProspects: ["Physicist", "Researcher", "Lecturer", "Medical Physicist", "Data Scientist"],
    backupCourses: ["Mathematics", "Computer Science", "Engineering"]
  },

  // Chemistry
  chemistry: {
    category: "Pure Sciences",
    targetScore: "230+",
    focusSubjects: ["Chemistry", "Mathematics", "Physics"],
    tips: [
      "Lab skills are essential",
      "Pharmaceutical and chemical industries offer jobs",
      "Consider industrial chemistry path"
    ],
    careerProspects: ["Chemist", "Quality Control Analyst", "Research Scientist", "Lab Manager"],
    backupCourses: ["Biochemistry", "Chemical Engineering", "Industrial Chemistry"]
  },

  // Industrial Chemistry
  industrialChemistry: {
    category: "Applied Sciences",
    targetScore: "230+",
    focusSubjects: ["Chemistry", "Mathematics", "Physics"],
    tips: [
      "Industry-focused chemistry applications",
      "Manufacturing sector offers opportunities",
      "Consider quality control specialization"
    ],
    careerProspects: ["Industrial Chemist", "Quality Control Manager", "Production Manager", "Research Scientist"],
    backupCourses: ["Chemistry", "Chemical Engineering", "Biochemistry"]
  },

  // Biology
  biology: {
    category: "Pure Sciences",
    targetScore: "220+",
    focusSubjects: ["Biology", "Chemistry", "Physics"],
    tips: [
      "Strong foundation for medical sciences",
      "Research and teaching are common paths",
      "Consider biotechnology field"
    ],
    careerProspects: ["Biologist", "Research Scientist", "Teacher", "Lab Technologist"],
    backupCourses: ["Microbiology", "Biochemistry", "Botany"]
  },

  // Mathematics
  mathematics: {
    category: "Pure Sciences",
    targetScore: "240+",
    focusSubjects: ["Mathematics", "Further Mathematics", "Physics"],
    tips: [
      "Strong analytical skills essential",
      "Data science is a lucrative path",
      "Consider actuarial science or finance"
    ],
    careerProspects: ["Mathematician", "Actuary", "Data Scientist", "Lecturer", "Financial Analyst"],
    backupCourses: ["Statistics", "Computer Science", "Economics"]
  },

  // Linguistics
  linguistics: {
    category: "Arts & Humanities",
    targetScore: "200+",
    focusSubjects: ["English", "Literature", "French/Yoruba/Igbo/Hausa"],
    tips: [
      "Language skills are essential",
      "Consider translation or interpretation",
      "NLP and AI fields are growing"
    ],
    careerProspects: ["Linguist", "Translator", "Interpreter", "Language Teacher", "NLP Specialist"],
    backupCourses: ["English", "Mass Communication", "Education"]
  },

  // French
  french: {
    category: "Languages",
    targetScore: "200+",
    focusSubjects: ["French", "English", "Literature"],
    tips: [
      "Fluency in French is essential",
      "Consider diplomatic or international careers",
      "Francophone countries offer opportunities"
    ],
    careerProspects: ["Translator", "Diplomat", "French Teacher", "International Organization Staff"],
    backupCourses: ["International Relations", "Linguistics", "Mass Communication"]
  },

  // Arabic
  arabic: {
    category: "Languages",
    targetScore: "200+",
    focusSubjects: ["Arabic", "English", "IRS"],
    tips: [
      "Arabic fluency opens Middle East opportunities",
      "Consider translation or teaching",
      "Islamic studies combine well"
    ],
    careerProspects: ["Translator", "Arabic Teacher", "Diplomat", "Islamic Scholar"],
    backupCourses: ["Islamic Studies", "International Relations", "Linguistics"]
  },

  // Nursing Science
  nursingScience: {
    category: "Medical Sciences",
    targetScore: "240+",
    focusSubjects: ["Biology", "Chemistry", "English"],
    tips: [
      "Strong science foundation essential",
      "Compassion and care are key",
      "Specializations offer career advancement",
      "International nursing opportunities exist"
    ],
    careerProspects: ["Registered Nurse", "Nurse Educator", "Clinical Nurse Specialist", "Nurse Administrator"],
    backupCourses: ["Medical Laboratory Science", "Public Health", "Physiotherapy"]
  },

  // Public Health
  publicHealth: {
    category: "Medical Sciences",
    targetScore: "220+",
    focusSubjects: ["Biology", "Chemistry", "English"],
    tips: [
      "Understanding of community health essential",
      "NGOs and government agencies employ",
      "Epidemiology is a growing field"
    ],
    careerProspects: ["Public Health Officer", "Epidemiologist", "Health Educator", "Program Manager"],
    backupCourses: ["Nursing", "Community Health", "Medical Laboratory Science"]
  },

  // Human Resource Management
  humanResourceManagement: {
    category: "Business",
    targetScore: "200+",
    focusSubjects: ["Economics", "English", "Government"],
    tips: [
      "People skills are essential",
      "CIPM certification is valuable",
      "Every organization needs HR"
    ],
    careerProspects: ["HR Manager", "Recruitment Specialist", "Training Manager", "HR Consultant"],
    backupCourses: ["Business Administration", "Psychology", "Sociology"]
  },

  // Entrepreneurship
  entrepreneurship: {
    category: "Business",
    targetScore: "200+",
    focusSubjects: ["Economics", "Commerce", "Mathematics"],
    tips: [
      "Business acumen is key",
      "Start small businesses while studying",
      "Networking is essential",
      "Consider tech entrepreneurship"
    ],
    careerProspects: ["Entrepreneur", "Business Consultant", "Startup Founder", "Business Development Manager"],
    backupCourses: ["Business Administration", "Marketing", "Economics"]
  },

  // Surveying & Geoinformatics
  surveyingGeoinformatics: {
    category: "Environmental Sciences",
    targetScore: "230+",
    focusSubjects: ["Mathematics", "Physics", "Geography"],
    tips: [
      "GIS and mapping technology skills essential",
      "Land surveying is in demand",
      "Consider drone mapping technology"
    ],
    careerProspects: ["Land Surveyor", "GIS Specialist", "Cartographer", "Geospatial Analyst"],
    backupCourses: ["Geography", "Urban Planning", "Estate Management"]
  },

  // Building Technology
  buildingTechnology: {
    category: "Environmental Sciences",
    targetScore: "220+",
    focusSubjects: ["Physics", "Mathematics", "Technical Drawing"],
    tips: [
      "Construction industry knowledge essential",
      "Project management skills valuable",
      "Consider green building technology"
    ],
    careerProspects: ["Building Technologist", "Site Manager", "Construction Manager", "Facility Manager"],
    backupCourses: ["Civil Engineering", "Architecture", "Quantity Surveying"]
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
  
  // Medical Sciences (order matters - more specific first)
  if (name.includes('dental') || name.includes('dentistry')) return 'dentistry';
  if (name.includes('veterinary') || name.includes('vet med')) return 'veterinaryMedicine';
  if (name.includes('optometry') || name.includes('ophthal')) return 'optometry';
  if (name.includes('medicine') || name.includes('surgery') || name.includes('mbbs')) return 'medicine';
  if (name.includes('pharmacy') || name.includes('pharmaceutical')) return 'pharmacy';
  if (name.includes('nursing science') || name.includes('nursing')) return 'nursingScience';
  if (name.includes('midwifery')) return 'nursing';
  if (name.includes('physiotherapy') || name.includes('physical therapy')) return 'physiotherapy';
  if (name.includes('radiography') || name.includes('radiology')) return 'radiography';
  if (name.includes('anatomy')) return 'anatomy';
  if (name.includes('medical lab') || name.includes('medical laboratory')) return 'medLabScience';
  if (name.includes('public health') || name.includes('community health')) return 'publicHealth';
  
  // Engineering (specific first, then general)
  if (name.includes('petroleum') && name.includes('engineer')) return 'petroleumEngineering';
  if (name.includes('chemical') && name.includes('engineer')) return 'chemicalEngineering';
  if (name.includes('electrical') && name.includes('engineer')) return 'electricalEngineering';
  if (name.includes('mechanical') && name.includes('engineer')) return 'mechanicalEngineering';
  if (name.includes('civil') && name.includes('engineer')) return 'civilEngineering';
  if (name.includes('marine') && name.includes('engineer')) return 'marineEngineering';
  if (name.includes('computer') && name.includes('engineer')) return 'computerEngineering';
  if (name.includes('engineering') && !name.includes('software')) return 'engineering';
  
  // Technology
  if (name.includes('cyber') || name.includes('security') || name.includes('cybersecurity')) return 'cyberSecurity';
  if (name.includes('software engineering') || name.includes('software development')) return 'softwareEngineering';
  if (name.includes('information technology') || name.includes('it ')) return 'informationTechnology';
  if (name.includes('computer') || name.includes('software')) return 'computerScience';
  
  // Law
  if (name.includes('law') || name.includes('jurisprudence')) return 'law';
  
  // Business & Management
  if (name.includes('accounting') || name.includes('accountancy')) return 'accounting';
  if (name.includes('banking') || name.includes('finance')) return 'bankingFinance';
  if (name.includes('business admin') || name.includes('business management')) return 'businessAdmin';
  if (name.includes('marketing')) return 'marketing';
  if (name.includes('insurance') || name.includes('actuarial')) return 'insurance';
  if (name.includes('hospitality') || name.includes('hotel')) return 'hospitalityManagement';
  if (name.includes('tourism') || name.includes('travel')) return 'tourism';
  if (name.includes('human resource') || name.includes('personnel')) return 'humanResourceManagement';
  if (name.includes('entrepreneurship') || name.includes('entrepreneurial')) return 'entrepreneurship';
  if (name.includes('economics')) return 'economics';
  
  // Social Sciences
  if (name.includes('mass comm') || name.includes('journalism') || name.includes('media')) return 'massCommunication';
  if (name.includes('international relation')) return 'internationalRelations';
  if (name.includes('political science') || name.includes('politics')) return 'politicalScience';
  if (name.includes('public admin')) return 'publicAdministration';
  if (name.includes('psychology')) return 'psychology';
  if (name.includes('sociology') || name.includes('social work')) return 'sociology';
  if (name.includes('geography')) return 'geography';
  
  // Environmental Sciences
  if (name.includes('architecture') || name.includes('architectural')) return 'architecture';
  if (name.includes('estate') || name.includes('property')) return 'estateManagement';
  if (name.includes('quantity survey')) return 'quantitySurveying';
  if (name.includes('building') || name.includes('construction')) return 'buildingTechnology';
  if (name.includes('surveying') || name.includes('geoinformatics')) return 'surveyingGeoinformatics';
  if (name.includes('urban') || name.includes('planning') || name.includes('town')) return 'urbanPlanning';
  if (name.includes('environmental science') || name.includes('environmental manage')) return 'environmentalScience';
  
  // Pure Sciences
  if (name.includes('food science') || name.includes('food tech')) return 'foodScience';
  if (name.includes('industrial chemistry')) return 'industrialChemistry';
  if (name.includes('biochemistry')) return 'biochemistry';
  if (name.includes('microbiology')) return 'microbiology';
  if (name.includes('statistics')) return 'statistics';
  if (name.includes('geology') || name.includes('geoscience')) return 'geology';
  if (name.includes('physics')) return 'physics';
  if (name.includes('chemistry')) return 'chemistry';
  if (name.includes('biology') || name.includes('botany') || name.includes('zoology')) return 'biology';
  if (name.includes('mathematics') || name.includes('maths')) return 'mathematics';
  
  // Agriculture
  if (name.includes('agricult') || name.includes('agric') || name.includes('animal science') || 
      name.includes('crop') || name.includes('fishery') || name.includes('forestry')) return 'agriculture';
  
  // Languages
  if (name.includes('french')) return 'french';
  if (name.includes('arabic')) return 'arabic';
  if (name.includes('linguistics') || name.includes('language')) return 'linguistics';
  
  // Arts & Humanities
  if (name.includes('theatre') || name.includes('drama') || name.includes('creative art')) return 'theatreArts';
  if (name.includes('fine art') || name.includes('visual art') || name.includes('painting')) return 'fineArts';
  if (name.includes('music')) return 'music';
  if (name.includes('library') || name.includes('information science')) return 'libraryScience';
  if (name.includes('history') || name.includes('archaeology')) return 'history';
  if (name.includes('philosophy')) return 'philosophy';
  if (name.includes('religious') || name.includes('christian') || name.includes('islamic')) return 'religiousStudies';
  if (name.includes('english') || name.includes('literature')) return 'arts';
  
  // Education
  if (name.includes('education') || name.includes('teaching')) return 'education';
  
  return 'default';
};

export const getCourseTip = (courseName: string): CourseTip => {
  const category = getCourseCategory(courseName);
  return courseTips[category] || courseTips.default;
};
