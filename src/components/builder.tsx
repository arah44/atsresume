'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from "next/link";
import { useRouter } from "next/navigation";
import Meta from "./meta/Meta";
import FormCloseOpenBtn from "./FormCloseOpenBtn";
import Preview from "./preview/ui/Preview";
import { ResumeProvider, useResumeContext } from "../context/ResumeContext";
import { ResumeStorageService } from "../services/resumeStorage";
import { useAutosave } from "../hooks/useAutosave";
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
import { Save } from "lucide-react";
import { toast } from "sonner";

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

  // Load initial resume if provided - ID should already be set
  useEffect(() => {
    if (initialResume) {
      console.log('📥 Loading resume with ID:', initialResume.id);

      if (!initialResume.id) {
        console.error('⚠️  WARNING: Resume loaded without ID!');
      }

      setResumeData(initialResume);
    }
  }, [initialResume, setResumeData]);

  // Autosave function - saves to the SAME ID every time
  const handleAutosave = useCallback((data: typeof resumeData) => {
    console.log('🎯 Autosave triggered');
    console.log('   - Resume ID:', data.id);
    console.log('   - Name:', data.name);

    if (!data.id) {
      console.error('❌ Cannot autosave: Resume has no ID!');
      throw new Error('Resume must have an ID to autosave');
    }

    try {
      // saveResumeById handles both regular and base resumes
      // It will OVERWRITE the existing resume based on ID
      const savedId = ResumeStorageService.saveResumeById(data);

      if (savedId === data.id) {
        console.log('✅ Autosaved successfully to:', savedId);
      } else {
        console.error('❌ ID MISMATCH after save!');
        console.error('   - Expected:', data.id);
        console.error('   - Got:', savedId);
      }
    } catch (error) {
      console.error('❌ Autosave failed:', error);
      throw error;
    }
  }, []);

  // Setup autosave with 4 second debounce
  console.log('🔧 Setting up autosave in BuilderContent');
  useAutosave({
    data: resumeData,
    onSave: handleAutosave,
    delay: 4000,
    enabled: true,
  });

  // Manual save (shows modal with shareable link)
  const handleSaveResume = () => {
    try {
      const savedId = ResumeStorageService.saveResumeById(resumeData);
      const url = ResumeStorageService.getResumeUrl(savedId);
      setSavedUrl(url);
      setShowSaveModal(true);
      toast.success('Resume saved successfully!');
    } catch (error) {
      console.error('Failed to save resume:', error);
      toast.error('Failed to save resume. Please try again.');
    }
  };

  return (
    <>
      <Meta
        title="ATSResume | Get hired with an ATS-optimized resume"
        description="ATSResume is a cutting-edge resume builder that helps job seekers create a professional, ATS-friendly resume in minutes. Our platform uses the latest technology to analyze and optimize your resume for maximum visibility and success with applicant tracking systems. Say goodbye to frustration and wasted time spent on manual resume formatting. Create your winning resume with ATSResume today and get noticed by employers."
        keywords="ATS-friendly, Resume optimization, Keyword-rich resume, Applicant Tracking System, ATS resume builder, ATS resume templates, ATS-compliant resume, ATS-optimized CV, ATS-friendly format, ATS resume tips, Resume writing services, Career guidance, Job search in India, Resume tips for India, Professional resume builder, Cover letter writing, Interview preparation, Job interview tips, Career growth, Online job applications, resume builder, free resume builder, resume ats, best free resume builder, resume creator, resume cv, resume design, resume editor, resume maker"
      />



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
                toast.success('Link copied to clipboard!');
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

      {/* Action Buttons */}
      <FormCloseOpenBtn formClose={formClose} setFormClose={setFormClose}/>
      {/* <Button
        aria-label="Save & Share Resume"
        onClick={handleSaveResume}
        className="fixed bottom-5 right-10 font-bold shadow-lg exclude-print"
        size="lg"
        title="Get shareable link"
      >
        <Save className="mr-2 w-5 h-5" />
        Save & Share
      </Button> */}

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
