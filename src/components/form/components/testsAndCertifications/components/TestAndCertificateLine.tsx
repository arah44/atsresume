"use client";

import React from "react";
import { handleCertificate } from "../utils/handleCertificate";
import { removeCertificate } from "../utils/removeCertificate";
import { Resume } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface TestAndCertificateLineProps {
  resumeData: Resume;
  setResumeData: (resume: Resume) => void;
  cert: string;
  index: number;
}

const TestAndCertificateLine: React.FC<TestAndCertificateLineProps> = ({
  resumeData,
  setResumeData,
  cert,
  index,
}) => {
  return (
    <div className="flex gap-2 items-center">
      <Input
        type="text"
        placeholder="Test or certificate"
        name="Certificate"
        value={cert}
        onChange={(e) => handleCertificate(resumeData, setResumeData, e, index)}
      />
      <Button
        type="button"
        variant="destructive"
        size="icon"
        onClick={() => removeCertificate(resumeData, setResumeData, index)}
        aria-label="Remove"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default TestAndCertificateLine;

