import { Resume } from "@/types";
import React from "react";

export const handleWorkExperience = (
  resumeData: Resume,
  setResumeData: (resume: Resume) => void,
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  index: number
): void => {
  const newWorkExperience = [...resumeData.workExperience];
  newWorkExperience[index] = {
    ...newWorkExperience[index],
    [e.target.name]: e.target.value,
  };
  setResumeData({ ...resumeData, workExperience: newWorkExperience });
};

