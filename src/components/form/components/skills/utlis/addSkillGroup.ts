import { Resume } from "@/types";

export const addSkillGroup = (
  setResumeData: (resume: Resume | ((prev: Resume) => Resume)) => void
): void => {
  setResumeData((prevData) => {
    const newSkillGroup = {
      title: "New Skill Group",
      skills: [""]
    };

    return {
      ...prevData,
      skills: [...prevData.skills, newSkillGroup],
    };
  });
};
