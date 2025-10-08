"use client";

import React from "react";
import { handleProject } from "../utils/handleProject";
import { useResumeContext } from "@/context/ResumeContext";
import { removeProject } from "../utils/removeProject";
import { Project as ProjectType } from "@/types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface ProjectProps {
  project: ProjectType;
  index: number;
}

const Project: React.FC<ProjectProps> = ({ project, index }) => {
  const { resumeData, setResumeData } = useResumeContext();

  return (
    <div className="flex w-full gap-4 items-start p-4 border rounded-lg">
      <div className="flex-1 space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`name-${index}`}>Project Name</Label>
          <Input
            id={`name-${index}`}
            type="text"
            placeholder="Project Name"
            name="name"
            value={project.name}
            onChange={(e) => handleProject(resumeData, setResumeData, e, index)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`link-${index}`}>Link</Label>
          <Input
            id={`link-${index}`}
            type="text"
            placeholder="Link"
            name="link"
            value={project.link || ""}
            onChange={(e) => handleProject(resumeData, setResumeData, e, index)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`description-${index}`}>Description</Label>
          <Textarea
            id={`description-${index}`}
            placeholder="Description"
            name="description"
            className="min-h-[128px]"
            value={project.description}
            maxLength={250}
            onChange={(e) => handleProject(resumeData, setResumeData, e, index)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`technologies-${index}`}>Technologies</Label>
          <Input
            id={`technologies-${index}`}
            type="text"
            placeholder="Technologies (comma separated)"
            name="technologies"
            value={Array.isArray(project.technologies) ? project.technologies.join(", ") : ""}
            onChange={(e) => {
              const technologiesArray = e.target.value.split(",").map(t => t.trim());
              const newProjects = [...resumeData.projects];
              newProjects[index] = {
                ...newProjects[index],
                technologies: technologiesArray,
              };
              setResumeData({ ...resumeData, projects: newProjects });
            }}
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
              value={project.startYear}
              onChange={(e) =>
                handleProject(resumeData, setResumeData, e, index)
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
              value={project.endYear}
              onChange={(e) =>
                handleProject(resumeData, setResumeData, e, index)
              }
            />
          </div>
        </div>
      </div>
      <Button
        type="button"
        variant="destructive"
        size="icon"
        onClick={() => removeProject(resumeData, setResumeData, index)}
        aria-label="Remove"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default Project;

