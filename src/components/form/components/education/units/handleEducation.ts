import { Resume } from "@/types";
import React from "react";

export const handleEducation = (
  resumeData: Resume,
  setResumeData: (resume: Resume) => void,
  e: React.ChangeEvent<HTMLInputElement>,
  index: number
): void => {
  const newEducation = [...resumeData.education];
  newEducation[index] = {
    ...newEducation[index],
    [e.target.name]: e.target.value,
  };
  setResumeData({ ...resumeData, education: newEducation });
};

