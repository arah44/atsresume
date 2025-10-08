"use client";

import React from "react";
import { handleSocialMedia } from "../units/handleSocialMedia";
import { useResumeContext } from "@/context/ResumeContext";
import { removeSocialMedia } from "../units/removeSocialMedia";
import { SocialMediaLink } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface SocialMediaProps {
  socialMedia: SocialMediaLink;
  index: number;
}

const SocialMedia: React.FC<SocialMediaProps> = ({ socialMedia, index }) => {
  const { resumeData, setResumeData } = useResumeContext();

  return (
    <div className="flex w-full gap-4 items-start p-4 border rounded-lg">
      <div className="flex-1 space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`socialMedia-${index}`}>Social Media Platform</Label>
          <Input
            id={`socialMedia-${index}`}
            type="text"
            placeholder="Social Media"
            name="socialMedia"
            value={socialMedia.socialMedia}
            onChange={(e) =>
              handleSocialMedia(resumeData, setResumeData, e, index)
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`link-${index}`}>Link</Label>
          <Input
            id={`link-${index}`}
            type="text"
            placeholder="Link"
            name="link"
            value={socialMedia.link}
            onChange={(e) =>
              handleSocialMedia(resumeData, setResumeData, e, index)
            }
          />
        </div>
      </div>
      <Button
        type="button"
        variant="destructive"
        size="icon"
        onClick={() => removeSocialMedia(resumeData, setResumeData, index)}
        aria-label="Remove"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default SocialMedia;

