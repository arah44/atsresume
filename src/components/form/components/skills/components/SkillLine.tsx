"use client";

import React from "react";
import { handleSkill } from "../utlis/handleSkill";
import { useResumeContext } from "@/context/ResumeContext";
import { removeSkill } from "../utlis/removeSkill";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface SkillLineProps {
  skill: string;
  title: string;
  index: number;
}

const SkillLine: React.FC<SkillLineProps> = ({ skill, title, index }) => {
  const { resumeData, setResumeData } = useResumeContext();

  return (
    <div className="flex gap-2 items-center">
      <Input
        type="text"
        placeholder={title}
        name={title}
        value={skill}
        onChange={(e) => handleSkill(e, index, title, resumeData, setResumeData)}
      />
      <Button
        type="button"
        variant="destructive"
        size="icon"
        onClick={() => removeSkill(title, setResumeData, index)}
        aria-label="Remove"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default SkillLine;

