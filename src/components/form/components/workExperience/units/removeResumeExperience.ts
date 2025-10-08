import { Resume } from "@/types";

export const removeWorkExperience = (
  resumeData: Resume,
  setResumeData: (resume: Resume) => void,
  index: number
): void => {
  const newWorkExperience = [...resumeData.workExperience].filter(
    (_, idx) => idx !== index
  );
  setResumeData({ ...resumeData, workExperience: newWorkExperience });
};

