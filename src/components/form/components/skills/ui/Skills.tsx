"use client";

import React from "react";
import { useResumeContext } from "@/context/ResumeContext";
import SkillsGroup from "../components/SkillsGroup";
import { addSkillGroup } from "../utlis/addSkillGroup";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const Skills: React.FC = () => {
  const { resumeData, setResumeData } = useResumeContext();

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>Skills</CardTitle>
      </CardHeader>
      <CardContent>
        {resumeData.skills.map((skill, index) => (
          <SkillsGroup title={skill.title} key={index} />
        ))}
        <div className="mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => addSkillGroup(setResumeData)}
            aria-label="Add Skill Group"
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Skill Group
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default Skills;

