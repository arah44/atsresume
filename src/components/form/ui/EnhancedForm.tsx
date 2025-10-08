"use client";

import React from "react";
import PersonalInformation from "../components/PersonalInformation";
import SocialMedias from "../components/socialMedia/ui/SocialMedias";
import Summary from "../components/Summary";
import Educations from "../components/education/ui/Educations";
import WorkExperiences from "../components/workExperience/ui/WorkExperiences";
import Projects from "../components/projects/ui/Projects";
import Skills from "../components/skills/ui/Skills";
import Languages from "../components/languages/ui/Languages";
import TestsAndCertifications from "../components/testsAndCertifications/ui/TestsAndCertifications";

const EnhancedForm: React.FC = () => {
  return (
    <div className="enhanced-form p-6 exclude-print md:max-w-[40%] md:h-screen md:overflow-y-scroll space-y-4">
      <PersonalInformation />
      <SocialMedias />
      <Summary />
      <Educations />
      <WorkExperiences />
      <Projects />
      <Skills />
      <Languages />
      <TestsAndCertifications />
    </div>
  );
};

export default EnhancedForm;