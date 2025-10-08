"use client";

import React from "react";
import { handleEducation } from "../units/handleEducation";
import { useResumeContext } from "@/context/ResumeContext";
import { removeEducation } from "../units/removeEducation";
import { Education as EducationType } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface EducationProps {
  education: EducationType;
  index: number;
}

const Education: React.FC<EducationProps> = ({ education, index }) => {
  const { resumeData, setResumeData } = useResumeContext();

  return (
    <div className="flex w-full gap-4 items-start p-4 border rounded-lg">
      <div className="flex-1 space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`school-${index}`}>School</Label>
          <Input
            id={`school-${index}`}
            type="text"
            placeholder="School"
            name="school"
            value={education.school}
            onChange={(e) => handleEducation(resumeData, setResumeData, e, index)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`degree-${index}`}>Degree</Label>
          <Input
            id={`degree-${index}`}
            type="text"
            placeholder="Degree"
            name="degree"
            value={education.degree}
            onChange={(e) => handleEducation(resumeData, setResumeData, e, index)}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`startYear-${index}`}>Start Date</Label>
            <Input
              id={`startYear-${index}`}
              type="date"
              placeholder="Start Year"
              name="startYear"
              value={education.startYear}
              onChange={(e) => handleEducation(resumeData, setResumeData, e, index)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`endYear-${index}`}>End Date</Label>
            <Input
              id={`endYear-${index}`}
              type="date"
              placeholder="End Year"
              name="endYear"
              value={education.endYear}
              onChange={(e) => handleEducation(resumeData, setResumeData, e, index)}
            />
          </div>
        </div>
      </div>
      <Button
        type="button"
        variant="destructive"
        size="icon"
        onClick={() => removeEducation(resumeData, setResumeData, index)}
        aria-label="Remove"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default Education;

