import { Resume } from "@/types";

export const addCertificate = (
  resumeData: Resume,
  setResumeData: (resume: Resume) => void
): void => {
  setResumeData({
    ...resumeData,
    certifications: [...resumeData.certifications, ""],
  });
};

