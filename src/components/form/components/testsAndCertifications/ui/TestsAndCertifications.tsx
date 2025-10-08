"use client";

import React from "react";
import { useResumeContext } from "@/context/ResumeContext";
import { addCertificate } from "../utils/addCertificate";
import TestAndCertificateLine from "../components/TestAndCertificateLine";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const TestsAndCertifications: React.FC = () => {
  const { resumeData, setResumeData } = useResumeContext();
  const title = "Tests & Certifications";

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {resumeData.certifications.map((cert, index) => (
          <TestAndCertificateLine
            key={index}
            resumeData={resumeData}
            setResumeData={setResumeData}
            cert={cert}
            index={index}
          />
        ))}
        <Button
          type="button"
          onClick={() => addCertificate(resumeData, setResumeData)}
          aria-label="Add Certification"
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Certification
        </Button>
      </CardContent>
    </Card>
  );
};

export default TestsAndCertifications;

