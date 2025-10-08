import { Resume } from "@/types";

export const removeSocialMedia = (
  resumeData: Resume,
  setResumeData: (resume: Resume) => void,
  index: number
): void => {
  const newSocialMedia = [...resumeData.socialMedia].filter(
    (_, idx) => idx !== index
  );
  setResumeData({ ...resumeData, socialMedia: newSocialMedia });
};

