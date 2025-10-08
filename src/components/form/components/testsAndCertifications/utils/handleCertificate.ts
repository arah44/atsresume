import { Resume } from "@/types";
import React from "react";

export const handleCertificate = (
  resumeData: Resume,
  setResumeData: (resume: Resume) => void,
  e: React.ChangeEvent<HTMLInputElement>,
  index: number
): void => {
  const newCertifications = [...resumeData.certifications];
  newCertifications[index] = e.target.value;
  setResumeData({ ...resumeData, certifications: newCertifications });
};

