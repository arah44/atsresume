import { Resume } from "@/types";

export const removeLanguage = (
  resumeData: Resume,
  setResumeData: (resume: Resume) => void,
  index: number
): void => {
  const newLanguages = [...resumeData.languages].filter((_, idx) => idx !== index);
  setResumeData({ ...resumeData, languages: newLanguages });
};

