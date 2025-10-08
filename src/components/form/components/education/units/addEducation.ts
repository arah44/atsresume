import { Resume } from "@/types";

export const addEducation = (
  resumeData: Resume,
  setResumeData: (resume: Resume) => void
): void => {
  setResumeData({
    ...resumeData,
    education: [
      ...resumeData.education,
      { school: "", degree: "", startYear: "", endYear: "" },
    ],
  });
};

