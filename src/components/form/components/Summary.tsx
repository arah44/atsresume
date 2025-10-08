"use client";

import React from "react";
import { useResumeContext } from "@/context/ResumeContext";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Summary: React.FC = () => {
  const { resumeData, handleChange } = useResumeContext();

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label htmlFor="summary">Professional Summary</Label>
          <Textarea
            id="summary"
            placeholder="Summary"
            name="summary"
            className="min-h-[160px]"
            value={resumeData.summary}
            onChange={handleChange}
            maxLength={500}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default Summary;

