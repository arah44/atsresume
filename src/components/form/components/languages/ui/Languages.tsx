"use client";

import React from "react";
import { useResumeContext } from "@/context/ResumeContext";
import { addLanguage } from "../utils/addLanguage";
import LanguageLine from "../components/LanguageLine";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const Languages: React.FC = () => {
  const { resumeData, setResumeData } = useResumeContext();

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>Languages</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {resumeData.languages.map((lang, index) => (
          <LanguageLine
            key={index}
            lang={lang}
            resumeData={resumeData}
            setResumeData={setResumeData}
            index={index}
          />
        ))}
        <Button
          type="button"
          onClick={() => addLanguage(resumeData, setResumeData, "languages")}
          aria-label="Add Language"
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Language
        </Button>
      </CardContent>
    </Card>
  );
};

export default Languages;

