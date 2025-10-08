import { Resume } from "@/types";
import React from "react";

export const handleProject = (
  resumeData: Resume,
  setResumeData: (resume: Resume) => void,
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  index: number
): void => {
  const newProjects = [...resumeData.projects];
  newProjects[index] = {
    ...newProjects[index],
    [e.target.name]: e.target.value,
  };
  setResumeData({ ...resumeData, projects: newProjects });
};

