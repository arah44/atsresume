'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import { useRouter } from "next/navigation";
import Meta from "./meta/Meta";
import FormCloseOpenBtn from "./FormCloseOpenBtn";
import Preview from "./preview/ui/Preview";
import { ResumeProvider, useResumeContext } from "../context/ResumeContext";
import { ResumeStorageService } from "../services/resumeStorage";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import dynamic from "next/dynamic";
import Form from "./form/ui/Form";

// server side rendering false
const Print = dynamic(() => import("./utility/WinPrint"), {
  ssr: false,
});

function BuilderContent({ initialResume }) {
  const router = useRouter();
  const { resumeData, setResumeData } = useResumeContext();
  const [formClose, setFormClose] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [savedUrl, setSavedUrl] = useState('');

  // Load initial resume if provided
  useEffect(() => {
    if (initialResume) {
      setResumeData(initialResume);
    }
  }, [initialResume, setResumeData]);

  const handleSaveResume = () => {
    try {
      const savedId = ResumeStorageService.saveResumeById(resumeData);
      const url = ResumeStorageService.getResumeUrl(savedId);
      setSavedUrl(url);
      setShowSaveModal(true);
    } catch (error) {
      console.error('Failed to save resume:', error);
      alert('Failed to save resume. Please try again.');
    }
  };

  return (
    <>
      <Meta
        title="ATSResume | Get hired with an ATS-optimized resume"
        description="ATSResume is a cutting-edge resume builder that helps job seekers create a professional, ATS-friendly resume in minutes. Our platform uses the latest technology to analyze and optimize your resume for maximum visibility and success with applicant tracking systems. Say goodbye to frustration and wasted time spent on manual resume formatting. Create your winning resume with ATSResume today and get noticed by employers."
        keywords="ATS-friendly, Resume optimization, Keyword-rich resume, Applicant Tracking System, ATS resume builder, ATS resume templates, ATS-compliant resume, ATS-optimized CV, ATS-friendly format, ATS resume tips, Resume writing services, Career guidance, Job search in India, Resume tips for India, Professional resume builder, Cover letter writing, Interview preparation, Job interview tips, Career growth, Online job applications, resume builder, free resume builder, resume ats, best free resume builder, resume creator, resume cv, resume design, resume editor, resume maker"
      />

      {/* Navigation Header */}
      <div className="exclude-print">
        <div>
          <Link href="/">
            ATSResume
          </Link>
          <div className="flex gap-2">
            <Button onClick={handleSaveResume} variant="default" size="default">
              💾 Save Resume
            </Button>
            <Button asChild variant="default">
              <Link href="/dashboard">
                📊 Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Save Success Dialog */}
      <Dialog open={showSaveModal} onOpenChange={setShowSaveModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Resume Saved! 🎉</DialogTitle>
            <DialogDescription>
              Your resume has been saved and can be accessed via this link:
            </DialogDescription>
          </DialogHeader>
          <div className="p-3 bg-gray-50 rounded border border-gray-200">
            <code className="text-xs text-blue-600 break-all">{savedUrl}</code>
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              onClick={() => {
                navigator.clipboard.writeText(savedUrl);
                alert('Link copied to clipboard!');
              }}
              variant="default"
              className="flex-1"
            >
              📋 Copy Link
            </Button>
            <Button
              onClick={() => {
                setShowSaveModal(false);
                router.push('/dashboard');
              }}
              variant="secondary"
              className="flex-1"
            >
              📊 View All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="gap-4 justify-evenly max-w-7xl f-col md:flex-row md:mx-auto md:h-screen">
        {!formClose && (
          <Form/>
        )}
        <Preview/>
      </div>
      <FormCloseOpenBtn formClose={formClose} setFormClose={setFormClose}/>
      <Print/>
    </>
  );
}

export default function Builder({ initialResume }) {
  return (
    <ResumeProvider>
      <BuilderContent initialResume={initialResume} />
    </ResumeProvider>
  );
}
