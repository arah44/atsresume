import { Resume } from "@/types";

export const addWorkExperience = (
  resumeData: Resume,
  setResumeData: (resume: Resume) => void
): void => {
  setResumeData({
    ...resumeData,
    workExperience: [
      ...resumeData.workExperience,
      {
        company: "",
        position: "",
        description: "",
        keyAchievements: "",
        startYear: "",
        endYear: "",
      },
    ],
  });
};

