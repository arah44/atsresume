"use client";

import React from "react";
import { handleLanguage } from "../utils/handleLanguage";
import { removeLanguage } from "../utils/removeLanguage";
import { Resume } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface LanguageLineProps {
  resumeData: Resume;
  setResumeData: (resume: Resume) => void;
  lang: string;
  index: number;
}

const LanguageLine: React.FC<LanguageLineProps> = ({
  resumeData,
  setResumeData,
  lang,
  index,
}) => {
  return (
    <div className="flex gap-2 items-center">
      <Input
        type="text"
        placeholder="Language"
        name="language"
        value={lang}
        onChange={(e) =>
          handleLanguage(resumeData, setResumeData, e, index, "languages")
        }
      />
      <Button
        type="button"
        variant="destructive"
        size="icon"
        onClick={() => removeLanguage(resumeData, setResumeData, index)}
        aria-label="Remove"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default LanguageLine;

