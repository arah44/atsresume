'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getCacheStats, clearAllCache } from '@/app/actions/cacheActions';

export default function CachePage() {
  const [stats, setStats] = useState<{
    totalFiles: number;
    totalSize: number;
    byType: Record<string, number>;
  }>({ totalFiles: 0, totalSize: 0, byType: {} });
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    setLoading(true);
    const data = await getCacheStats();
    setStats(data);
    setLoading(false);
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleClearCache = async () => {
    if (confirm('Are you sure you want to clear all cache? This cannot be undone.')) {
      const deleted = await clearAllCache();
      alert(`Cleared ${deleted} cache files`);
      loadStats();
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="text-center">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading cache...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Cache Manager</h1>
          <p className="dashboard-subtitle">
            {stats.totalFiles} files • {formatSize(stats.totalSize)}
          </p>
        </div>
        <button onClick={handleClearCache} className="resume-card-delete-btn">
          🗑️ Clear All Cache
        </button>
      </div>

      {/* Cache Categories */}
      <div className="dashboard-grid">
        <Link href="/dashboard/cache/jobs" className="resume-card">
          <div className="resume-card-header">
            <div className="resume-card-content">
              <h3 className="resume-card-title">📋 Job Data</h3>
              <p className="resume-card-position">
                Job analyses & keywords
              </p>
            </div>
            <div className="text-2xl">→</div>
          </div>
          <div className="resume-card-meta">
            <div className="resume-card-meta-row">
              <span>Files:</span>
              <span>{(stats.byType['job-analysis'] || 0) + (stats.byType['keywords'] || 0)}</span>
            </div>
          </div>
        </Link>

        <Link href="/dashboard/cache/resumes" className="resume-card">
          <div className="resume-card-header">
            <div className="resume-card-content">
              <h3 className="resume-card-title">📄 Resume Data</h3>
              <p className="resume-card-position">
                Generated resumes & components
              </p>
            </div>
            <div className="text-2xl">→</div>
          </div>
          <div className="resume-card-meta">
            <div className="resume-card-meta-row">
              <span>Files:</span>
              <span>
                {(stats.byType['resume'] || 0) +
                 (stats.byType['resume-complete'] || 0) +
                 (stats.byType['summary'] || 0) +
                 (stats.byType['work-experience'] || 0) +
                 (stats.byType['skills'] || 0)}
              </span>
            </div>
          </div>
        </Link>

        <Link href="/dashboard/cache/person" className="resume-card">
          <div className="resume-card-header">
            <div className="resume-card-content">
              <h3 className="resume-card-title">👤 Person Data</h3>
              <p className="resume-card-position">
                Extracted person information
              </p>
            </div>
            <div className="text-2xl">→</div>
          </div>
          <div className="resume-card-meta">
            <div className="resume-card-meta-row">
              <span>Files:</span>
              <span>{stats.byType['person-data'] || 0}</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Cache Type Breakdown */}
      {Object.keys(stats.byType).length > 0 && (
        <div className="resume-view-content">
          <h2 className="text-lg font-semibold mb-4">Cache Breakdown by Type</h2>
          <div className="space-y-2">
            {Object.entries(stats.byType).map(([type, count]) => (
              <div key={type} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="font-mono text-sm">{type}</span>
                <span className="text-gray-600">{count} files</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

