'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Payment page error:', error);
  }, [error]);

  const router = useRouter();

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="bg-red-50 border border-red-300 p-8 rounded-lg text-red-800">
        <h2 className="text-xl font-semibold mb-4">Something went wrong!</h2>
        <p className="mb-6">
          {error.message || 'An error occurred while loading the payment page.'}
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Try again
          </button>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 border border-red-300 text-red-700 rounded hover:bg-red-50 transition-colors"
          >
            Go back
          </button>
        </div>
      </div>
    </div>
  );
} 