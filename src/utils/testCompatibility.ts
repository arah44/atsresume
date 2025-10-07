// Test utility to verify backward compatibility
import { mergePersonAndTargetJob, extractPersonFromResume } from './dataTransformation';
import { Person, TargetJobJson, Resume } from '../types';
import DefaultResumeData from '../components/utility/DefaultResumeData';

// Test data
const testPerson: Person = {
  personalInfo: {
    name: "John Doe",
    email: "john@example.com",
    phone: "+1234567890",
    address: "New York, NY",
    profilePicture: ""
  },
  socialMedia: [
    {
      socialMedia: "LinkedIn",
      link: "linkedin.com/in/johndoe"
    }
  ],
  summary: "Experienced software engineer with 5 years of experience",
  education: [
    {
      school: "University of Example",
      degree: "Bachelor of Computer Science",
      startYear: "2018-09-01",
      endYear: "2022-05-01"
    }
  ],
  workExperience: [
    {
      company: "Tech Corp",
      position: "Senior Developer",
      description: "Led development team",
      keyAchievements: "Improved performance by 50%",
      startYear: "2020-01-01",
      endYear: "2023-12-31"
    }
  ],
  projects: [],
  skills: [
    {
      title: "Technical Skills",
      skills: ["JavaScript", "React", "Node.js"]
    }
  ],
  languages: ["English", "Spanish"],
  certifications: ["AWS Certified Developer"]
};

const testTargetJob: TargetJobJson = {
  name: "Software Engineer",
  url: "https://example.com/jobs/software-engineer",
  company: "Tech Corp",
  description: "We are looking for a software engineer to join our team...",
  raw_content: "Full job posting content here..."
};

export const testBackwardCompatibility = (): boolean => {
  try {
    console.log('Testing backward compatibility...');
    
    // Test 1: Merge Person + TargetJob to Resume
    const mergedResume = mergePersonAndTargetJob(testPerson, testTargetJob);
    console.log('✅ Person + TargetJob merged to Resume successfully');
    
    // Test 2: Extract Person from Resume
    const extractedPerson = extractPersonFromResume(mergedResume);
    console.log('✅ Resume split to Person successfully');
    
    // Test 3: Verify data integrity
    if (extractedPerson.personalInfo.name !== testPerson.personalInfo.name) {
      throw new Error('Person name mismatch');
    }
    if (mergedResume.targetPosition !== testTargetJob.name) {
      throw new Error('Target position mismatch');
    }
    console.log('✅ Data integrity verified');
    
    // Test 4: Test with default resume data
    const defaultResume = DefaultResumeData as Resume;
    const defaultPerson = extractPersonFromResume(defaultResume);
    console.log('✅ Default resume data split successfully');
    
    // Test 5: Round-trip conversion
    const roundTripResume = mergePersonAndTargetJob(defaultPerson, testTargetJob);
    console.log('✅ Round-trip conversion successful');
    
    console.log('🎉 All backward compatibility tests passed!');
    return true;
  } catch (error) {
    console.error('❌ Backward compatibility test failed:', error);
    return false;
  }
};

// Run tests if in development
if (process.env.NODE_ENV === 'development') {
  testBackwardCompatibility();
}