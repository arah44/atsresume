import { Resume } from "@/types";

export const removeCertificate = (
  resumeData: Resume,
  setResumeData: (resume: Resume) => void,
  index: number
): void => {
  const newCertifications = [...resumeData.certifications].filter(
    (_, idx) => idx !== index
  );
  setResumeData({ ...resumeData, certifications: newCertifications });
};

