import React, { useState } from 'react';
import { useResumeContext } from '../../context/ResumeContext';
import { GenerationStatus } from '../../types';
import { saveResumeAction } from '@/app/actions/resumeActions';

export const ResumeGenerator: React.FC = () => {
  const {
    personData,
    targetJobData,
    generateResume,
    isGenerating,
    generationProgress,
    currentStep,
    error,
    currentGeneration,
    generationHistory,
    resumeData
  } = useResumeContext();

  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  const handleGenerate = async () => {
    if (!personData || !targetJobData) {
      alert('Please load both person.json and job.json files first');
      return;
    }

    try {
      // Note: This component uses the old context-based approach
      // TODO: Update to use new base resume flow or deprecate this component
      alert('This component needs to be updated. Please use the dashboard wizard instead.');
    } catch (err) {
      console.error('Resume generation failed:', err);
    }
  };

  const handleSaveResume = async () => {
    if (!resumeData.id) {
      alert('No resume to save. Please generate a resume first.');
      return;
    }

    try {
      const result = await saveResumeAction(resumeData);

      if (!result.success || !result.id) {
        throw new Error(result.error || 'Failed to save resume');
      }

      const url = `${window.location.origin}/resume/${result.id}`;
      setShareUrl(url);
      setShowShareModal(true);
    } catch (err) {
      console.error('Failed to save resume:', err);
      alert('Failed to save resume. Please try again.');
    }
  };

  const handleCopyShareUrl = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    }
  };

  const canGenerate = personData && targetJobData && !isGenerating;

  const getStatusColor = (status: GenerationStatus) => {
    switch (status) {
      case GenerationStatus.COMPLETED:
        return 'text-green-600';
      case GenerationStatus.FAILED:
        return 'text-red-600';
      case GenerationStatus.PENDING:
        return 'text-yellow-600';
      default:
        return 'text-blue-600';
    }
  };

  const getStatusIcon = (status: GenerationStatus) => {
    switch (status) {
      case GenerationStatus.COMPLETED:
        return '✅';
      case GenerationStatus.FAILED:
        return '❌';
      case GenerationStatus.PENDING:
        return '⏳';
      default:
        return '⚙️';
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm resume-generator">
      <h2 className="flex gap-2 items-center mb-4 text-2xl font-bold">
        🤖 AI Resume Generator
      </h2>

      {error && (
        <div className="p-4 mb-4 text-red-700 bg-red-50 rounded border-l-4 border-red-500 error-message">
          <p className="font-semibold">Error</p>
          <p className="mt-1 text-sm">{error}</p>
        </div>
      )}

      {/* Current Generation Status */}
      {currentGeneration && isGenerating && (
        <div className="p-4 mb-6 bg-blue-50 rounded-lg border border-blue-200 current-generation">
          <div className="flex justify-between items-center mb-3">
            <div>
              <p className="text-sm font-semibold text-blue-900">
                Generation ID: {currentGeneration.id.slice(0, 12)}...
              </p>
              <p className="text-xs text-blue-700">
                {currentGeneration.metadata?.jobTitle} at {currentGeneration.metadata?.company}
              </p>
            </div>
            <span className={`text-2xl ${getStatusColor(currentGeneration.status)}`}>
              {getStatusIcon(currentGeneration.status)}
            </span>
          </div>

          <div className="generation-progress">
            <div className="flex justify-between mb-2">
              <p className="text-sm font-medium text-blue-900">{currentStep}</p>
              <p className="text-sm font-medium text-blue-900">{generationProgress}%</p>
            </div>
            <div className="overflow-hidden h-3 bg-blue-100 rounded-full progress-bar">
              <div
                className="h-3 bg-blue-600 rounded-full transition-all duration-500 ease-out progress-fill"
                style={{ width: `${generationProgress}%` }}
              />
            </div>
          </div>

          {/* Step indicators */}
          <div className="grid grid-cols-2 gap-2 mt-4 text-xs md:grid-cols-3">
            {[
              { status: GenerationStatus.ANALYZING_JOB, label: 'Analyzing Job' },
              { status: GenerationStatus.EXTRACTING_KEYWORDS, label: 'Keywords' },
              { status: GenerationStatus.GENERATING_RESUME, label: 'Optimizing Resume' }
            ].map((step, idx) => {
              const isActive = currentGeneration.status === step.status;
              const isPast = Object.values(GenerationStatus).indexOf(currentGeneration.status) >
                            Object.values(GenerationStatus).indexOf(step.status);
              return (
                <div
                  key={idx}
                  className={`p-2 rounded ${
                    isActive
                      ? 'font-semibold text-blue-900 bg-blue-200'
                      : isPast
                      ? 'text-green-700 bg-green-100'
                      : 'text-gray-500 bg-gray-100'
                  }`}
                >
                  {isPast && '✓ '}{step.label}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Generation Controls */}
      <div className="mb-4 generation-controls">
        <button
          onClick={handleGenerate}
          disabled={!canGenerate}
          className={`w-full px-6 py-3 rounded-lg font-medium transition-colors ${
            canGenerate
              ? 'text-white bg-gradient-to-r from-blue-600 to-blue-700 shadow-md hover:from-blue-700 hover:to-blue-800 hover:shadow-lg'
              : 'text-gray-500 bg-gray-300 cursor-not-allowed'
          }`}
        >
          {isGenerating ? (
            <span className="flex gap-2 justify-center items-center">
              <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Generating Resume...
            </span>
          ) : (
            '✨ Generate AI-Optimized Resume'
          )}
        </button>
      </div>

      {/* Data Status */}
      <div className="mb-4 data-status">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className={`p-3 rounded-lg border ${personData ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex gap-2 items-center">
              <span className="text-xl">{personData ? '✅' : '⭕'}</span>
              <div>
                <p className={`font-medium ${personData ? 'text-green-800' : 'text-gray-600'}`}>
                  Person Data
                </p>
                {personData && (
                  <p className="text-xs text-green-600">
                    {personData.name || 'Loaded'}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className={`p-3 rounded-lg border ${targetJobData ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex gap-2 items-center">
              <span className="text-xl">{targetJobData ? '✅' : '⭕'}</span>
              <div>
                <p className={`font-medium ${targetJobData ? 'text-green-800' : 'text-gray-600'}`}>
                  Target Job
                </p>
                {targetJobData && (
                  <p className="text-xs text-green-600">
                    {targetJobData.name || 'Loaded'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Current Resume ID & Share */}
      {resumeData.id && (
        <div className="p-4 mt-6 bg-gray-50 rounded-lg border border-gray-200 resume-id-display">
          <div className="flex justify-between items-center mb-3">
            <div className="flex-1 min-w-0">
              <p className="mb-1 text-xs font-semibold text-gray-700">Current Resume ID</p>
              <code className="font-mono text-xs text-gray-900 break-all">
                {resumeData.id}
              </code>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(resumeData.id!)}
              className="px-3 py-1 ml-3 text-xs text-gray-700 bg-gray-200 rounded transition-colors hover:bg-gray-300"
              title="Copy ID"
            >
              📋 Copy
            </button>
          </div>

          {/* Save & Share Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleSaveResume}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
            >
              💾 Save Resume
            </button>
            <button
              onClick={() => {
                const url = `${window.location.origin}/resume/${resumeData.id}`;
                navigator.clipboard.writeText(url);
                alert('Share link copied to clipboard!');
              }}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium"
            >
              🔗 Copy Share Link
            </button>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && shareUrl && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowShareModal(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-4">Resume Saved Successfully! 🎉</h3>
            <p className="text-sm text-gray-600 mb-4">
              Your resume has been saved and can be accessed via this link:
            </p>
            <div className="p-3 bg-gray-50 rounded border border-gray-200 mb-4">
              <code className="text-xs break-all text-blue-600">{shareUrl}</code>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCopyShareUrl}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                📋 Copy Link
              </button>
              <button
                onClick={() => window.open(shareUrl, '_blank')}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                👁️ View Resume
              </button>
            </div>
            <button
              onClick={() => setShowShareModal(false)}
              className="w-full mt-3 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Generation History */}
      {generationHistory.length > 0 && (
        <div className="pt-6 mt-6 border-t border-gray-200 generation-history">
          <h3 className="mb-3 text-sm font-semibold text-gray-700">Recent Generations</h3>
          <div className="overflow-y-auto space-y-2 max-h-60">
            {generationHistory.slice(0, 5).map((gen) => (
              <div
                key={gen.id}
                className="p-3 bg-gray-50 rounded-lg border border-gray-200 transition-colors hover:bg-gray-100"
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 truncate">
                      {gen.metadata?.jobTitle} at {gen.metadata?.company}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(gen.createdAt).toLocaleString()}
                      {gen.metadata?.duration && ` • ${(gen.metadata.duration / 1000).toFixed(1)}s`}
                    </p>
                    {gen.result?.id && (
                      <p className="mt-1 font-mono text-xs text-gray-400 truncate">
                        ID: {gen.result.id.slice(0, 20)}...
                      </p>
                    )}
                  </div>
                  <span className={`ml-3 text-lg ${getStatusColor(gen.status)}`}>
                    {getStatusIcon(gen.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};