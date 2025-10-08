import { Resume } from "@/types";

export const removeEducation = (
  resumeData: Resume,
  setResumeData: (resume: Resume) => void,
  index: number
): void => {
  const newEducation = [...resumeData.education].filter((_, idx) => idx !== index);
  setResumeData({ ...resumeData, education: newEducation });
};

