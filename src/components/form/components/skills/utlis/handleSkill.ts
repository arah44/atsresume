import { Resume } from "@/types";
import React from "react";

export const handleSkill = (
  e: React.ChangeEvent<HTMLInputElement>,
  index: number,
  title: string,
  resumeData: Resume,
  setResumeData: (resume: Resume | ((prev: Resume) => Resume)) => void
): void => {
  const skillType = resumeData.skills.find((s) => s.title === title);
  if (!skillType) return;

  const newSkills = [...skillType.skills];
  newSkills[index] = e.target.value;

  setResumeData((prevData) => ({
    ...prevData,
    skills: prevData.skills.map((skill) =>
      skill.title === title ? { ...skill, skills: newSkills } : skill
    ),
  }));
};

