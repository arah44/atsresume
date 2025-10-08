"use client";

import React from "react";
import { handleWorkExperience } from "../units/handleWorkExperience";
import { useResumeContext } from "@/context/ResumeContext";
import { removeWorkExperience } from "../units/removeResumeExperience";
import { WorkExperience as WorkExperienceType } from "@/types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface WorkExperienceProps {
  workExperience: WorkExperienceType;
  index: number;
}

const WorkExperience: React.FC<WorkExperienceProps> = ({
  workExperience,
  index,
}) => {
  const { resumeData, setResumeData } = useResumeContext();

  return (
    <div className="flex w-full gap-4 items-start p-4 border rounded-lg">
      <div className="flex-1 space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`company-${index}`}>Company</Label>
          <Input
            id={`company-${index}`}
            type="text"
            placeholder="Company"
            name="company"
            value={workExperience.company}
            onChange={(e) =>
              handleWorkExperience(resumeData, setResumeData, e, index)
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`position-${index}`}>Job Title</Label>
          <Input
            id={`position-${index}`}
            type="text"
            placeholder="Job Title"
            name="position"
            value={workExperience.position}
            onChange={(e) =>
              handleWorkExperience(resumeData, setResumeData, e, index)
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`description-${index}`}>Description</Label>
          <Textarea
            id={`description-${index}`}
            placeholder="Description"
            name="description"
            className="min-h-[128px]"
            value={workExperience.description}
            maxLength={250}
            onChange={(e) =>
              handleWorkExperience(resumeData, setResumeData, e, index)
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`keyAchievements-${index}`}>Key Achievements</Label>
          <Textarea
            id={`keyAchievements-${index}`}
            placeholder="Key Achievements"
            name="keyAchievements"
            className="min-h-[160px]"
            value={workExperience.keyAchievements}
            onChange={(e) =>
              handleWorkExperience(resumeData, setResumeData, e, index)
            }
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
              value={workExperience.startYear}
              onChange={(e) =>
                handleWorkExperience(resumeData, setResumeData, e, index)
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`endYear-${index}`}>End Date</Label>
            <Input
              id={`endYear-${index}`}
              type="date"
              placeholder="End Year"
              name="endYear"
              value={workExperience.endYear}
              onChange={(e) =>
                handleWorkExperience(resumeData, setResumeData, e, index)
              }
            />
          </div>
        </div>
      </div>
      <Button
        type="button"
        variant="destructive"
        size="icon"
        onClick={() => removeWorkExperience(resumeData, setResumeData, index)}
        aria-label="Remove"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default WorkExperience;

