import { Resume } from "@/types";
import React from "react";

export const handleSocialMedia = (
  resumeData: Resume,
  setResumeData: (resume: Resume) => void,
  e: React.ChangeEvent<HTMLInputElement>,
  index: number
): void => {
  const newSocialMedia = [...resumeData.socialMedia];
  newSocialMedia[index] = {
    ...newSocialMedia[index],
    [e.target.name]: e.target.value.replace("https://", ""),
  };
  setResumeData({ ...resumeData, socialMedia: newSocialMedia });
};

