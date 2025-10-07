import React, { useCallback } from 'react';
import { useResumeContext } from '../../context/ResumeContext';

interface FileUploadProps {
  type: 'person' | 'job';
  onDataLoaded?: () => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ type, onDataLoaded }) => {
  const { loadPersonData, loadJobData, error } = useResumeContext();

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      if (type === 'person') {
        await loadPersonData(file);
      } else {
        await loadJobData(file);
      }
      onDataLoaded?.();
    } catch (err) {
      console.error(`Failed to load ${type} data:`, err);
    }
  }, [type, loadPersonData, loadJobData, onDataLoaded]);

  const fileType = type === 'person' ? 'person.json' : 'job.json';
  const label = type === 'person' ? 'Personal Data' : 'Job Data';

  return (
    <div className="file-upload">
      <label htmlFor={`${type}-file`} className="upload-label">
        📁 Upload {label} ({fileType})
      </label>
      <input
        id={`${type}-file`}
        type="file"
        accept=".json"
        onChange={handleFileUpload}
        className="file-input"
      />
      {error && (
        <div className="error-message">
          <p>Error: {error}</p>
        </div>
      )}
    </div>
  );
};