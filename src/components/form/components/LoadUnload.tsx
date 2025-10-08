"use client";

import React from "react";
import { useResumeContext } from "@/context/ResumeContext";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Upload, Download } from "lucide-react";
import { Resume } from "@/types";

const LoadUnload: React.FC = () => {
  const { resumeData, setResumeData } = useResumeContext();

  // load backup resume data
  const handleLoad = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const loadedData = JSON.parse(e.target?.result as string) as Resume;
        setResumeData(loadedData);
      } catch (error) {
        console.error("Error parsing JSON:", error);
      }
    };
    reader.readAsText(file);
  };

  // download resume data
  const handleDownload = (
    data: Resume,
    filename: string,
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    const jsonData = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonData], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  return (
    <div className="flex flex-wrap gap-4 mb-4 justify-center items-center">
      <div className="flex items-center gap-2">
        <Label htmlFor="load-data" className="text-base font-medium cursor-pointer">
          Load Data
        </Label>
        <Label
          htmlFor="load-data"
          className="p-2 bg-primary text-primary-foreground rounded cursor-pointer hover:bg-primary/90 transition-colors"
        >
          <Upload className="h-5 w-5" />
          <Input
            id="load-data"
            type="file"
            className="hidden"
            onChange={handleLoad}
            accept=".json"
            aria-label="Load Data"
          />
        </Label>
      </div>
      <div className="flex items-center gap-2">
        <Label className="text-base font-medium">Save Data</Label>
        <Button
          onClick={(event) =>
            handleDownload(
              resumeData,
              `${resumeData.name} by ATSResume.json`,
              event
            )
          }
          aria-label="Save Data"
          size="icon"
        >
          <Download className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default LoadUnload;

