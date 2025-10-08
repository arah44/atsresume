import { Resume } from "@/types";

export const removeProject = (
  resumeData: Resume,
  setResumeData: (resume: Resume) => void,
  index: number
): void => {
  const newProjects = [...resumeData.projects].filter((_, idx) => idx !== index);
  setResumeData({ ...resumeData, projects: newProjects });
};

