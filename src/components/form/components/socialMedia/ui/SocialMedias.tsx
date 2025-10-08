"use client";

import React from "react";
import { useResumeContext } from "@/context/ResumeContext";
import { addSocialMedia } from "../units/addSocialMedia";
import SocialMedia from "../components/SocialMedia";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const SocialMedias: React.FC = () => {
  const { resumeData, setResumeData } = useResumeContext();

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>Social Media</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {resumeData.socialMedia.map((socialMedia, index) => (
          <SocialMedia key={index} socialMedia={socialMedia} index={index} />
        ))}
        <Button
          type="button"
          onClick={() => addSocialMedia(resumeData, setResumeData)}
          aria-label="Add Social Media"
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Social Media
        </Button>
      </CardContent>
    </Card>
  );
};

export default SocialMedias;

