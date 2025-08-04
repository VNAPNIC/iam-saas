'use client';

import Link from 'next/link';

interface TenantErrorPageProps {
  error: string;
  tenantPath?: string;
  onRetry?: () => void;
}

export default function TenantErrorPage({ error, tenantPath, onRetry }: TenantErrorPageProps) {
  const getErrorIcon = () => {
    if (error.includes('not found')) {
      return 'fas fa-search';
    }
    if (error.includes('network') || error.includes('failed to load')) {
      return 'fas fa-wifi';
    }
    return 'fas fa-exclamation-triangle';
  };

  const getErrorTitle = () => {
    if (error.includes('not found')) {
      return 'Organization Not Found';
    }
    if (error.includes('network') || error.includes('failed to load')) {
      return 'Connection Error';
    }
    return 'Something Went Wrong';
  };

  const getErrorDescription = () => {
    if (error.includes('not found')) {
      return 'The organization you&apos;re looking for doesn&apos;t exist or has been deactivated.';
    }
    if (error.includes('network') || error.includes('failed to load')) {
      return 'Unable to connect to the server. Please check your internet connection.';
    }
    return 'An unexpected error occurred. Please try again.';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 text-center">
          {/* Error Icon */}
          <div className="mb-6">
            <i className={`${getErrorIcon()} text-6xl text-red-500`}></i>
          </div>

          {/* Error Content */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {getErrorTitle()}
            </h1>
            <p className="text-gray-600 mb-4">
              {getErrorDescription()}
            </p>
            <p className="text-sm text-gray-500">
              Error: {error}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {onRetry && (
              <button
                onClick={onRetry}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <i className="fas fa-redo mr-2"></i>
                Try Again
              </button>
            )}
            
            {tenantPath && (
              <a
                href={`/${tenantPath}/login`}
                className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 inline-block"
              >
                <i className="fas fa-arrow-left mr-2"></i>
                Back to Login
              </a>
            )}
            
            <Link
              href="/"
              className="w-full bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 inline-block"
            >
              <i className="fas fa-home mr-2"></i>
              Go to Homepage
            </Link>
          </div>

          {/* Support Link */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Need help?{' '}
              <a 
                href="mailto:support@domain.xyz" 
                className="text-blue-500 hover:text-blue-700"
              >
                Contact Support
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}