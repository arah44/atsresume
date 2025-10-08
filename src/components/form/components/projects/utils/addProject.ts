import { Resume } from "@/types";

export const addProject = (
  resumeData: Resume,
  setResumeData: (resume: Resume) => void
): void => {
  const emptyProject = {
    name: "",
    link: "",
    description: "",
    technologies: [],
    startYear: "",
    endYear: "",
  };

  const newProjects = resumeData.projects ? [...resumeData.projects] : [];
  newProjects.push(emptyProject);

  setResumeData({
    ...resumeData,
    projects: newProjects,
  });
};

