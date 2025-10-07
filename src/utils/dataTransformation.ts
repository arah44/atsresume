import { Person, TargetJobJson, Resume } from '../types';

// Convert Person + TargetJob to Resume format (for fallback generation)
export const createBasicResume = (personData: Person, targetJob: TargetJobJson): Resume => {
  return {
    name: personData.name,
    position: targetJob.name,
    contactInformation: '',
    email: '',
    address: '',
    profilePicture: '',
    socialMedia: [],
    summary: '',
    workExperience: [],
    education: [],
    projects: [],
    skills: [],
    languages: [],
    certifications: [],
    optimizedSummary: '',
    atsKeywords: [],
    achievements: [],
    targetPosition: targetJob.name
  };
};

// Convert Resume to Person format (for editing)
export const extractPersonFromResume = (resume: Resume): Person => {
  return {
    name: resume.name,
    raw_content: `Name: ${resume.name}
Position: ${resume.position}
Email: ${resume.email}
Phone: ${resume.contactInformation}
Address: ${resume.address}

Summary: ${resume.summary}

Work Experience:
${resume.workExperience.map(exp => `- ${exp.position} at ${exp.company} (${exp.startYear}-${exp.endYear})`).join('\n')}

Education:
${resume.education.map(edu => `- ${edu.degree} from ${edu.school} (${edu.startYear}-${edu.endYear})`).join('\n')}

Skills:
${resume.skills.map(skill => `- ${skill.title}: ${skill.skills.join(', ')}`).join('\n')}

Languages: ${resume.languages.join(', ')}
Certifications: ${resume.certifications.join(', ')}`
  };
};

// Validate Person data structure
export const validatePersonData = (personData: any): personData is Person => {
  return (
    personData &&
    typeof personData.name === 'string' &&
    typeof personData.raw_content === 'string' &&
    personData.name.length > 0 &&
    personData.raw_content.length > 10
  );
};

// Validate TargetJob data structure
export const validateTargetJobData = (targetJobData: any): targetJobData is TargetJobJson => {
  return (
    targetJobData &&
    typeof targetJobData.name === 'string' &&
    typeof targetJobData.url === 'string' &&
    typeof targetJobData.company === 'string' &&
    typeof targetJobData.description === 'string' &&
    typeof targetJobData.raw_content === 'string'
  );
};

// Validate Resume data structure
export const validateResumeData = (resumeData: any): resumeData is Resume => {
  return (
    resumeData &&
    typeof resumeData.name === 'string' &&
    typeof resumeData.position === 'string' &&
    typeof resumeData.contactInformation === 'string' &&
    typeof resumeData.email === 'string' &&
    typeof resumeData.address === 'string' &&
    Array.isArray(resumeData.socialMedia) &&
    typeof resumeData.summary === 'string' &&
    Array.isArray(resumeData.education) &&
    Array.isArray(resumeData.workExperience) &&
    Array.isArray(resumeData.projects) &&
    Array.isArray(resumeData.skills) &&
    Array.isArray(resumeData.languages) &&
    Array.isArray(resumeData.certifications)
  );
};

// Create default Person data
export const createDefaultPerson = (): Person => ({
  name: '',
  raw_content: ''
});

// Create default TargetJob data
export const createDefaultTargetJob = (): TargetJobJson => ({
  name: '',
  url: '',
  company: '',
  description: '',
  raw_content: ''
});

// Extract person background for AI prompts
export const extractPersonBackground = (person: Person): string => {
  const education = person.education.length > 0 ? person.education[0].degree : 'No education specified';
  const experience = person.workExperience?.length || 0;
  return `${person.personalInfo.name} - ${education} - ${experience} years experience`;
};

// Extract job requirements for AI prompts
export const extractJobRequirements = (targetJob: TargetJobJson): string => {
  return `${targetJob.name} at ${targetJob.company}. Description: ${targetJob.description}`;
};

// Format skills for AI prompts
export const formatSkillsForPrompt = (skills: any[]): string => {
  return skills.map(category => 
    `${category.title}: ${category.skills.join(', ')}`
  ).join('\n');
};

// Format work experience for AI prompts
export const formatExperienceForPrompt = (experience: any[]): string => {
  return experience.map(exp => 
    `${exp.position} at ${exp.company}: ${exp.keyAchievements}`
  ).join('\n');
};