"use client";

import React from "react";
import { useResumeContext } from "@/context/ResumeContext";
import { addEducation } from "../units/addEducation";
import Education from "../components/Education";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const Educations: React.FC = () => {
  const { resumeData, setResumeData } = useResumeContext();

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>Education</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {resumeData.education.map((education, index) => (
          <Education key={index} education={education} index={index} />
        ))}
        <Button
          type="button"
          onClick={() => addEducation(resumeData, setResumeData)}
          aria-label="Add Education"
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Education
        </Button>
      </CardContent>
    </Card>
  );
};

export default Educations;

