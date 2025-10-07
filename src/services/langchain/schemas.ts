import { z } from "zod";

// Schema for job analysis output
export const jobAnalysisSchema = z.object({
  technicalSkills: z.array(z.string()).describe("Required technical skills from the job posting"),
  softSkills: z.array(z.string()).describe("Required soft skills from the job posting"),
  keyResponsibilities: z.array(z.string()).describe("Key responsibilities mentioned in the job"),
  preferredQualifications: z.array(z.string()).describe("Preferred qualifications"),
  companyCulture: z.array(z.string()).describe("Company culture indicators"),
  industryTerms: z.array(z.string()).describe("Industry-specific terminology"),
  actionVerbs: z.array(z.string()).describe("Action verbs commonly used in the job posting")
});

export type JobAnalysis = z.infer<typeof jobAnalysisSchema>;

// Schema for keyword extraction
export const keywordsSchema = z.array(z.string()).describe("ATS-relevant keywords extracted from job posting");

export type Keywords = z.infer<typeof keywordsSchema>;

// Schema for work experience
export const workExperienceSchema = z.object({
  company: z.string().describe("Company name"),
  position: z.string().describe("Job position/title"),
  description: z.string().describe("Detailed description of role and responsibilities (3-5 sentences minimum)"),
  keyAchievements: z.string().describe("Quantifiable achievements with metrics (3-5 specific achievements)"),
  startYear: z.string().describe("Start date (YYYY or MM/YYYY format)"),
  endYear: z.string().describe("End date (YYYY, MM/YYYY, or 'Present')")
});

export type WorkExperience = z.infer<typeof workExperienceSchema>;

// Schema for education
export const educationSchema = z.object({
  school: z.string().describe("School/University name"),
  degree: z.string().describe("Degree and field of study"),
  startYear: z.string().describe("Start year (YYYY)"),
  endYear: z.string().describe("End year (YYYY or 'Present')")
});

export type Education = z.infer<typeof educationSchema>;

// Schema for project
export const projectSchema = z.object({
  name: z.string().describe("Project name"),
  description: z.string().describe("Project description"),
  technologies: z.array(z.string()).describe("Technologies/tools used"),
  startYear: z.string().describe("Start year (YYYY)"),
  endYear: z.string().describe("End year (YYYY or 'Present')"),
  link: z.string().optional().describe("Project link/URL if available")
});

export type Project = z.infer<typeof projectSchema>;

// Schema for skill category
export const skillCategorySchema = z.object({
  title: z.string().describe("Category title (e.g., 'Technical Skills', 'Frameworks & Libraries')"),
  skills: z.array(z.string()).min(3).describe("Array of skills in this category (minimum 3)")
});

export type SkillCategory = z.infer<typeof skillCategorySchema>;

// Schema for skills optimization output
export const skillsOptimizationSchema = z.array(skillCategorySchema)
  .min(2)
  .describe("Array of skill categories with at least 2 categories");

export type SkillsOptimization = z.infer<typeof skillsOptimizationSchema>;

// Schema for social media
export const socialMediaSchema = z.object({
  socialMedia: z.string().describe("Platform name (e.g., LinkedIn, GitHub, Twitter)"),
  link: z.string().describe("Profile URL")
});

export type SocialMedia = z.infer<typeof socialMediaSchema>;

// Schema for complete resume - matches Resume interface from types/index.ts
export const resumeSchema = z.object({
  name: z.string().describe("Person's full name"),
  position: z.string().describe("Target job title/position"),
  contactInformation: z.string().describe("Phone number"),
  email: z.string().describe("Email address"),
  address: z.string().describe("Location/address"),
  profilePicture: z.string().describe("Profile picture URL (use empty string if none)"),
  socialMedia: z.array(socialMediaSchema).describe("Array of social media links"),
  summary: z.string().describe("Professional summary (3-4 sentences, ATS-optimized)"),
  workExperience: z.array(workExperienceSchema).describe("Array of work experience entries"),
  education: z.array(educationSchema).describe("Array of education entries"),
  projects: z.array(projectSchema).describe("Array of project entries"),
  skills: z.array(skillCategorySchema).describe("Array of skill categories"),
  languages: z.array(z.string()).describe("Array of languages"),
  certifications: z.array(z.string()).describe("Array of certifications")
});

export type ResumeOutput = z.infer<typeof resumeSchema>;

// Schema for base resume generation from profile (not job-specific)
// This is used when converting a Person's raw_content into a structured base resume
export const profileToBaseResumeSchema = z.object({
  name: z.string().describe("Person's full name"),
  position: z.string().describe("Most recent or primary job title/position"),
  contactInformation: z.string().describe("Phone number (extract from profile or use empty string)"),
  email: z.string().describe("Email address (extract from profile or use empty string)"),
  address: z.string().describe("Location/address (extract from profile or use empty string)"),
  profilePicture: z.string().describe("Profile picture URL (use empty string if none)"),
  socialMedia: z.array(socialMediaSchema).describe("Array of social media links (GitHub, LinkedIn, etc.)"),
  summary: z.string().describe("General professional summary (3-4 sentences covering background and expertise)"),
  workExperience: z.array(workExperienceSchema).min(1).describe("Array of work experience entries (minimum 1)"),
  education: z.array(educationSchema).describe("Array of education entries"),
  projects: z.array(projectSchema).describe("Array of project entries"),
  skills: z.array(skillCategorySchema).min(2).describe("Array of skill categories (minimum 2)"),
  languages: z.array(z.string()).describe("Array of languages"),
  certifications: z.array(z.string()).describe("Array of certifications")
});

export type ProfileToBaseResume = z.infer<typeof profileToBaseResumeSchema>;

