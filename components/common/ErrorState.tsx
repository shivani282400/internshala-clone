'use client';
import React from 'react';

const ErrorState = ({ message, onRetry }: { message?: string; onRetry?: () => void }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center" role="alert">
    <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
      <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
      </svg>
    </div>
    <h2 className="text-base font-semibold mb-1">Failed to load internships</h2>
    <p className="text-sm text-[#9199A3] max-w-xs mb-5">{message ?? 'Something went wrong. Please try again.'}</p>
    {onRetry && (
      <button onClick={onRetry} className="px-4 py-2 bg-[#008BCA] text-white text-sm font-medium rounded-md hover:bg-[#0077b5]">
        Try again
      </button>
    )}
  </div>
);
export default ErrorState;
