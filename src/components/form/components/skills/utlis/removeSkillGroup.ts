import { Resume } from "@/types";

export const removeSkillGroup = (
  title: string,
  setResumeData: (resume: Resume | ((prev: Resume) => Resume)) => void
): void => {
  setResumeData((prevData) => {
    return {
      ...prevData,
      skills: prevData.skills.filter((skill) => skill.title !== title),
    };
  });
};
