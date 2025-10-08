"use client";

import React from "react";
import { useResumeContext } from "@/context/ResumeContext";
import { addWorkExperience } from "../units/addWorkExperience";
import WorkExperience from "../components/WorkExperience";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const WorkExperiences: React.FC = () => {
  const { resumeData, setResumeData } = useResumeContext();

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>Work Experience</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {resumeData.workExperience.map((workExperience, index) => (
          <WorkExperience
            key={index}
            workExperience={workExperience}
            index={index}
          />
        ))}
        <Button
          type="button"
          onClick={() => addWorkExperience(resumeData, setResumeData)}
          aria-label="Add Work Experience"
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Work Experience
        </Button>
      </CardContent>
    </Card>
  );
};

export default WorkExperiences;

