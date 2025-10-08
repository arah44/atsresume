import { Resume } from "@/types";

export const addSkill = (
  title: string,
  setResumeData: (resume: Resume | ((prev: Resume) => Resume)) => void
): void => {
  setResumeData((prevData) => {
    const skillType = prevData.skills.find((s) => s.title === title);
    if (!skillType) return prevData;

    const newSkills = [...skillType.skills, ""];
    const updatedSkills = prevData.skills.map((skill) =>
      skill.title === title ? { ...skill, skills: newSkills } : skill
    );
    return {
      ...prevData,
      skills: updatedSkills,
    };
  });
};

