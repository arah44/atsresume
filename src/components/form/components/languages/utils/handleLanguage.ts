import { Resume } from "@/types";
import React from "react";

export const handleLanguage = (
  resumeData: Resume,
  setResumeData: (resume: Resume) => void,
  e: React.ChangeEvent<HTMLInputElement>,
  index: number,
  languageType: keyof Resume
): void => {
  const newLanguages = [...(resumeData[languageType] as string[])];
  newLanguages[index] = e.target.value;
  setResumeData({ ...resumeData, [languageType]: newLanguages });
};

