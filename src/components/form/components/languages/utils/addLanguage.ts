import { Resume } from "@/types";

export const addLanguage = (
  resumeData: Resume,
  setResumeData: (resume: Resume) => void,
  languageType: keyof Resume
): void => {
  setResumeData({
    ...resumeData,
    [languageType]: [...(resumeData[languageType] as string[]), ""],
  });
};

