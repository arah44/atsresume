"use client"

import React, { createContext, useState, useCallback, useContext } from "react";
import { ResumeContextType, Resume } from "../types";
import DefaultResumeData from "../components/utility/DefaultResumeData";

// Create the context
const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

// Provider component
export const ResumeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Resume editing state (no localStorage sync - MongoDB is source of truth)
  const [resumeData, setResumeData] = useState<Resume>(DefaultResumeData);

  // Generation state (for UI feedback only)
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handler for input changes
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setResumeData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  // Handler for profile picture upload
  const handleProfilePicture = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setResumeData(prev => ({
          ...prev,
          profilePicture: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const contextValue: ResumeContextType = {
    // Resume editing state
    resumeData,
    setResumeData,

    // Generation state (for UI feedback only)
    isGenerating,
    error,

    // Form handlers
    handleChange,
    handleProfilePicture,
  };

  return (
    <ResumeContext.Provider value={contextValue}>
      {children}
    </ResumeContext.Provider>
  );
};

// Hook to use the context
export const useResumeContext = () => {
  const context = useContext(ResumeContext);
  if (context === undefined) {
    throw new Error('useResumeContext must be used within a ResumeProvider');
  }
  return context;
};