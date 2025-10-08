"use client";

import React from "react";
import { useResumeContext } from "@/context/ResumeContext";
import { addProject } from "../utils/addProject";
import Project from "../components/Project";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const Projects: React.FC = () => {
  const { resumeData, setResumeData } = useResumeContext();

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>Projects</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {resumeData.projects.map((project, index) => (
          <Project key={index} project={project} index={index} />
        ))}
        <Button
          type="button"
          onClick={() => addProject(resumeData, setResumeData)}
          aria-label="Add Project"
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Project
        </Button>
      </CardContent>
    </Card>
  );
};

export default Projects;

