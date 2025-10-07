import React from 'react';
import { useResumeContext } from "../../../../../context/ResumeContext";
import SkillsGroup from "../components/SkillsGroup";

const Skills = () => {
  const {resumeData, setResumeData} = useResumeContext();

  return (
    <div>
      {
        resumeData.skills.map((skill, index) => (
          <SkillsGroup
            title={skill.title}
            key={index}
          />
        ))
      }
    </div>
  );
};

export default Skills;
