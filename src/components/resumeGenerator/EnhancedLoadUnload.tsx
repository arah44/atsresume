import React, { useCallback, useState, useEffect } from 'react';
import { FaCloudUploadAlt, FaCloudDownloadAlt, FaFileImport, FaFileExport } from "react-icons/fa";
import { useResumeContext } from '../../context/ResumeContext';

export const EnhancedLoadUnload: React.FC = () => {
  const {
    resumeData,
    setResumeData,
    personData,
    jobData,
    saveResumeData,
    loadPersonData,
    loadJobData,
    syncPersonAndJobToResume
  } = useResumeContext();

  // Track if component has mounted to avoid hydration mismatch
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Legacy load function (for backward compatibility)
  const handleLoad = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const resumeData = JSON.parse(event.target?.result as string);
        setResumeData(resumeData);
      } catch (error) {
        console.error('Failed to load resume data:', error);
        alert('Invalid resume data file format');
      }
    };
    reader.readAsText(file);
  }, [setResumeData]);

  // Load person data
  const handleLoadPerson = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await loadPersonData(file);
    } catch (error) {
      console.error('Failed to load person data:', error);
    }
  }, [loadPersonData]);

  // Load job data
  const handleLoadJob = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await loadJobData(file);
    } catch (error) {
      console.error('Failed to load job data:', error);
    }
  }, [loadJobData]);

  // Save person data
  const handleSavePerson = useCallback(() => {
    if (!personData) {
      alert('No person data to save');
      return;
    }

    const dataStr = JSON.stringify(personData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${personData.name.replace(/\s+/g, '_')}_person.json`;
    link.click();

    URL.revokeObjectURL(url);
  }, [personData]);

  // Save job data
  const handleSaveJob = useCallback(() => {
    if (!jobData) {
      alert('No job data to save');
      return;
    }

    const dataStr = JSON.stringify(jobData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${jobData.targetPosition.replace(/\s+/g, '_')}_job.json`;
    link.click();

    URL.revokeObjectURL(url);
  }, [jobData]);

  // Generate resume from person + job data
  const handleGenerateResume = useCallback(() => {
    if (!personData || !jobData) {
      alert('Please load both person.json and job.json files first');
      return;
    }

    syncPersonAndJobToResume();
  }, [personData, jobData, syncPersonAndJobToResume]);

  return (
    <div className="enhanced-load-unload">
      {/* Legacy Resume Data Section */}


      {/* New Person + Job Data Section */}
      <div className="p-4 mb-4 bg-blue-50 rounded new-data-section">
        <h3 className="mb-2 text-lg font-semibold">🔄 Person + Job Data</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Person Data */}
          <div className="person-controls">
            <h4 className="mb-2 text-sm font-medium">Personal Data</h4>
            <div className="flex gap-2">
              <label className="p-2 text-white bg-blue-600 rounded cursor-pointer">
                <FaFileImport className="text-sm text-white" />
                <input
                  type="file"
                  className="hidden"
                  onChange={handleLoadPerson}
                  accept=".json"
                />
              </label>
              <button
                onClick={handleSavePerson}
                disabled={!personData}
                className="p-2 text-white bg-green-600 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <FaFileExport className="text-sm text-white" />
              </button>
            </div>
            {isMounted && personData && (
              <p className="mt-1 text-xs text-green-600">✓ {personData.name}</p>
            )}
          </div>

          {/* Job Data */}
          <div className="job-controls">
            <h4 className="mb-2 text-sm font-medium">Job Data</h4>
            <div className="flex gap-2">
              <label className="p-2 text-white bg-blue-600 rounded cursor-pointer">
                <FaFileImport className="text-sm text-white" />
                <input
                  type="file"
                  className="hidden"
                  onChange={handleLoadJob}
                  accept=".json"
                />
              </label>
              <button
                onClick={handleSaveJob}
                disabled={!jobData}
                className="p-2 text-white bg-green-600 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <FaFileExport className="text-sm text-white" />
              </button>
            </div>
            {isMounted && jobData && (
              <p className="mt-1 text-xs text-green-600">✓ {jobData.targetPosition}</p>
            )}
          </div>
        </div>

        {/* Generate Resume Button */}
        <div className="mt-4 text-center">
          <button
            onClick={handleGenerateResume}
            disabled={!personData || !jobData}
            className="px-4 py-2 text-white bg-purple-600 rounded hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            🔄 Generate Resume from Person + Job
          </button>
        </div>
      </div>
    </div>
  );
};