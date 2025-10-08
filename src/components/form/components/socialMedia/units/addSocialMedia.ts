import { Resume } from "@/types";

export const addSocialMedia = (
  resumeData: Resume,
  setResumeData: (resume: Resume) => void
): void => {
  setResumeData({
    ...resumeData,
    socialMedia: [...resumeData.socialMedia, { socialMedia: "", link: "" }],
  });
};

