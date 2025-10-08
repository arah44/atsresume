import { Resume } from "@/types";

export const updateSkillGroupTitle = (
  oldTitle: string,
  newTitle: string,
  setResumeData: (resume: Resume | ((prev: Resume) => Resume)) => void
): void => {
  setResumeData((prevData) => {
    return {
      ...prevData,
      skills: prevData.skills.map((skill) =>
        skill.title === oldTitle ? { ...skill, title: newTitle } : skill
      ),
    };
  });
};
